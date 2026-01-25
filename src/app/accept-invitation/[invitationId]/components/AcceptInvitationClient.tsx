'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';

interface AcceptInvitationClientProps {
  invitationId: string;
  organizationName: string;
  inviterName: string;
  role: string;
  userEmail: string;
}

export function AcceptInvitationClient({
  invitationId,
  organizationName,
  inviterName,
  role,
  userEmail,
}: AcceptInvitationClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);
  const [completed, setCompleted] = useState<'accepted' | 'rejected' | null>(null);

  async function handleAccept() {
    setLoading('accept');
    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        toast.error(error.message || 'Failed to accept invitation');
        return;
      }

      setCompleted('accepted');
      toast.success('Invitation accepted! Redirecting...');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading('reject');
    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      });

      if (error) {
        toast.error(error.message || 'Failed to reject invitation');
        return;
      }

      setCompleted('rejected');
      toast.success('Invitation rejected');

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Failed to reject invitation');
    } finally {
      setLoading(null);
    }
  }

  if (completed) {
    return (
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardContent className="pt-6 text-center">
          {completed === 'accepted' ? (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold">Welcome to {organizationName}!</h2>
              <p className="mt-2 text-muted-foreground">
                You&apos;ve joined as a {role}. Redirecting to dashboard...
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Invitation Declined</h2>
              <p className="mt-2 text-muted-foreground">
                Redirecting...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/50 shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="mt-4 text-2xl">You&apos;re Invited!</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join a team
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-lg font-semibold">{organizationName}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="secondary">{role}</Badge>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Invited by <span className="font-medium">{inviterName}</span>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Logged in as {userEmail}
        </p>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleReject}
          disabled={!!loading}
        >
          {loading === 'reject' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Decline
        </Button>
        <Button
          className="flex-1"
          onClick={handleAccept}
          disabled={!!loading}
        >
          {loading === 'accept' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Accept Invitation
        </Button>
      </CardFooter>
    </Card>
  );
}
