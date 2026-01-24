'use server';

import { db } from '@/db/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Selectable } from 'kysely';
import { BannedCustomers } from '@/types/db';

async function getSessionInfo() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId || !session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId: session.session.activeOrganizationId },
  });

  const currentMember = members?.members?.find(
    (m: { userId: string }) => m.userId === session.user.id
  );

  return {
    organizationId: session.session.activeOrganizationId,
    userId: session.user.id,
    role: (currentMember?.role as 'owner' | 'admin' | 'member') || null,
  };
}

export type BannedCustomer = Selectable<BannedCustomers>;

export async function getBannedCustomers(): Promise<BannedCustomer[]> {
  const { organizationId, role } = await getSessionInfo();

  // Only owner/admin can view banned customers
  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Not authorized');
  }

  const banned = await db
    .selectFrom('bannedCustomers')
    .selectAll()
    .where('organizationId', '=', organizationId)
    .orderBy('bannedAt', 'desc')
    .execute();

  return banned;
}

export async function banCustomer(data: {
  customerPhone: string;
  reason?: string;
  bannedUntil?: Date | null;
}) {
  const { organizationId, role } = await getSessionInfo();

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Not authorized');
  }

  // Check if already banned
  const existing = await db
    .selectFrom('bannedCustomers')
    .select(['id'])
    .where('organizationId', '=', organizationId)
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
        organizationId,
        customerPhone: data.customerPhone,
        reason: data.reason || null,
        bannedUntil: data.bannedUntil || null,
      })
      .execute();
  }

  revalidatePath('/dashboard/owner/customers');
  return { success: true };
}

export async function unbanCustomer(id: string) {
  const { organizationId, role } = await getSessionInfo();

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Not authorized');
  }

  await db
    .deleteFrom('bannedCustomers')
    .where('id', '=', id)
    .where('organizationId', '=', organizationId)
    .execute();

  revalidatePath('/dashboard/owner/customers');
  return { success: true };
}

// Check if a phone number is banned (for use in booking flow)
export async function isCustomerBanned(
  organizationId: string,
  customerPhone: string
): Promise<{ banned: boolean; reason?: string; bannedUntil?: Date | null }> {
  const ban = await db
    .selectFrom('bannedCustomers')
    .select(['reason', 'bannedUntil'])
    .where('organizationId', '=', organizationId)
    .where('customerPhone', '=', customerPhone)
    .executeTakeFirst();

  if (!ban) {
    return { banned: false };
  }

  // Check if ban has expired
  if (ban.bannedUntil && new Date(ban.bannedUntil) < new Date()) {
    return { banned: false };
  }

  return {
    banned: true,
    reason: ban.reason || undefined,
    bannedUntil: ban.bannedUntil,
  };
}
