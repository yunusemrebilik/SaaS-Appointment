import { getBookings } from '@/actions/bookings';
import { AppointmentsList } from './AppointmentsList';

interface AppointmentsDataProps {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  startDate?: Date;
  endDate?: Date;
}

export async function AppointmentsData({ status, startDate, endDate }: AppointmentsDataProps) {
  const result = await getBookings({
    status,
    startDate,
    endDate,
  });

  if (!result.success) {
    return <div className="p-4 text-destructive">{result.error}</div>;
  }

  return <AppointmentsList bookings={result.data} />;
}
