import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWeeklySchedule, getOverrides } from '@/actions/schedules';
import { WeeklyScheduleEditor } from './components/WeeklyScheduleEditor';
import { OverridesList } from './components/OverridesList';
import { AddOverrideButton } from './components/AddOverrideButton';

export default async function SchedulePage() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId || !session?.user?.id) {
    redirect('/dashboard');
  }

  // Get member ID for current user
  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId: session.session.activeOrganizationId },
  });

  const currentMember = members?.members?.find(
    (m) => m.userId === session.user.id
  );

  if (!currentMember) {
    redirect('/dashboard');
  }

  // Fetch schedule data
  const weeklySchedule = await getWeeklySchedule(currentMember.id);

  // Get overrides for the next 30 days
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const overrides = await getOverrides(today, thirtyDaysLater, currentMember.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
        <p className="text-muted-foreground">
          Set your weekly availability and manage time off.
        </p>
      </div>

      {/* Weekly Schedule Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Weekly Availability</h2>
        <WeeklyScheduleEditor
          initialSchedule={weeklySchedule}
          memberId={currentMember.id}
        />
      </section>

      {/* Overrides Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Time Off & Exceptions</h2>
          <AddOverrideButton />
        </div>
        <OverridesList overrides={overrides} />
      </section>
    </div>
  );
}
