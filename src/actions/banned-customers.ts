'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err } from '@/lib/safe-action';
import { Selectable } from 'kysely';
import { BannedCustomers } from '@/types/db';

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

const isCustomerBannedSchema = z.object({
  organizationId: z.uuid(),
  customerPhone: z.string(),
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

export const isCustomerBanned = createSafeAction({
  schema: isCustomerBannedSchema,
  requireAuth: false, // This is called from public booking pages
  handler: async ({ data }) => {
    const ban = await db
      .selectFrom('bannedCustomers')
      .select(['reason', 'bannedUntil'])
      .where('organizationId', '=', data.organizationId)
      .where('customerPhone', '=', data.customerPhone)
      .executeTakeFirst();

    if (!ban) {
      return ok({ banned: false });
    }

    // Check if ban has expired
    if (ban.bannedUntil && new Date(ban.bannedUntil) < new Date()) {
      return ok({ banned: false });
    }

    return ok({
      banned: true,
      reason: ban.reason || undefined,
      bannedUntil: ban.bannedUntil,
    });
  },
});

// ============ Write Operations ============

export const banCustomer = createSafeAction({
  schema: banCustomerSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    // Check if already banned
    const existing = await db
      .selectFrom('bannedCustomers')
      .select(['id'])
      .where('organizationId', '=', ctx.organizationId)
      .where('customerPhone', '=', data.customerPhone)
      .executeTakeFirst();

    if (existing) {
      // Update existing ban
      await db
        .updateTable('bannedCustomers')
        .set({
          reason: data.reason || null,
          bannedUntil: data.bannedUntil || null,
          bannedAt: new Date(),
          updatedAt: new Date(),
        })
        .where('id', '=', existing.id)
        .execute();
    } else {
      // Create new ban
      await db
        .insertInto('bannedCustomers')
        .values({
          organizationId: ctx.organizationId,
          customerPhone: data.customerPhone,
          reason: data.reason || null,
          bannedUntil: data.bannedUntil || null,
        })
        .execute();
    }

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
