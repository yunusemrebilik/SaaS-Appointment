'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, MoreVertical, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';
import { ServiceAssignment } from './ServiceAssignment';
import { Service } from '@/actions/public-booking';

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}



interface StaffListProps {
  members: Member[];
  services: Service[];
  organizationId: string;
}

export function StaffList({ members, services, organizationId }: StaffListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(memberId: string, memberEmail: string) {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from your team?`)) {
      return;
    }

    setRemovingId(memberId);
    try {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId,
      });

      if (error) {
        toast.error(error.message || 'Failed to remove member');
        return;
      }

      toast.success('Member removed successfully');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setRemovingId(null);
    }
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-12 text-center">
        <UserCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No team members yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite your first staff member to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{member.user.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{member.user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                {member.role}
              </Badge>
              {member.role !== 'owner' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(member.id, member.user.email)}
                  disabled={removingId === member.id || isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              )}
            </div>
          </div>

          {/* Service Assignment - All roles can provide services */}
          <div className="mt-4 pt-4 border-t">
            <ServiceAssignment
              memberId={member.id}
              services={services}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
