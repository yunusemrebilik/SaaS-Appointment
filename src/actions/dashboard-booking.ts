'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
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
    const requestHeaders = await headers();

    // Get all members
    const members = await auth.api.listMembers({
      headers: requestHeaders,
      query: { organizationId: ctx.organizationId },
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
