import { getBookings } from '@/actions/bookings';
import { AppointmentsList } from './AppointmentsList';

interface AppointmentsDataProps {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  startDate?: Date;
  endDate?: Date;
}

export async function AppointmentsData({ status, startDate, endDate }: AppointmentsDataProps) {
  const bookings = await getBookings({
    status,
    startDate,
    endDate,
  });

  return <AppointmentsList bookings={bookings} />;
}
