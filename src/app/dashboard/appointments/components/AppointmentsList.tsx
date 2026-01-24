'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Phone, User, CheckCircle, XCircle, MoreHorizontal, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateBookingStatus, cancelBooking } from '@/actions/bookings';
import { Booking, BookingStatus } from '@/types/booking';
import { CancelDialog } from './CancelDialog';

interface AppointmentsListProps {
  bookings: (Booking & { serviceName: string | null })[];
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

export function AppointmentsList({ bookings }: AppointmentsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<{ id: string; customerName: string } | null>(null);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  async function handleStatusChange(id: string, status: Exclude<BookingStatus, 'pending' | 'cancelled'>) {
    setActionId(id);
    try {
      await updateBookingStatus(id, status);
      toast.success(`Appointment ${status === 'confirmed' ? 'confirmed' : status === 'completed' ? 'completed' : 'marked as no show'}`);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update appointment');
    } finally {
      setActionId(null);
    }
  }

  function handleCancelClick(id: string, customerName: string) {
    setBookingToCancel({ id, customerName });
    setCancelDialogOpen(true);
  }

  async function handleCancelConfirm(reason?: string) {
    if (!bookingToCancel) return;

    try {
      await cancelBooking(bookingToCancel.id, reason);
      toast.success('Appointment cancelled');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error cancelling:', error);
      toast.error('Failed to cancel appointment');
      throw error;
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No appointments found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Appointments will appear here when customers book.
        </p>
      </div>
    );
  }

  // Group bookings by date
  const groupedBookings = bookings.reduce((acc, booking) => {
    const dateKey = formatDate(booking.startTime);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(booking);
    return acc;
  }, {} as Record<string, (Booking & { serviceName: string | null })[]>);

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedBookings).map(([date, dayBookings]) => (
          <div key={date}>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">{date}</h3>
            <div className="space-y-3">
              {dayBookings.map((booking) => {
                const isLoading = actionId === booking.id && isPending;
                const isActionable = booking.status === 'pending' || booking.status === 'confirmed';

                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatTime(booking.startTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(booking.endTime)}
                        </div>
                      </div>

                      <div className="h-10 w-px bg-border" />

                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{booking.customerName}</span>
                          <Badge variant={STATUS_COLORS[booking.status]}>
                            {STATUS_LABELS[booking.status]}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          {booking.serviceName && (
                            <span>{booking.serviceName}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {booking.customerPhone}
                          </span>
                          <span>{formatPrice(booking.priceAtBooking)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Quick actions for pending */}
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelClick(booking.id, booking.customerName)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}

                      {/* More actions dropdown */}
                      {isActionable && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isLoading}>
                              {isLoading && booking.status !== 'pending' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {booking.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Mark as Complete
                              </DropdownMenuItem>
                            )}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'no_show')}>
                                  <User className="mr-2 h-4 w-4 text-orange-500" />
                                  Mark as No Show
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleCancelClick(booking.id, booking.customerName)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Dialog */}
      {bookingToCancel && (
        <CancelDialog
          open={cancelDialogOpen}
          onOpenChange={(open) => {
            setCancelDialogOpen(open);
            if (!open) setBookingToCancel(null);
          }}
          onConfirm={handleCancelConfirm}
          customerName={bookingToCancel.customerName}
        />
      )}
    </>
  );
}
