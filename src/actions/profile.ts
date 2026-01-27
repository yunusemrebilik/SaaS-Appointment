'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err } from '@/lib/safe-action';

// ============ Schemas ============

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

const updateProfileImageSchema = z.object({
  imageUrl: z.string().url().nullable(),
});

// ============ Read Operations ============

export const getProfile = createSafeAction({
  handler: async ({ ctx }) => {
    const profile = await db
      .selectFrom('users')
      .select(['id', 'name', 'email', 'image', 'createdAt'])
      .where('id', '=', ctx.userId)
      .executeTakeFirst();

    if (!profile) {
      return err('Profile not found', 'NOT_FOUND');
    }

    return ok(profile);
  },
});

// ============ Write Operations ============

export const updateProfile = createSafeAction({
  schema: updateProfileSchema,
  handler: async ({ data, ctx }) => {
    await db
      .updateTable('users')
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where('id', '=', ctx.userId)
      .execute();

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return ok({ success: true });
  },
});

export const updateProfileImage = createSafeAction({
  schema: updateProfileImageSchema,
  handler: async ({ data, ctx }) => {
    await db
      .updateTable('users')
      .set({
        image: data.imageUrl,
        updatedAt: new Date(),
      })
      .where('id', '=', ctx.userId)
      .execute();

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return ok({ success: true });
  },
});
