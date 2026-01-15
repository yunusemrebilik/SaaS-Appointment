import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export type MemberRole = 'owner' | 'admin' | 'member' | null;

/**
 * Get the current user's role in the active organization
 * Returns null if not authenticated or not in an organization
 */
export async function getMemberRole(): Promise<MemberRole> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id || !session?.session.activeOrganizationId) {
    return null;
  }

  const organizationId = session.session.activeOrganizationId;

  // Get members list for the active organization
  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId },
  });

  // Find current user's membership
  const currentMember = members?.members?.find(
    (m: { userId: string }) => m.userId === session.user.id
  );

  if (!currentMember) {
    return null;
  }

  return currentMember.role as MemberRole;
}

/**
 * Check if user is an owner or admin
 */
export async function isOwnerOrAdmin(): Promise<boolean> {
  const role = await getMemberRole();
  return role === 'owner' || role === 'admin';
}
