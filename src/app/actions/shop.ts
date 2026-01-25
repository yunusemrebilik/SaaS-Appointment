'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db/db';
import { revalidatePath } from 'next/cache';

export async function createShopAction(data: { name: string; slug: string }) {
  // 1. Verify the user is authenticated (they just signed up)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // 2. Create the Organization Record
    const organization = await db
      .insertInto('organizations')
      .values({
        name: data.name,
        slug: data.slug,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    // 3. Create the Member Record (linking User -> Organization with 'owner' role)
    await db
      .insertInto('members')
      .values({
        userId: session.user.id,
        organizationId: organization.id,
        role: 'owner',
      })
      .execute();

    revalidatePath('/dashboard');
    return { success: true, organizationId: organization.id };
  } catch (error: any) {
    // Handle unique constraint violations (e.g., slug already taken)
    if (error.code === '23505') {
      // Postgres unique violation code
      return { success: false, error: 'This shop URL is already taken. Please try another.' };
    }
    console.error('Failed to create organization:', error);
    return { success: false, error: 'Failed to create organization. Please try again.' };
  }
}
