import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AcceptInvitationClient } from './components/AcceptInvitationClient';

interface PageProps {
  params: Promise<{ invitationId: string }>;
}

export default async function AcceptInvitationPage({ params }: PageProps) {
  const { invitationId } = await params;
  const requestHeaders = await headers();

  // Check if user is logged in first
  const session = await auth.api.getSession({ headers: requestHeaders });

  // If not logged in, redirect to login with callback
  if (!session?.user) {
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/accept-invitation/${invitationId}`)}`;
    redirect(loginUrl);
  }

  // Get user's pending invitations
  let invitation = null;
  let organizationName = 'Unknown Organization';

  try {
    const userInvitations = await auth.api.listUserInvitations({
      query: { email: session.user.email },
    });

    // Find the specific invitation
    invitation = userInvitations?.find((inv: { id: string }) => inv.id === invitationId);

    // Fetch organization details if we have an invitation
    if (invitation?.organizationId) {
      try {
        const org = await auth.api.getFullOrganization({
          headers: requestHeaders,
          query: { organizationId: invitation.organizationId },
        });
        organizationName = org?.name || 'Unknown Organization';
      } catch (orgError) {
        console.error('Error fetching organization:', orgError);
      }
    }
  } catch (error) {
    console.error('Error fetching invitations:', error);
  }

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Invalid Invitation</h1>
          <p className="mt-2 text-muted-foreground">
            This invitation link is invalid, has expired, or was sent to a different email.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Logged in as: {session.user.email}
          </p>
          <a
            href="/dashboard"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <AcceptInvitationClient
        invitationId={invitationId}
        organizationName={organizationName}
        inviterName="Team Admin"
        role={invitation.role}
        userEmail={session.user.email}
      />
    </div>
  );
}
