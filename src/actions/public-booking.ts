'use server';

import { db } from '@/db/db';
import { Selectable } from 'kysely';
import { Organizations, Services, MemberWeeklySchedules, MemberScheduleOverrides } from '@/types/db';
import { Booking, BookingStatus } from '@/types/booking';

export type Organization = Selectable<Organizations>;
export type Service = Selectable<Services>;
export type WeeklySchedule = Selectable<MemberWeeklySchedules>;
export type ScheduleOverride = Selectable<MemberScheduleOverrides>;

// ============ Public Data Fetching ============

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const organization = await db
    .selectFrom('organizations')
    .selectAll()
    .where('slug', '=', slug)
    .executeTakeFirst();

  return organization || null;
}

export async function getPublicServices(organizationId: string): Promise<Service[]> {
  const services = await db
    .selectFrom('services')
    .selectAll()
    .where('organizationId', '=', organizationId)
    .where('isActive', '=', true)
    .orderBy('name', 'asc')
    .execute();

  return services;
}

export async function getAvailableStaff(organizationId: string, serviceId: string) {
  // Get members who offer this service
  const staffWithService = await db
    .selectFrom('memberServices')
    .innerJoin('members', 'members.id', 'memberServices.memberId')
    .innerJoin('users', 'users.id', 'members.userId')
    .select([
      'members.id as memberId',
      'users.name as name',
      'users.image as image',
    ])
    .where('memberServices.serviceId', '=', serviceId)
    .where('members.organizationId', '=', organizationId)
    .execute();

  return staffWithService;
}

// ============ Time Slot Generation ============

interface SlotParams {
  organizationId: string;
  serviceId: string;
  memberId?: string;
  date: Date;
}

export async function getAvailableSlots(params: SlotParams) {
  const { organizationId, serviceId, memberId, date } = params;

  // Get service duration
  const service = await db
    .selectFrom('services')
    .select(['durationMin'])
    .where('id', '=', serviceId)
    .executeTakeFirst();

  if (!service) {
    return [];
  }

  const duration = service.durationMin;
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Get the date boundaries for querying
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // If a specific member is selected, get their availability
  // Otherwise, get all members who can perform this service
  let memberIds: string[] = [];

  if (memberId) {
    memberIds = [memberId];
  } else {
    const staff = await getAvailableStaff(organizationId, serviceId);
    memberIds = staff.map((s) => s.memberId);
  }

  if (memberIds.length === 0) {
    return [];
  }

  // Collect all available slots across all relevant members
  const allSlots: { time: string; memberId: string }[] = [];

  for (const mId of memberIds) {
    const memberSlots = await getMemberAvailableSlots(mId, dayOfWeek, dayStart, dayEnd, duration);
    memberSlots.forEach((time) => {
      allSlots.push({ time, memberId: mId });
    });
  }

  // Deduplicate slots by time (for "Any Available" we just need unique times)
  if (!memberId) {
    const uniqueTimes = [...new Set(allSlots.map((s) => s.time))];
    return uniqueTimes.sort().map((time) => ({ time, memberId: null }));
  }

  return allSlots.sort((a, b) => a.time.localeCompare(b.time));
}

async function getMemberAvailableSlots(
  memberId: string,
  dayOfWeek: number,
  dayStart: Date,
  dayEnd: Date,
  serviceDuration: number
): Promise<string[]> {
  // 1. Get member's weekly schedule for this day
  const schedules = await db
    .selectFrom('memberWeeklySchedules')
    .select(['startTime', 'endTime'])
    .where('memberId', '=', memberId)
    .where('dayOfWeek', '=', dayOfWeek)
    .execute();

  if (schedules.length === 0) {
    return []; // Member doesn't work this day
  }

  // 2. Check for overrides (day off, time off, etc.)
  const overrides = await db
    .selectFrom('memberScheduleOverrides')
    .selectAll()
    .where('memberId', '=', memberId)
    .where('date', '>=', dayStart)
    .where('date', '<=', dayEnd)
    .execute();

  // If there's a day_off override, no slots available
  const hasDayOff = overrides.some((o) => o.type === 'day_off');
  if (hasDayOff) {
    return [];
  }

  // 3. Get existing bookings for this member on this date
  const existingBookings = await db
    .selectFrom('bookings')
    .select(['startTime', 'endTime'])
    .where('memberId', '=', memberId)
    .where('startTime', '>=', dayStart)
    .where('endTime', '<=', dayEnd)
    .where('status', 'in', ['pending', 'confirmed'])
    .execute();

  // 4. Generate all possible slots from schedule
  const slots: string[] = [];

  for (const schedule of schedules) {
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + serviceDuration <= endMinutes) {
      const slotHour = Math.floor(currentMinutes / 60);
      const slotMin = currentMinutes % 60;
      const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;

      // Check if this slot conflicts with existing bookings
      const slotStart = new Date(dayStart);
      slotStart.setHours(slotHour, slotMin, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);

      const hasConflict = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        // Overlap check: slot overlaps if it starts before booking ends AND ends after booking starts
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      // Check time_off overrides
      const hasTimeOffConflict = overrides
        .filter((o) => o.type === 'time_off' && o.startTime && o.endTime)
        .some((o) => {
          const [offStartH, offStartM] = o.startTime!.split(':').map(Number);
          const [offEndH, offEndM] = o.endTime!.split(':').map(Number);
          const offStartMinutes = offStartH * 60 + offStartM;
          const offEndMinutes = offEndH * 60 + offEndM;
          const slotStartMinutes = slotHour * 60 + slotMin;
          const slotEndMinutes = slotStartMinutes + serviceDuration;
          return slotStartMinutes < offEndMinutes && slotEndMinutes > offStartMinutes;
        });

      if (!hasConflict && !hasTimeOffConflict) {
        slots.push(slotTime);
      }

      // Move to next slot (30 min intervals)
      currentMinutes += 30;
    }
  }

  return slots;
}

