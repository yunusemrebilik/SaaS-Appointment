'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { createPublicBooking } from '@/actions/public-booking';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  organizationId: string;
  serviceId: string;
  memberId: string | null;
  selectedDate: Date;
  selectedTime: string;
  onSubmit: (name: string, phone: string, bookingId: string) => void;
}

export function CustomerForm({
  organizationId,
  serviceId,
  memberId,
  selectedDate,
  selectedTime,
  onSubmit,
}: CustomerFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  async function handleSubmit(data: CustomerFormData) {
    setLoading(true);

    try {
      // Construct start time from date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const result = await createPublicBooking({
        organizationId,
        serviceId,
        memberId: memberId || undefined,
        startTime,
        customerName: data.name,
        customerPhone: data.phone,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Booking confirmed!');
      onSubmit(data.name, data.phone, result.data.booking.id);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Your details</h3>

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  placeholder="John Smith"
                  disabled={loading}
                  className="bg-background/50"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  {...field}
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  disabled={loading}
                  className="bg-background/50"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send you a confirmation text
                </p>
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          className="w-full mt-6"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </form>
    </div>
  );
}
