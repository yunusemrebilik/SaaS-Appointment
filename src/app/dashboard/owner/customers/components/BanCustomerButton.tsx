'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, Plus, Ban, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { banCustomer } from '@/actions/banned-customers';

const banSchema = z.object({
  customerPhone: z.string().min(6, 'Phone number is required'),
  reason: z.string().optional(),
  bannedUntil: z.string().optional(),
});

type BanFormData = z.infer<typeof banSchema>;

export function BanCustomerButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<BanFormData>({
    resolver: zodResolver(banSchema),
    defaultValues: {
      customerPhone: '',
      reason: '',
      bannedUntil: '',
    },
  });

  async function onSubmit(data: BanFormData) {
    setLoading(true);
    try {
      await banCustomer({
        customerPhone: data.customerPhone,
        reason: data.reason || undefined,
        bannedUntil: data.bannedUntil ? new Date(data.bannedUntil) : null,
      });

      toast.success('Customer banned successfully');
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error('Error banning customer:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to ban customer'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Ban className="h-4 w-4 mr-2" />
          Ban Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ban Customer</DialogTitle>
          <DialogDescription>
            Ban a customer from making future bookings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="customerPhone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customerPhone">Phone Number</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="customerPhone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the phone number exactly as the customer uses it for bookings.
                  </p>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="reason"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="reason">Reason (optional)</FieldLabel>
                  <Textarea
                    {...field}
                    id="reason"
                    placeholder="No-show, harassment, etc."
                    disabled={loading}
                    rows={2}
                  />
                </Field>
              )}
            />

            <Controller
              name="bannedUntil"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="bannedUntil">Ban Until (optional)</FieldLabel>
                  <Input
                    {...field}
                    type="date"
                    id="bannedUntil"
                    disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for permanent ban.
                  </p>
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Banning...
                </>
              ) : (
                'Ban Customer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
