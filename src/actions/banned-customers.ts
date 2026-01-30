'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err } from '@/lib/safe-action';
import { Selectable } from 'kysely';
import { BannedCustomers } from '@/types/db';
import { normalizePhone } from '@/lib/phone';

export type BannedCustomer = Selectable<BannedCustomers>;

// ============ Schemas ============

const banCustomerSchema = z.object({
  customerPhone: z.string().min(6, 'Phone number is required'),
  reason: z.string().optional(),
  bannedUntil: z.date().nullable().optional(),
});

const unbanCustomerSchema = z.object({
  id: z.uuid(),
});

// ============ Read Operations ============

export const getBannedCustomers = createSafeAction({
  requireRole: ['owner', 'admin'],
  handler: async ({ ctx }) => {
    const banned = await db
      .selectFrom('bannedCustomers')
      .selectAll()
      .where('organizationId', '=', ctx.organizationId)
      .orderBy('bannedAt', 'desc')
      .execute();

    return ok(banned as BannedCustomer[]);
  },
});

// ============ Write Operations ============

export const banCustomer = createSafeAction({
  schema: banCustomerSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    const normalizedPhone = normalizePhone(data.customerPhone);

    // Single upsert query instead of SELECT + conditional INSERT/UPDATE
    await db
      .insertInto('bannedCustomers')
      .values({
        organizationId: ctx.organizationId,
        customerPhone: normalizedPhone,
        reason: data.reason || null,
        bannedUntil: data.bannedUntil || null,
      })
      .onConflict((oc) =>
        oc.constraint('uq_banned_customer_org').doUpdateSet({
          reason: data.reason || null,
          bannedUntil: data.bannedUntil || null,
          bannedAt: new Date(),
          updatedAt: new Date(),
        })
      )
      .execute();

    revalidatePath('/dashboard/owner/customers');
    return ok({ success: true });
  },
});

export const unbanCustomer = createSafeAction({
  schema: unbanCustomerSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    await db
      .deleteFrom('bannedCustomers')
      .where('id', '=', data.id)
      .where('organizationId', '=', ctx.organizationId)
      .execute();

    revalidatePath('/dashboard/owner/customers');
    return ok({ success: true });
  },
});
