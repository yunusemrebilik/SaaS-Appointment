'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err } from '@/lib/safe-action';

// ============ Schemas ============

const getMemberServicesSchema = z.object({
  memberId: z.uuid(),
});

const assignServicesToMemberSchema = z.object({
  memberId: z.uuid(),
  serviceIds: z.array(z.uuid()),
});

// ============ Read Operations ============

export const getMemberServices = createSafeAction({
  schema: getMemberServicesSchema,
  requireAuth: false, // This is called from public booking pages
  handler: async ({ data }) => {
    const memberServices = await db
      .selectFrom('memberServices')
      .select(['serviceId'])
      .where('memberId', '=', data.memberId)
      .execute();

    return ok(memberServices.map((ms) => ms.serviceId));
  },
});

export const getStaffCount = createSafeAction({
  handler: async ({ ctx }) => {
    const requestHeaders = await headers();

    const members = await auth.api.listMembers({
      headers: requestHeaders,
      query: { organizationId: ctx.organizationId },
    });

    return ok(members?.members?.length || 0);
  },
});

// ============ Write Operations ============

export const assignServicesToMember = createSafeAction({
  schema: assignServicesToMemberSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    // Direct lookup by member ID instead of fetching all members
    const member = await db
      .selectFrom('members')
      .select(['id'])
      .where('id', '=', data.memberId)
      .where('organizationId', '=', ctx.organizationId)
      .executeTakeFirst();

    if (!member) {
      return err('Member not found in your organization', 'NOT_FOUND');
    }

    // Delete existing assignments for this member
    await db
      .deleteFrom('memberServices')
      .where('memberId', '=', data.memberId)
      .execute();

    // Insert new assignments
    if (data.serviceIds.length > 0) {
      await db
        .insertInto('memberServices')
        .values(
          data.serviceIds.map((serviceId) => ({
            memberId: data.memberId,
            serviceId,
          }))
        )
        .execute();
    }

    revalidatePath('/dashboard/owner/staff');
    return ok({ success: true });
  },
});
