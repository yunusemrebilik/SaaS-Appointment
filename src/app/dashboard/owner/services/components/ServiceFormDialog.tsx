'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { serviceFormSchema, type ServiceFormData } from '@/schemas/service.schema';
import { createService, updateService } from '@/actions/services';

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: {
    id: string;
    name: string;
    description: string | null;
    durationMin: number;
    priceCents: number;
  };
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240];

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: ServiceFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!service;

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      durationMin: service?.durationMin || 30,
      priceCents: service?.priceCents || 0,
    },
  });

  async function onSubmit(data: ServiceFormData) {
    setLoading(true);

    const result = isEditing && service
      ? await updateService({ id: service.id, data })
      : await createService(data);

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? 'Service updated successfully' : 'Service created successfully');
    onOpenChange(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the service details below.'
              : 'Fill in the details for your new service.'}
          </DialogDescription>
        </DialogHeader>

        <form id="service-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Service Name</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="e.g. Haircut"
                    disabled={loading}
                    className="bg-background/50"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
                  <Input
                    {...field}
                    id="description"
                    placeholder="Brief description of the service"
                    disabled={loading}
                    className="bg-background/50"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Duration */}
            <Controller
              name="durationMin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="durationMin">Duration (minutes)</FieldLabel>
                  <select
                    id="durationMin"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={loading}
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {DURATION_OPTIONS.map((min) => (
                      <option key={min} value={min}>
                        {min} min
                      </option>
                    ))}
                  </select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Price */}
            <Controller
              name="priceCents"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="priceCents">Price</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id="priceCents"
                      type="number"
                      step="0.01"
                      min="0"
                      value={(field.value / 100).toFixed(2)}
                      onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value || '0') * 100))}
                      disabled={loading}
                      className="bg-background/50 pl-7"
                    />
                  </div>
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
          <Button type="submit" form="service-form" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Update Service'
            ) : (
              'Create Service'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
