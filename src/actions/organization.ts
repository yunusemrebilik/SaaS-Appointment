'use server';

import { db } from '@/db/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getActiveOrganizationId(): Promise<string> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId) {
    throw new Error('No active organization');
  }

  return session.session.activeOrganizationId;
}

export async function getOrganizationSettings() {
  const organizationId = await getActiveOrganizationId();

  const organization = await db
    .selectFrom('organizations')
    .selectAll()
    .where('id', '=', organizationId)
    .executeTakeFirst();

  return organization;
}

export async function updateOrganizationSettings(data: {
  name: string;
  slug: string;
  logo?: string | null;
}) {
  const organizationId = await getActiveOrganizationId();

  // Check if slug is already taken by another org
  const existingOrg = await db
    .selectFrom('organizations')
    .select(['id'])
    .where('slug', '=', data.slug)
    .where('id', '!=', organizationId)
    .executeTakeFirst();

  if (existingOrg) {
    throw new Error('This URL slug is already taken. Please choose another.');
  }

  const result = await db
    .updateTable('organizations')
    .set({
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      updatedAt: new Date(),
    })
    .where('id', '=', organizationId)
    .returningAll()
    .executeTakeFirst();

  revalidatePath('/dashboard/owner/settings');
  revalidatePath('/dashboard');
  return result;
}
