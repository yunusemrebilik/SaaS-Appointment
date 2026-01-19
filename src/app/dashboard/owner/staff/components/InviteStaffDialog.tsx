'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel, FieldGroup } from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteStaffDialog({ open, onOpenChange }: InviteStaffDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: InviteFormData) {
    setLoading(true);
    try {
      const { error } = await authClient.organization.inviteMember({
        email: data.email,
        role: 'member',
      });

      if (error) {
        if (error.message?.includes('already a member')) {
          toast.error('This user is already a member of your shop');
        } else if (error.message?.includes('already invited')) {
          toast.error('This email has already been invited');
        } else {
          toast.error(error.message || 'Failed to send invitation');
        }
        return;
      }

      toast.success('Invitation sent successfully');
      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error('Error inviting staff:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            Send an invitation to add a new team member. They&apos;ll receive an email
            with instructions to join.
          </DialogDescription>
        </DialogHeader>

        <form id="invite-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="staff@example.com"
                    disabled={loading}
                    className="bg-background/50"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="invite-form" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
