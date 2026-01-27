'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err } from '@/lib/safe-action';

// ============ Schemas ============

const updateOrganizationSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(50).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  logo: z.string().url().nullable().optional(),
});

// ============ Read Operations ============

export const getOrganizationSettings = createSafeAction({
  handler: async ({ ctx }) => {
    const organization = await db
      .selectFrom('organizations')
      .selectAll()
      .where('id', '=', ctx.organizationId)
      .executeTakeFirst();

    if (!organization) {
      return err('Organization not found', 'NOT_FOUND');
    }

    return ok(organization);
  },
});

// ============ Write Operations ============

export const updateOrganizationSettings = createSafeAction({
  schema: updateOrganizationSettingsSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    // Check if slug is already taken by another org
    const existingOrg = await db
      .selectFrom('organizations')
      .select(['id'])
      .where('slug', '=', data.slug)
      .where('id', '!=', ctx.organizationId)
      .executeTakeFirst();

    if (existingOrg) {
      return err('This URL slug is already taken. Please choose another.', 'SLUG_TAKEN');
    }

    const result = await db
      .updateTable('organizations')
      .set({
        name: data.name,
        slug: data.slug,
        logo: data.logo ?? undefined,
        updatedAt: new Date(),
      })
      .where('id', '=', ctx.organizationId)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return err('Organization not found', 'NOT_FOUND');
    }

    revalidatePath('/dashboard/owner/settings');
    revalidatePath('/dashboard');
    return ok(result);
  },
});
