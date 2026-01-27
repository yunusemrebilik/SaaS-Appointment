'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err, type ActionResult } from '@/lib/safe-action';
import { Booking, BookingFilters, BookingStatus } from '@/types/booking';

// ============ Schemas ============

const bookingFiltersSchema = z.object({
  memberId: z.uuid().optional(),
  status: z.union([
    z.array(z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])),
    z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
  ]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).optional();

const getBookingByIdSchema = z.object({ id: z.uuid() });

const updateBookingStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']),
});

const cancelBookingSchema = z.object({
  id: z.uuid(),
  reason: z.string().optional(),
});

// ============ Read Operations ============

export const getBookings = createSafeAction({
  schema: bookingFiltersSchema,
  handler: async ({ data, ctx }) => {
    const filters = data || {};

    let query = db
      .selectFrom('bookings')
      .leftJoin('services', 'services.id', 'bookings.serviceId')
      .selectAll('bookings')
      .select(['services.name as serviceName'])
      .where('bookings.organizationId', '=', ctx.organizationId);

    // Staff members can only see their own appointments
    if (ctx.role === 'member' && ctx.memberId) {
      query = query.where('bookings.memberId', '=', ctx.memberId);
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

    return ok(bookings as unknown as (Booking & { serviceName: string | null })[]);
  },
});

export const getBookingById = createSafeAction({
  schema: getBookingByIdSchema,
  handler: async ({ data, ctx }) => {
    let query = db
      .selectFrom('bookings')
      .leftJoin('services', 'services.id', 'bookings.serviceId')
      .selectAll('bookings')
      .select(['services.name as serviceName'])
      .where('bookings.id', '=', data.id)
      .where('bookings.organizationId', '=', ctx.organizationId);

    // Staff can only view their own bookings
    if (ctx.role === 'member' && ctx.memberId) {
      query = query.where('bookings.memberId', '=', ctx.memberId);
    }

    const booking = await query.executeTakeFirst();

    if (!booking) {
      return err('Booking not found', 'NOT_FOUND');
    }

    return ok(booking as unknown as (Booking & { serviceName: string | null }));
  },
});

// ============ Write Operations ============

export const updateBookingStatus = createSafeAction({
  schema: updateBookingStatusSchema,
  handler: async ({ data, ctx }) => {
    // Verify booking belongs to this org and user has access
    const booking = await db
      .selectFrom('bookings')
      .select(['id', 'memberId', 'organizationId'])
      .where('id', '=', data.id)
      .where('organizationId', '=', ctx.organizationId)
      .executeTakeFirst();

    if (!booking) {
      return err('Booking not found', 'NOT_FOUND');
    }

    // Staff can only update their own bookings
    if (ctx.role === 'member' && booking.memberId !== ctx.memberId) {
      return err('Not authorized to update this booking', 'FORBIDDEN');
    }

    await db
      .updateTable('bookings')
      .set({ status: data.status, updatedAt: new Date() })
      .where('id', '=', data.id)
      .execute();

    revalidatePath('/dashboard/appointments');
    revalidatePath('/dashboard/calendar');

    return ok({ success: true });
  },
});

export const cancelBooking = createSafeAction({
  schema: cancelBookingSchema,
  handler: async ({ data, ctx }) => {
    const booking = await db
      .selectFrom('bookings')
      .select(['id', 'memberId', 'organizationId', 'notes'])
      .where('id', '=', data.id)
      .where('organizationId', '=', ctx.organizationId)
      .executeTakeFirst();

    if (!booking) {
      return err('Booking not found', 'NOT_FOUND');
    }

    if (ctx.role === 'member' && booking.memberId !== ctx.memberId) {
      return err('Not authorized to cancel this booking', 'FORBIDDEN');
    }

    const updatedNotes = data.reason
      ? `${booking.notes || ''}\\n[Cancelled: ${data.reason}]`.trim()
      : booking.notes;

    await db
      .updateTable('bookings')
      .set({
        status: 'cancelled',
        notes: updatedNotes,
        updatedAt: new Date(),
      })
      .where('id', '=', data.id)
      .execute();

    revalidatePath('/dashboard/appointments');
    revalidatePath('/dashboard/calendar');

    return ok({ success: true });
  },
});

// ============ Dashboard Stats ============

export const getTodaysBookings = createSafeAction({
  handler: async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return getBookings({
      startDate: today,
      endDate: tomorrow,
      status: ['pending', 'confirmed'],
    });
  },
});

export const getBookingStats = createSafeAction({
  handler: async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let baseQuery = db
      .selectFrom('bookings')
      .where('organizationId', '=', ctx.organizationId)
      .where('startTime', '>=', today);

    if (ctx.role === 'member' && ctx.memberId) {
      baseQuery = baseQuery.where('memberId', '=', ctx.memberId);
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

    return ok({
      pending: Number(pending?.count || 0),
      confirmed: Number(confirmed?.count || 0),
      today: Number(todaysCount?.count || 0),
    });
  },
});
