'use server';

import { db } from '@/db/db';
import { Selectable, Insertable } from 'kysely';
import { MemberServices } from '@/types/db';
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

export async function getMemberServices(memberId: string): Promise<string[]> {
  const memberServices = await db
    .selectFrom('memberServices')
    .select(['serviceId'])
    .where('memberId', '=', memberId)
    .execute();

  return memberServices.map((ms) => ms.serviceId);
}

export async function assignServicesToMember(
  memberId: string,
  serviceIds: string[]
) {
  const organizationId = await getActiveOrganizationId();

  // Verify member belongs to this org
  const requestHeaders = await headers();
  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId },
  });

  const member = members?.members?.find((m) => m.id === memberId);
  if (!member) {
    throw new Error('Member not found in your organization');
  }

  // Delete existing assignments for this member
  await db
    .deleteFrom('memberServices')
    .where('memberId', '=', memberId)
    .execute();

  // Insert new assignments
  if (serviceIds.length > 0) {
    await db
      .insertInto('memberServices')
      .values(
        serviceIds.map((serviceId) => ({
          memberId,
          serviceId,
        }))
      )
      .execute();
  }

  revalidatePath('/dashboard/owner/staff');
  return { success: true };
}

export async function getStaffCount() {
  const organizationId = await getActiveOrganizationId();
  const requestHeaders = await headers();

  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId },
  });

  return members?.members?.length || 0;
}
