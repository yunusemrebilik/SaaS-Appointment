'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, Plus, Calendar, Clock } from 'lucide-react';
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
import { createDashboardBooking, getStaffForAppointmentForm } from '@/actions/dashboard-booking';
import { getServices } from '@/actions/services';

const appointmentSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  memberId: z.string().min(1, 'Please select a staff member'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(6, 'Phone number is required'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Service {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
}

interface StaffMember {
  id: string;
  name: string;
  serviceIds: string[];
}

export function NewAppointmentButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [services, setServices] = React.useState<Service[]>([]);
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = React.useState<StaffMember[]>([]);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      serviceId: '',
      memberId: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      customerName: '',
      customerPhone: '',
      notes: '',
    },
  });

  const selectedServiceId = form.watch('serviceId');

  // Load data when dialog opens
  React.useEffect(() => {
    if (open) {
      Promise.all([getServices(), getStaffForAppointmentForm()]).then(
        ([servicesData, staffData]) => {
          setServices(servicesData as Service[]);
          setStaff(staffData);
        }
      );
    }
  }, [open]);

  // Filter staff based on selected service
  React.useEffect(() => {
    if (selectedServiceId) {
      const filtered = staff.filter(
        (s) => s.serviceIds.includes(selectedServiceId)
      );
      setFilteredStaff(filtered);
      // Reset member selection if not in filtered list
      const currentMemberId = form.getValues('memberId');
      if (currentMemberId && !filtered.find((s) => s.id === currentMemberId)) {
        form.setValue('memberId', '');
      }
    } else {
      setFilteredStaff([]);
    }
  }, [selectedServiceId, staff, form]);

  // Generate time slots
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let h = 8; h < 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        );
      }
    }
    return slots;
  }, []);

  async function onSubmit(data: AppointmentFormData) {
    setLoading(true);
    try {
      const [hours, minutes] = data.time.split(':').map(Number);
      const startTime = new Date(data.date);
      startTime.setHours(hours, minutes, 0, 0);

      await createDashboardBooking({
        serviceId: data.serviceId,
        memberId: data.memberId,
        startTime,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        notes: data.notes,
      });

      toast.success('Appointment created successfully!');
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create appointment'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            Create a new appointment for a customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            {/* Service Selection */}
            <Controller
              name="serviceId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="serviceId">Service</FieldLabel>
                  <select
                    {...field}
                    id="serviceId"
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a service...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({service.durationMin} min - $
                        {(service.priceCents / 100).toFixed(2)})
                      </option>
                    ))}
                  </select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Staff Selection */}
            <Controller
              name="memberId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="memberId">Staff Member</FieldLabel>
                  <select
                    {...field}
                    id="memberId"
                    disabled={loading || !selectedServiceId}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">
                      {selectedServiceId
                        ? 'Select staff member...'
                        : 'Select a service first'}
                    </option>
                    {filteredStaff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                  {filteredStaff.length === 0 && selectedServiceId && (
                    <p className="text-xs text-amber-600 mt-1">
                      No staff assigned to this service yet.
                    </p>
                  )}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="date"
                        id="date"
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="time"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="time">Time</FieldLabel>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <select
                        {...field}
                        id="time"
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                      >
                        <option value="">Select time...</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Customer Info */}
            <Controller
              name="customerName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customerName">Customer Name</FieldLabel>
                  <Input
                    {...field}
                    id="customerName"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="customerPhone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customerPhone">Customer Phone</FieldLabel>
                  <Input
                    {...field}
                    id="customerPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    disabled={loading}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
                  <Textarea
                    {...field}
                    id="notes"
                    placeholder="Any special requests..."
                    disabled={loading}
                    rows={2}
                  />
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Appointment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
