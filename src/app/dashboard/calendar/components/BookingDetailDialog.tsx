'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Phone, User, CheckCircle, XCircle, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateBookingStatus, cancelBooking } from '@/actions/bookings';
import { BookingStatus } from '@/types/booking';
import { CancelDialog } from '../../appointments/components/CancelDialog';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
  priceAtBooking: number;
  memberId: string | null;
  serviceId: string | null;
  serviceName: string | null;
}

interface BookingDetailDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export function BookingDetailDialog({ booking, open, onOpenChange }: BookingDetailDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  if (!booking) return null;

  // Capture values to avoid null checks in async functions
  const bookingId = booking.id;
  const customerName = booking.customerName;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  async function handleStatusChange(status: Exclude<BookingStatus, 'pending' | 'cancelled'>) {
    setLoading(true);
    const result = await updateBookingStatus({ id: bookingId, status });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`Appointment ${status === 'confirmed' ? 'confirmed' : status === 'completed' ? 'completed' : 'marked as no show'}`);
    router.refresh();
    onOpenChange(false);
  }

  async function handleCancelConfirm(reason?: string) {
    const result = await cancelBooking({ id: bookingId, reason });

    if (!result.success) {
      toast.error(result.error);
      throw new Error(result.error);
    }

    toast.success('Appointment cancelled');
    router.refresh();
    onOpenChange(false);
  }

  const isActionable = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {booking.customerName}
              <Badge variant={STATUS_COLORS[booking.status]}>
                {STATUS_LABELS[booking.status]}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {booking.serviceName || 'Appointment'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(booking.startTime)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.customerPhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatPrice(booking.priceAtBooking)}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm text-muted-foreground">Notes:</p>
                <p className="text-sm whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}

            {/* Actions */}
            {isActionable && (
              <div className="flex flex-wrap gap-2 pt-2">
                {booking.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Confirm
                  </Button>
                )}
                {booking.status === 'confirmed' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('completed')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Mark Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('no_show')}
                  disabled={loading}
                >
                  <User className="h-4 w-4 mr-1" />
                  No Show
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        customerName={customerName}
      />
    </>
  );
}
