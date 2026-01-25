'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarDayColumn } from './CalendarDayColumn';

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

interface CalendarViewProps {
  bookings: Booking[];
  initialWeekStart: Date;
}

// Helper to get the start of the week (Sunday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper to format date range
function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });

  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  }
  return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
}

// Generate days of the week
function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return day;
  });
}

export function CalendarView({ bookings, initialWeekStart }: CalendarViewProps) {
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(initialWeekStart));

  const weekDays = getWeekDays(weekStart);

  // Group bookings by day
  const bookingsByDay = weekDays.map((day) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return bookings.filter((booking) => {
      const bookingStart = new Date(booking.startTime);
      return bookingStart >= dayStart && bookingStart <= dayEnd;
    });
  });

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setWeekStart(newWeekStart);
  };

  const goToToday = () => {
    setWeekStart(getWeekStart(new Date()));
  };

  const isCurrentWeek = (): boolean => {
    const today = getWeekStart(new Date());
    return weekStart.getTime() === today.getTime();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            disabled={isCurrentWeek()}
          >
            Today
          </Button>
        </div>
        <h2 className="text-lg font-semibold">{formatWeekRange(weekStart)}</h2>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 h-full">
          {weekDays.map((day, index) => (
            <CalendarDayColumn
              key={day.toISOString()}
              date={day}
              bookings={bookingsByDay[index]}
              isLast={index === 6}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
