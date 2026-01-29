'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { Selectable, Insertable } from 'kysely';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err } from '@/lib/safe-action';
import type { MemberWeeklySchedules, MemberScheduleOverrides } from '@/types/db';

export type WeeklySchedule = Selectable<MemberWeeklySchedules>;
export type NewWeeklySchedule = Insertable<MemberWeeklySchedules>;
export type OverrideType = 'day_off' | 'time_off' | 'extra_work';
export type ScheduleOverride = Selectable<MemberScheduleOverrides> & { type: OverrideType };
export type NewScheduleOverride = Insertable<MemberScheduleOverrides>;

// ============ Schemas ============

const weeklyScheduleSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

const getWeeklyScheduleSchema = z.object({
  memberId: z.uuid().optional(),
});

const setWeeklyScheduleSchema = z.object({
  slots: z.array(weeklyScheduleSlotSchema),
  memberId: z.uuid().optional(),
});

const getOverridesSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  memberId: z.uuid().optional(),
});

const createOverrideSchema = z.object({
  type: z.enum(['day_off', 'time_off', 'extra_work']),
  date: z.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  reason: z.string().optional(),
  memberId: z.uuid().optional(),
});

const deleteOverrideSchema = z.object({
  overrideId: z.uuid(),
});

// ============ Weekly Schedule Operations ============

export const getWeeklySchedule = createSafeAction({
  schema: getWeeklyScheduleSchema,
  handler: async ({ data, ctx }) => {
    const memberId = data?.memberId || ctx.memberId;

    if (!memberId) {
      return err('Member ID is required', 'INVALID_INPUT');
    }

    const schedules = await db
      .selectFrom('memberWeeklySchedules')
      .selectAll()
      .where('memberId', '=', memberId)
      .orderBy('dayOfWeek', 'asc')
      .orderBy('startTime', 'asc')
      .execute();

    return ok(schedules as WeeklySchedule[]);
  },
});

export const setWeeklySchedule = createSafeAction({
  schema: setWeeklyScheduleSchema,
  handler: async ({ data, ctx }) => {
    const memberId = data.memberId || ctx.memberId;

    if (!memberId) {
      return err('Member ID is required', 'INVALID_INPUT');
    }

    // Delete existing schedule
    await db
      .deleteFrom('memberWeeklySchedules')
      .where('memberId', '=', memberId)
      .execute();

    // Insert new schedule
    if (data.slots.length > 0) {
      await db
        .insertInto('memberWeeklySchedules')
        .values(
          data.slots.map((slot) => ({
            memberId: memberId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        )
        .execute();
    }

    revalidatePath('/dashboard/schedule');
    return ok({ success: true });
  },
});

// ============ Schedule Override Operations ============

export const getOverrides = createSafeAction({
  schema: getOverridesSchema,
  handler: async ({ data, ctx }) => {
    const memberId = data.memberId || ctx.memberId;

    if (!memberId) {
      return err('Member ID is required', 'INVALID_INPUT');
    }

    const overrides = await db
      .selectFrom('memberScheduleOverrides')
      .selectAll()
      .where('memberId', '=', memberId)
      .where('date', '>=', data.startDate)
      .where('date', '<=', data.endDate)
      .orderBy('date', 'asc')
      .execute();

    return ok(overrides as unknown as ScheduleOverride[]);
  },
});

export const createOverride = createSafeAction({
  schema: createOverrideSchema,
  handler: async ({ data, ctx }) => {
    const memberId = data.memberId || ctx.memberId;

    if (!memberId) {
      return err('Member ID is required', 'INVALID_INPUT');
    }

    if (ctx.role === 'member' && memberId !== ctx.memberId) {
      return err('Not authorized to access this schedule', 'FORBIDDEN');
    }

    const result = await db
      .insertInto('memberScheduleOverrides')
      .values({
        memberId,
        type: data.type,
        date: data.date,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        reason: data.reason || null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    revalidatePath('/dashboard/schedule');
    return ok(result as ScheduleOverride);
  },
});

export const deleteOverride = createSafeAction({
  schema: deleteOverrideSchema,
  requireAuth: true,
  handler: async ({ data, ctx }) => {
    if (!ctx.memberId) {
      return err('Member ID is required', 'INVALID_INPUT');
    }

    // Verify the override belongs to this member
    const override = await db
      .selectFrom('memberScheduleOverrides')
      .select(['id', 'memberId'])
      .where('id', '=', data.overrideId)
      .executeTakeFirst();

    if (!override || override.memberId !== ctx.memberId) {
      return err('Override not found or not authorized', 'NOT_FOUND');
    }

    await db
      .deleteFrom('memberScheduleOverrides')
      .where('id', '=', data.overrideId)
      .execute();

    revalidatePath('/dashboard/schedule');
    return ok({ success: true });
  },
});
