'use server';

import { db } from '@/db/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Booking, BookingFilters, BookingStatus } from '@/types/booking';

async function getSessionInfo() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId || !session?.user?.id) {
    throw new Error('Not authenticated');
  }

  // Get member info
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

export async function getBookings(filters: BookingFilters = {}): Promise<(Booking & { serviceName: string | null })[]> {
  const { organizationId, memberId, role } = await getSessionInfo();

  let query = db
    .selectFrom('bookings')
    .leftJoin('services', 'services.id', 'bookings.serviceId')
    .selectAll('bookings')
    .select(['services.name as serviceName'])
    .where('bookings.organizationId', '=', organizationId);

  // Staff members can only see their own appointments
  if (role === 'member' && memberId) {
    query = query.where('bookings.memberId', '=', memberId);
  } else if (filters.memberId) {
    query = query.where('bookings.memberId', '=', filters.memberId);
  }

  // Apply status filter
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.where('bookings.status', 'in', filters.status);
    } else {
      query = query.where('bookings.status', '=', filters.status);
    }
  }

  // Apply date filters
  if (filters.startDate) {
    query = query.where('bookings.startTime', '>=', filters.startDate);
  }
  if (filters.endDate) {
    query = query.where('bookings.endTime', '<=', filters.endDate);
  }

  const bookings = await query
    .orderBy('bookings.startTime', 'asc')
    .execute();

  return bookings as unknown as (Booking & { serviceName: string | null })[];
}

export async function getBookingById(id: string): Promise<(Booking & { serviceName: string | null }) | null> {
  const { organizationId, memberId, role } = await getSessionInfo();

  let query = db
    .selectFrom('bookings')
    .leftJoin('services', 'services.id', 'bookings.serviceId')
    .selectAll('bookings')
    .select(['services.name as serviceName'])
    .where('bookings.id', '=', id)
    .where('bookings.organizationId', '=', organizationId);

  // Staff can only view their own bookings
  if (role === 'member' && memberId) {
    query = query.where('bookings.memberId', '=', memberId);
  }

  const booking = await query.executeTakeFirst();
  return (booking as unknown as (Booking & { serviceName: string | null })) || null;
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { organizationId, memberId, role } = await getSessionInfo();

  // Verify booking belongs to this org and user has access
  const booking = await db
    .selectFrom('bookings')
    .select(['id', 'memberId', 'organizationId'])
    .where('id', '=', id)
    .where('organizationId', '=', organizationId)
    .executeTakeFirst();

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Staff can only update their own bookings
  if (role === 'member' && booking.memberId !== memberId) {
    throw new Error('Not authorized to update this booking');
  }

  await db
    .updateTable('bookings')
    .set({ status, updatedAt: new Date() })
    .where('id', '=', id)
    .execute();

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/calendar');
  return { success: true };
}

export async function cancelBooking(id: string, reason?: string) {
  const { organizationId, memberId, role } = await getSessionInfo();

  const booking = await db
    .selectFrom('bookings')
    .select(['id', 'memberId', 'organizationId', 'notes'])
    .where('id', '=', id)
    .where('organizationId', '=', organizationId)
    .executeTakeFirst();

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (role === 'member' && booking.memberId !== memberId) {
    throw new Error('Not authorized to cancel this booking');
  }

  const updatedNotes = reason
    ? `${booking.notes || ''}\n[Cancelled: ${reason}]`.trim()
    : booking.notes;

  await db
    .updateTable('bookings')
    .set({
      status: 'cancelled',
      notes: updatedNotes,
      updatedAt: new Date(),
    })
    .where('id', '=', id)
    .execute();

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/calendar');
  return { success: true };
}

// Get today's bookings for dashboard
export async function getTodaysBookings() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getBookings({
    startDate: today,
    endDate: tomorrow,
    status: ['pending', 'confirmed'],
  });
}

// Get upcoming bookings count for dashboard stats
export async function getBookingStats() {
  const { organizationId, memberId, role } = await getSessionInfo();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let baseQuery = db
    .selectFrom('bookings')
    .where('organizationId', '=', organizationId)
    .where('startTime', '>=', today);

  if (role === 'member' && memberId) {
    baseQuery = baseQuery.where('memberId', '=', memberId);
  }

  const pending = await baseQuery
    .where('status', '=', 'pending')
    .select(db.fn.count<number>('id').as('count'))
    .executeTakeFirst();

  const confirmed = await baseQuery
    .where('status', '=', 'confirmed')
    .select(db.fn.count<number>('id').as('count'))
    .executeTakeFirst();

  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const todaysCount = await baseQuery
    .where('startTime', '<', todayEnd)
    .where('status', 'in', ['pending', 'confirmed'])
    .select(db.fn.count<number>('id').as('count'))
    .executeTakeFirst();

  return {
    pending: Number(pending?.count || 0),
    confirmed: Number(confirmed?.count || 0),
    today: Number(todaysCount?.count || 0),
  };
}
