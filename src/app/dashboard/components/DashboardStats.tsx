import { getBookingStats } from '@/actions/bookings';
import { getServiceCount } from '@/actions/services';
import { getStaffCount } from '@/actions/member-services';
import { CalendarDays, Clock, Scissors, Users } from 'lucide-react';

export async function DashboardStats() {
  const [bookingStats, serviceCountResult, staffCount] = await Promise.all([
    getBookingStats(),
    getServiceCount({}),
    getStaffCount(),
  ]);

  const serviceCount = serviceCountResult.success ? serviceCountResult.data : 0;

  const stats = [
    {
      title: "Today's Appointments",
      value: bookingStats.today,
      icon: Clock,
      description: 'Pending or confirmed',
    },
    {
      title: 'This Week',
      value: bookingStats.pending + bookingStats.confirmed,
      icon: CalendarDays,
      description: 'Upcoming appointments',
    },
    {
      title: 'Active Services',
      value: serviceCount,
      icon: Scissors,
      description: 'Services offered',
    },
    {
      title: 'Staff Members',
      value: staffCount,
      icon: Users,
      description: 'Team members',
    },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {(serviceCount === 0 || staffCount === 0) && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-2 text-muted-foreground">
            {serviceCount === 0 && (
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Add your first service to start accepting bookings
              </li>
            )}
            {staffCount <= 1 && (
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Invite staff members to help manage your shop
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
