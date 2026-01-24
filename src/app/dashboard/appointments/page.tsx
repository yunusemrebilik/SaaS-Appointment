import { Suspense } from 'react';
import { AppointmentsData } from './components/AppointmentsData';
import { AppointmentsFilters } from './components/AppointmentsFilters';
import { AppointmentsTableSkeleton } from './components/AppointmentsTableSkeleton';
import { NewAppointmentButton } from './components/NewAppointmentButton';

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  const params = await searchParams;

  // Parse filters from search params
  const statusFilter = params.status as 'pending' | 'confirmed' | 'cancelled' | 'completed' | undefined;

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (params.date) {
    startDate = new Date(params.date);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            View and manage upcoming appointments.
          </p>
        </div>
        <NewAppointmentButton />
      </div>

      <AppointmentsFilters
        currentStatus={statusFilter}
        currentDate={params.date}
      />

      <Suspense fallback={<AppointmentsTableSkeleton />}>
        <AppointmentsData
          status={statusFilter}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>
    </div>
  );
}
