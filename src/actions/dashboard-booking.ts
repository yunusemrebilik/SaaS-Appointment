'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err } from '@/lib/safe-action';
import { Booking, BookingStatus } from '@/types/booking';
import { normalizePhone } from '@/lib/phone';

// ============ Schemas ============

const createDashboardBookingSchema = z.object({
  serviceId: z.uuid(),
  memberId: z.uuid(),
  startTime: z.date(),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(6, 'Phone number is required'),
  notes: z.string().optional(),
});

// ============ Read Operations ============

export const getStaffForAppointmentForm = createSafeAction({
  handler: async ({ ctx }) => {
    // Single query with JOIN and array aggregation instead of separate queries + JS filtering
    const staffWithServices = await db
      .selectFrom('members')
      .innerJoin('users', 'users.id', 'members.userId')
      .leftJoin('memberServices', 'memberServices.memberId', 'members.id')
      .select((eb) => [
        'members.id',
        'users.name',
        'users.email',
        'members.role',
        eb.fn
          .coalesce(
            eb.fn.agg<string[]>('array_agg', ['memberServices.serviceId']).filterWhere('memberServices.serviceId', 'is not', null),
            eb.val<string[]>([])
          )
          .as('serviceIds'),
      ])
      .where('members.organizationId', '=', ctx.organizationId)
      .groupBy(['members.id', 'users.id'])
      .execute();

    return ok(staffWithServices);
  },
});

// ============ Write Operations ============

export const createDashboardBooking = createSafeAction({
  schema: createDashboardBookingSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    // Get service details
    const service = await db
      .selectFrom('services')
      .select(['durationMin', 'priceCents', 'name'])
      .where('id', '=', data.serviceId)
      .where('organizationId', '=', ctx.organizationId)
      .executeTakeFirst();

    if (!service) {
      return err('Service not found', 'NOT_FOUND');
    }

    // Calculate end time
    const endTime = new Date(data.startTime);
    endTime.setMinutes(endTime.getMinutes() + service.durationMin);

    // Check for conflicts
    const existingBookings = await db
      .selectFrom('bookings')
      .select(['id'])
      .where('memberId', '=', data.memberId)
      .where('startTime', '<', endTime)
      .where('endTime', '>', data.startTime)
      .where('status', 'in', ['pending', 'confirmed'] as BookingStatus[])
      .executeTakeFirst();

    if (existingBookings) {
      return err('This time slot conflicts with an existing appointment.', 'CONFLICT');
    }

    // Create the booking
    const booking = await db
      .insertInto('bookings')
      .values({
        organizationId: ctx.organizationId,
        serviceId: data.serviceId,
        memberId: data.memberId,
        startTime: data.startTime,
        endTime,
        customerName: data.customerName,
        customerPhone: normalizePhone(data.customerPhone),
        notes: data.notes || null,
        priceAtBooking: service.priceCents,
        status: 'confirmed', // Dashboard bookings are auto-confirmed
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    revalidatePath('/dashboard/appointments');
    revalidatePath('/dashboard/calendar');

    return ok({
      booking: booking as Booking,
      service: {
        name: service.name,
        durationMin: service.durationMin,
        priceCents: service.priceCents,
      },
    });
  },
});
