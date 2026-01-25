'use client';

import { useState } from 'react';
import { CalendarEventCard } from './CalendarEventCard';
import { BookingDetailDialog } from './BookingDetailDialog';

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

interface CalendarDayColumnProps {
  date: Date;
  bookings: Booking[];
  isLast: boolean;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export function CalendarDayColumn({ date, bookings, isLast }: CalendarDayColumnProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isToday = (): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();

  // Calculate position for a booking (relative to 8 AM start)
  const getBookingPosition = (booking: Booking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    // Clamp to our visible range (8 AM - 9 PM)
    const clampedStart = Math.max(8, Math.min(21, startHour));
    const clampedEnd = Math.max(8, Math.min(21, endHour));

    const top = ((clampedStart - 8) / 13) * 100;
    const height = ((clampedEnd - clampedStart) / 13) * 100;

    return { top: `${top}%`, height: `${Math.max(height, 3)}%` };
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  return (
    <>
      <div className={`flex flex-col ${!isLast ? 'border-r' : ''}`}>
        {/* Day Header */}
        <div
          className={`flex flex-col items-center py-2 border-b ${isToday() ? 'bg-primary/10' : 'bg-muted/30'
            }`}
        >
          <span className="text-xs text-muted-foreground">{dayName}</span>
          <span
            className={`text-lg font-semibold ${isToday()
              ? 'flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'
              : ''
              }`}
          >
            {dayNumber}
          </span>
        </div>

        {/* Time Grid */}
        <div className="flex-1 relative min-h-[520px]">
          {/* Hour Lines */}
          {HOURS.map((hour, index) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-dashed border-muted"
              style={{ top: `${(index / 13) * 100}%` }}
            >
              {index === 0 && (
                <span className="absolute -top-2 left-1 text-[10px] text-muted-foreground">
                  {hour}:00
                </span>
              )}
            </div>
          ))}

          {/* Bookings */}
          {bookings.map((booking) => {
            const position = getBookingPosition(booking);
            return (
              <div
                key={booking.id}
                className="absolute left-1 right-1"
                style={{ top: position.top, height: position.height }}
                onClick={() => handleBookingClick(booking)}
              >
                <CalendarEventCard booking={booking} />
              </div>
            );
          })}

          {/* Empty state placeholder when no bookings */}
          {bookings.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground/50">-</span>
            </div>
          )}
        </div>
      </div>

      <BookingDetailDialog
        booking={selectedBooking}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedBooking(null);
        }}
      />
    </>
  );
}
