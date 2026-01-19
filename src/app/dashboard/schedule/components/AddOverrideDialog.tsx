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
import { createOverride } from '@/actions/schedules';

const overrideSchema = z.object({
  type: z.enum(['day_off', 'time_off', 'extra_work']),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
}).refine(
  (data) => {
    if (data.type !== 'day_off') {
      return data.startTime && data.endTime;
    }
    return true;
  },
  { message: 'Start and end time required for this type', path: ['startTime'] }
);

type OverrideFormData = z.infer<typeof overrideSchema>;

interface AddOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_OPTIONS = [
  { value: 'day_off', label: 'Day Off' },
  { value: 'time_off', label: 'Time Off (Partial day)' },
  { value: 'extra_work', label: 'Extra Hours' },
];

export function AddOverrideDialog({ open, onOpenChange }: AddOverrideDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<OverrideFormData>({
    resolver: zodResolver(overrideSchema),
    defaultValues: {
      type: 'day_off',
      date: '',
      startTime: '',
      endTime: '',
      reason: '',
    },
  });

  const watchedType = form.watch('type');

  async function onSubmit(data: OverrideFormData) {
    setLoading(true);
    try {
      await createOverride({
        type: data.type,
        date: new Date(data.date),
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
        reason: data.reason || undefined,
      });

      toast.success('Exception added successfully');
      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error('Error creating override:', error);
      toast.error('Failed to add exception');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Schedule Exception</DialogTitle>
          <DialogDescription>
            Add a day off, time off, or extra working hours.
          </DialogDescription>
        </DialogHeader>

        <form id="override-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Type */}
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="type">Type</FieldLabel>
                  <select
                    id="type"
                    {...field}
                    disabled={loading}
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Date */}
            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="date">Date</FieldLabel>
                  <Input
                    {...field}
                    id="date"
                    type="date"
                    disabled={loading}
                    className="bg-background/50"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Time fields - only show for time_off and extra_work */}
            {watchedType !== 'day_off' && (
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="startTime"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="startTime">Start Time</FieldLabel>
                      <Input
                        {...field}
                        id="startTime"
                        type="time"
                        disabled={loading}
                        className="bg-background/50"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="endTime"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="endTime">End Time</FieldLabel>
                      <Input
                        {...field}
                        id="endTime"
                        type="time"
                        disabled={loading}
                        className="bg-background/50"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            )}

            {/* Reason */}
            <Controller
              name="reason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reason">Reason (optional)</FieldLabel>
                  <Input
                    {...field}
                    id="reason"
                    placeholder="e.g. Doctor's appointment"
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
          <Button type="submit" form="override-form" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Exception'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
