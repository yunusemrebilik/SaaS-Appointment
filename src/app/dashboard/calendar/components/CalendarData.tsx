import { getBookings } from '@/actions/bookings';
import { CalendarView } from './CalendarView';

// Helper to get the start of the week (Sunday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface CalendarDataProps {
  initialWeekStart: Date;
}

export async function CalendarData({ initialWeekStart }: CalendarDataProps) {
  // Fetch bookings for a larger range (8 weeks before and after)
  // This allows client-side week navigation without refetching
  const rangeStart = new Date(initialWeekStart);
  rangeStart.setDate(rangeStart.getDate() - 56); // 8 weeks before
  const rangeEnd = new Date(initialWeekStart);
  rangeEnd.setDate(rangeEnd.getDate() + 63); // 9 weeks after

  // Role-based filtering is handled inside getBookings()
  const result = await getBookings({
    startDate: rangeStart,
    endDate: rangeEnd,
    status: ['pending', 'confirmed', 'completed'],
  });

  if (!result.success) {
    return <div className="p-4 text-destructive">{result.error}</div>;
  }

  return (
    <CalendarView
      bookings={result.data}
      initialWeekStart={initialWeekStart}
    />
  );
}
