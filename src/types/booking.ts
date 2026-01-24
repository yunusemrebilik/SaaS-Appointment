import { Selectable } from 'kysely';
import { Bookings } from './db';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
export type Booking = Omit<Selectable<Bookings>, 'status'> & { status: BookingStatus };

export interface BookingFilters {
  status?: BookingStatus | BookingStatus[];
  startDate?: Date;
  endDate?: Date;
  memberId?: string;
}
