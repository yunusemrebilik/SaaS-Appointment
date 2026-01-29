'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAvailableSlots } from '@/actions/public-booking';



interface DateTimeSelectProps {
  organizationId: string;
  serviceId: string;
  memberId: string | null;
  onSelect: (date: Date, time: string) => void;
}

// Generate next 30 days
function getNextDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() + i);
    days.push(day);
  }

  return days;
}

export function DateTimeSelect({
  organizationId,
  serviceId,
  memberId,
  onSelect,
}: DateTimeSelectProps) {
  const [availableDays] = useState<Date[]>(() => getNextDays(30));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // We want the inner data type (TimeSlot[])
  const [slots, setSlots] = useState<{ time: string; memberId: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Show 7 days at a time
  const visibleDays = availableDays.slice(weekOffset * 7, (weekOffset + 1) * 7);
  const canGoBack = weekOffset > 0;
  const canGoForward = (weekOffset + 1) * 7 < availableDays.length;

  useEffect(() => {
    if (!selectedDate) return;

    async function fetchSlots() {
      setLoading(true);
      try {
        const result = await getAvailableSlots({
          organizationId,
          serviceId,
          memberId: memberId || undefined,
          date: selectedDate!, // z.coerce.date() accepts Date objects
        });

        if (result.success) {
          setSlots(result.data);
        } else {
          console.error('Error fetching slots:', result.error);
          setSlots([]);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [organizationId, serviceId, memberId, selectedDate]);

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select date & time</h3>

      {/* Date Picker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {formatMonthYear(visibleDays[0])}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((w) => w + 1)}
            disabled={!canGoForward}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {visibleDays.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`
                flex flex-col items-center py-2 rounded-lg border transition-all
                ${isSelected(day)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card hover:bg-muted/50 hover:border-primary/50'
                }
                ${isToday(day) && !isSelected(day) ? 'border-primary' : 'border-transparent'}
              `}
            >
              <span className="text-xs opacity-70">{formatDayName(day)}</span>
              <span className="text-lg font-semibold">{formatDayNumber(day)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Available times for {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No available times on this date.</p>
              <p className="text-sm">Please select another day.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {slots.map((slot, index) => (
                <button
                  key={`${slot.time}-${index}`}
                  onClick={() => onSelect(selectedDate, slot.time)}
                  className="px-3 py-2 text-sm font-medium rounded-md border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a date to see available times</p>
        </div>
      )}
    </div>
  );
}
