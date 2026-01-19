import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { StaffList } from './components/StaffList';
import { InviteStaffButton } from './components/InviteStaffButton';
import { getServices } from '@/actions/services';

export default async function StaffPage() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId) {
    redirect('/dashboard');
  }

  const organizationId = session.session.activeOrganizationId;

  // Fetch members using better-auth server API
  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: {
      organizationId,
    },
  });

  // Fetch services for assignment
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">
            Manage your team members and their service assignments.
          </p>
        </div>
        <InviteStaffButton />
      </div>

      <StaffList
        members={members?.members ?? []}
        services={services}
        organizationId={organizationId}
      />
    </div>
  );
}
