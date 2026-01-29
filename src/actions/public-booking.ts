'use server';

import { db } from '@/db/db';
import { Selectable } from 'kysely';
import { Organizations, Services, MemberWeeklySchedules, MemberScheduleOverrides } from '@/types/db';
import { Booking, BookingStatus } from '@/types/booking';
import { createSafeAction, ok, err } from '@/lib/safe-action';
import { z } from 'zod';
import { getAvailableSlots as getAvailableSlotsService } from '@/lib/services/availability';

export type Organization = Selectable<Organizations>;
export type Service = Selectable<Services>;
export type WeeklySchedule = Selectable<MemberWeeklySchedules>;
export type ScheduleOverride = Selectable<MemberScheduleOverrides>;

// ============ Schemas ============

const getOrganizationSchema = z.string();
const getServicesSchema = z.string();

const getSlotsSchema = z.object({
  organizationId: z.string(),
  serviceId: z.string(),
  memberId: z.string().optional(),
  date: z.coerce.date(), // Accepts Date objects or ISO strings
});

const createBookingSchema = z.object({
  organizationId: z.string(),
  serviceId: z.string(),
  memberId: z.string().optional(),
  startTime: z.coerce.date(), // Accepts Date objects or ISO strings
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  notes: z.string().optional(),
});

// ============ Public Data Fetching ============

export const getOrganizationBySlug = createSafeAction({
  schema: getOrganizationSchema,
  requireAuth: false,
  handler: async ({ data: slug }) => {
    const organization = await db
      .selectFrom('organizations')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    if (!organization) return err('Organization not found', 'NOT_FOUND');
    return ok(organization);
  }
});

export const getPublicServices = createSafeAction({
  schema: getServicesSchema,
  requireAuth: false,
  handler: async ({ data: organizationId }) => {
    const services = await db
      .selectFrom('services')
      .selectAll()
      .where('organizationId', '=', organizationId)
      .where('isActive', '=', true)
      .orderBy('name', 'asc')
      .execute();

    return ok(services);
  }
});

// ============ Time Slot Generation ============

// Keep this helper exported for UI if needed, or internal
export async function getAvailableStaff(organizationId: string, serviceId: string) {
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

export const getAvailableSlots = createSafeAction({
  schema: getSlotsSchema,
  requireAuth: false,
  handler: async ({ data }) => {
    const slots = await getAvailableSlotsService({
      organizationId: data.organizationId,
      serviceId: data.serviceId,
      memberId: data.memberId,
      date: data.date,
    });

    return ok(slots);
  }
});

// ============ Booking Creation ============

// Helper locally
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export const createPublicBooking = createSafeAction({
  schema: createBookingSchema,
  requireAuth: false,
  handler: async ({ data }) => {
    const { organizationId, serviceId, startTime, customerName, customerPhone, notes } = data;
    let { memberId } = data;

    // Normalize phone for ban check
    const normalizedPhone = normalizePhone(customerPhone);

    // Check if customer is banned
    const bannedCustomers = await db
      .selectFrom('bannedCustomers')
      .select(['customerPhone', 'reason', 'bannedUntil'])
      .where('organizationId', '=', organizationId)
      .execute();

    const banMatch = bannedCustomers.find(
      (b) => normalizePhone(b.customerPhone) === normalizedPhone
    );

    if (banMatch) {
      if (!banMatch.bannedUntil || new Date(banMatch.bannedUntil) > new Date()) {
        return err('Using this phone number for booking is currently restricted.', 'BANNED');
      }
    }

    // Get service details
    const service = await db
      .selectFrom('services')
      .select(['durationMin', 'priceCents', 'name'])
      .where('id', '=', serviceId)
      .executeTakeFirst();

    if (!service) {
      return err('Service not found', 'NOT_FOUND');
    }

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.durationMin);

    // Auto-assign member if not provided
    if (!memberId) {
      // Re-use logic: check availability for "any" using the SERVICE directly
      const slots = await getAvailableSlotsService({
        organizationId,
        serviceId,
        memberId: undefined, // check all
        date: startTime, // optimize: this fetches whole day
      });

      const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
      const relevantSlot = slots.find(s => s.time === timeStr);

      if (!relevantSlot) {
        return err('No staff available at this time', 'UNAVAILABLE');
      }
      memberId = relevantSlot.memberId;
    }

    try {
      const booking = await db
        .insertInto('bookings')
        .values({
          organizationId,
          serviceId,
          memberId: memberId!, // exact member determined above
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

      return ok({
        booking: booking as Booking,
        service: {
          name: service.name,
          durationMin: service.durationMin,
          priceCents: service.priceCents,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('no_overlapping_bookings')) {
        return err('This time slot is no longer available. Please choose another time.', 'CONFLICT');
      }
      throw error;
    }
  }
});

