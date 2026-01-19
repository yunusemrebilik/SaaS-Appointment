'use server';

import { db } from '@/db/db';
import { Selectable, Insertable, Updateable } from 'kysely';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { MemberWeeklySchedules, MemberScheduleOverrides } from '@/types/db';

export type WeeklySchedule = Selectable<MemberWeeklySchedules>;
export type NewWeeklySchedule = Insertable<MemberWeeklySchedules>;
export type OverrideType = 'day_off' | 'time_off' | 'extra_work';
export type ScheduleOverride = Selectable<MemberScheduleOverrides> & { type: OverrideType };
export type NewScheduleOverride = Insertable<MemberScheduleOverrides>;

async function getCurrentMemberId(): Promise<string> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId || !session?.user?.id) {
    throw new Error('Not authenticated');
  }

  // Get the member record for this user in the active organization
  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId: session.session.activeOrganizationId },
  });

  const member = members?.members?.find((m) => m.userId === session.user.id);
  if (!member) {
    throw new Error('Not a member of this organization');
  }

  return member.id;
}

// ============ Weekly Schedule ============

export async function getWeeklySchedule(memberIdParam?: string): Promise<WeeklySchedule[]> {
  const memberId = memberIdParam || await getCurrentMemberId();

  const schedules = await db
    .selectFrom('memberWeeklySchedules')
    .selectAll()
    .where('memberId', '=', memberId)
    .orderBy('dayOfWeek', 'asc')
    .orderBy('startTime', 'asc')
    .execute();

  return schedules as WeeklySchedule[];
}

export async function setWeeklySchedule(
  slots: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>,
  memberIdParam?: string
) {
  const memberId = memberIdParam || await getCurrentMemberId();

  // Delete existing schedule
  await db
    .deleteFrom('memberWeeklySchedules')
    .where('memberId', '=', memberId)
    .execute();

  // Insert new schedule
  if (slots.length > 0) {
    await db
      .insertInto('memberWeeklySchedules')
      .values(
        slots.map((slot) => ({
          memberId: memberId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      )
      .execute();
  }

  revalidatePath('/dashboard/schedule');
  return { success: true };
}

// ============ Schedule Overrides ============

export async function getOverrides(
  startDate: Date,
  endDate: Date,
  memberIdParam?: string
): Promise<ScheduleOverride[]> {
  const memberId = memberIdParam || await getCurrentMemberId();

  const overrides = await db
    .selectFrom('memberScheduleOverrides')
    .selectAll()
    .where('memberId', '=', memberId)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .orderBy('date', 'asc')
    .execute();

  return overrides as unknown as ScheduleOverride[];
}

export async function createOverride(data: {
  type: OverrideType;
  date: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
  memberId?: string;
}) {
  const memberId = data.memberId || await getCurrentMemberId();

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
  return result;
}

export async function deleteOverride(overrideId: string) {
  const memberId = await getCurrentMemberId();

  // Verify the override belongs to this member
  const override = await db
    .selectFrom('memberScheduleOverrides')
    .select(['id', 'memberId'])
    .where('id', '=', overrideId)
    .executeTakeFirst();

  if (!override || override.memberId !== memberId) {
    throw new Error('Override not found or not authorized');
  }

  await db
    .deleteFrom('memberScheduleOverrides')
    .where('id', '=', overrideId)
    .execute();

  revalidatePath('/dashboard/schedule');
  return { success: true };
}
