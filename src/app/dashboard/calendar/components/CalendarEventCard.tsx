'use client';

import { cn } from '@/lib/utils';

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

interface CalendarEventCardProps {
  booking: Booking;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-100',
  confirmed: 'bg-green-100 border-green-300 text-green-900 dark:bg-green-900/30 dark:border-green-700 dark:text-green-100',
  completed: 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300',
  cancelled: 'bg-red-100 border-red-300 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-100',
  no_show: 'bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-100',
};

export function CalendarEventCard({ booking }: CalendarEventCardProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;

  return (
    <div
      className={cn(
        'h-full rounded border px-1.5 py-1 overflow-hidden cursor-pointer transition-all hover:shadow-md',
        statusStyle
      )}
      title={`${booking.customerName} - ${booking.serviceName || 'Service'}\n${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
    >
      <div className="text-[11px] font-medium truncate">
        {booking.customerName}
      </div>
      <div className="text-[10px] opacity-80 truncate">
        {booking.serviceName || 'Service'}
      </div>
      <div className="text-[9px] opacity-70">
        {formatTime(booking.startTime)}
      </div>
    </div>
  );
}