// ============ Booking Creation ============

interface CreateBookingParams {
  organizationId: string;
  serviceId: string;
  memberId?: string;
  startTime: Date;
  customerName: string;
  customerPhone: string;
  notes?: string;
}

// Helper to normalize phone numbers for comparison (removes all non-digit chars)
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export type CreateBookingResult =
  | { success: true; booking: Booking; service: { name: string; durationMin: number; priceCents: number } }
  | { success: false; error: string };

export async function createPublicBooking(params: CreateBookingParams): Promise<CreateBookingResult> {
  const { organizationId, serviceId, startTime, customerName, customerPhone, notes } = params;
  let { memberId } = params;

  // Normalize phone for ban check
  const normalizedPhone = normalizePhone(customerPhone);

  // Check if customer is banned - get all banned phones and compare normalized
  const bannedCustomers = await db
    .selectFrom('bannedCustomers')
    .select(['customerPhone', 'reason', 'bannedUntil'])
    .where('organizationId', '=', organizationId)
    .execute();

  const banMatch = bannedCustomers.find(
    (b) => normalizePhone(b.customerPhone) === normalizedPhone
  );

  if (banMatch) {
    // Check if ban has expired
    if (!banMatch.bannedUntil || new Date(banMatch.bannedUntil) > new Date()) {
      return { success: false, error: 'Using this phone number for booking is currently restricted.' };
    }
  }

  // Get service details
  const service = await db
    .selectFrom('services')
    .select(['durationMin', 'priceCents', 'name'])
    .where('id', '=', serviceId)
    .executeTakeFirst();

  if (!service) {
    return { success: false, error: 'Service not found' };
  }

  // Calculate end time
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + service.durationMin);

  // If no specific member selected, pick one who can do the service and is available
  if (!memberId) {
    const staff = await getAvailableStaff(organizationId, serviceId);
    if (staff.length === 0) {
      return { success: false, error: 'No staff available for this service' };
    }

    // Find a staff member who is available at this time
    for (const s of staff) {
      const dayStart = new Date(startTime);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(startTime);
      dayEnd.setHours(23, 59, 59, 999);

      const slots = await getMemberAvailableSlots(
        s.memberId,
        startTime.getDay(),
        dayStart,
        dayEnd,
        service.durationMin
      );

      const slotTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
      if (slots.includes(slotTime)) {
        memberId = s.memberId;
        break;
      }
    }

    if (!memberId) {
      return { success: false, error: 'No staff available at this time' };
    }
  }

  // Create the booking - the Postgres EXCLUDE constraint prevents double-bookings
  try {
    const booking = await db
      .insertInto('bookings')
      .values({
        organizationId,
        serviceId,
        memberId,
        startTime,
        endTime,
        customerName,
        customerPhone,
        notes: notes || null,
        priceAtBooking: service.priceCents,
        status: 'pending',
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      success: true,
      booking: booking as Booking,
      service: {
        name: service.name,
        durationMin: service.durationMin,
        priceCents: service.priceCents,
      },
    };
  } catch (error: unknown) {
    // Handle the exclusion constraint violation (overlapping bookings)
    if (error instanceof Error && error.message.includes('no_overlapping_bookings')) {
      return { success: false, error: 'This time slot is no longer available. Please choose another time.' };
    }
    // Re-throw unexpected errors
    throw error;
  }
}
