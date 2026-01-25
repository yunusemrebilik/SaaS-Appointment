'use server';

import { db } from '@/db/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getCurrentUser() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  return session.user;
}

export async function getProfile() {
  const user = await getCurrentUser();

  const profile = await db
    .selectFrom('users')
    .select(['id', 'name', 'email', 'image', 'createdAt'])
    .where('id', '=', user.id)
    .executeTakeFirst();

  return profile;
}

export async function updateProfile(data: { name: string }) {
  const user = await getCurrentUser();

  await db
    .updateTable('users')
    .set({
      name: data.name,
      updatedAt: new Date(),
    })
    .where('id', '=', user.id)
    .execute();

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateProfileImage(imageUrl: string | null) {
  const user = await getCurrentUser();

  await db
    .updateTable('users')
    .set({
      image: imageUrl,
      updatedAt: new Date(),
    })
    .where('id', '=', user.id)
    .execute();

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  return { success: true };
}
