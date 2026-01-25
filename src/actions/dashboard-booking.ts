'use server';

import { db } from '@/db/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Booking, BookingStatus } from '@/types/booking';

async function getSessionInfo() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId || !session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId: session.session.activeOrganizationId },
  });

  const currentMember = members?.members?.find(
    (m: { userId: string }) => m.userId === session.user.id
  );

  return {
    organizationId: session.session.activeOrganizationId,
    userId: session.user.id,
    memberId: currentMember?.id || null,
    role: (currentMember?.role as 'owner' | 'admin' | 'member') || null,
  };
}

export interface CreateDashboardBookingParams {
  serviceId: string;
  memberId: string;
  startTime: Date;
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export async function createDashboardBooking(params: CreateDashboardBookingParams) {
  const { organizationId, role } = await getSessionInfo();

  // Only owner/admin can create appointments from dashboard
  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Only owners and admins can create appointments');
  }

  const { serviceId, memberId, startTime, customerName, customerPhone, notes } = params;

  // Get service details
  const service = await db
    .selectFrom('services')
    .select(['durationMin', 'priceCents', 'name'])
    .where('id', '=', serviceId)
    .where('organizationId', '=', organizationId)
    .executeTakeFirst();

  if (!service) {
    throw new Error('Service not found');
  }

  // Calculate end time
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + service.durationMin);

  // Check for conflicts
  const existingBookings = await db
    .selectFrom('bookings')
    .select(['id'])
    .where('memberId', '=', memberId)
    .where('startTime', '<', endTime)
    .where('endTime', '>', startTime)
    .where('status', 'in', ['pending', 'confirmed'] as BookingStatus[])
    .executeTakeFirst();

  if (existingBookings) {
    throw new Error('This time slot conflicts with an existing appointment.');
  }

  // Create the booking
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
      status: 'confirmed', // Dashboard bookings are auto-confirmed
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/calendar');

  return {
    booking: booking as Booking,
    service: {
      name: service.name,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
    },
  };
}

// Get staff members with their services for the appointment form
export async function getStaffForAppointmentForm() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId) {
    throw new Error('No active organization');
  }

  const organizationId = session.session.activeOrganizationId;

  // Get all members
  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId },
  });

  // Get member services
  const memberServices = await db
    .selectFrom('memberServices')
    .select(['memberId', 'serviceId'])
    .execute();

  // Map members with their services
  const staffWithServices = members?.members?.map((member) => ({
    id: member.id,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    serviceIds: memberServices
      .filter((ms) => ms.memberId === member.id)
      .map((ms) => ms.serviceId),
  })) || [];

  return staffWithServices;
}
