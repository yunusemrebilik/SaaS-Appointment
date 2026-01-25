import { Suspense } from 'react';
import { CalendarData } from './components/CalendarData';
import { CalendarSkeleton } from './components/CalendarSkeleton';

// Helper to get the start of the week (Sunday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function CalendarPage() {
  const today = new Date();
  const weekStart = getWeekStart(today);

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View your appointments at a glance.
        </p>
      </div>

      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarData initialWeekStart={weekStart} />
      </Suspense>
    </div>
  );
}
