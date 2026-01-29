import { db } from '@/db/db';

export interface TimeSlot {
  time: string;
  memberId: string;
}

export interface SlotAvailabilityParams {
  organizationId: string;
  serviceId: string;
  memberId?: string;
  date: Date;
}

interface Schedule {
  memberId: string;
  startTime: string;
  endTime: string;
}

interface Override {
  memberId: string;
  type: 'day_off' | 'time_off' | 'extra_work';
  date: Date;
  startTime: string | null;
  endTime: string | null;
}

interface Booking {
  memberId: string;
  startTime: Date;
  endTime: Date;
}

// ============ Data Fetching ============

export async function getAvailableSlots(params: SlotAvailabilityParams): Promise<TimeSlot[]> {
  const { organizationId, serviceId, memberId, date } = params;

  // 1. Get service duration
  const service = await db
    .selectFrom('services')
    .select(['durationMin'])
    .where('id', '=', serviceId)
    .executeTakeFirst();

  if (!service) return [];

  const duration = service.durationMin;
  const dayOfWeek = date.getDay(); // 0 = Sunday

  // Date boundaries
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // 2. Identify relevant members
  let memberIds: string[] = [];
  if (memberId) {
    memberIds = [memberId];
  } else {
    // Fetch all members who perform this service
    const staff = await db
      .selectFrom('memberServices')
      .innerJoin('members', 'members.id', 'memberServices.memberId')
      .select('members.id as memberId')
      .where('memberServices.serviceId', '=', serviceId)
      .where('members.organizationId', '=', organizationId)
      .execute();
    memberIds = staff.map(s => s.memberId);
  }

  if (memberIds.length === 0) return [];

  // 3. Batch fetch all necessary data
  const [allSchedules, allOverrides, allBookings] = await Promise.all([
    db.selectFrom('memberWeeklySchedules')
      .select(['memberId', 'startTime', 'endTime'])
      .where('memberId', 'in', memberIds)
      .where('dayOfWeek', '=', dayOfWeek)
      .execute(),

    db.selectFrom('memberScheduleOverrides')
      .select(['memberId', 'type', 'date', 'startTime', 'endTime'])
      .where('memberId', 'in', memberIds)
      .where('date', '>=', dayStart)
      .where('date', '<=', dayEnd)
      .execute(),

    db.selectFrom('bookings')
      .select(['memberId', 'startTime', 'endTime'])
      .where('memberId', 'in', memberIds)
      .where('startTime', '>=', dayStart)
      .where('endTime', '<=', dayEnd)
      .where('status', 'in', ['pending', 'confirmed'])
      .execute(),
  ]);

  // 4. Compute slots per member
  const allSlots: TimeSlot[] = [];

  for (const mId of memberIds) {
    const schedules = allSchedules.filter(s => s.memberId === mId);
    // Cast overrides to our interface - DB types might differ slightly in strictness but logic holds
    const overrides = allOverrides.filter(o => o.memberId === mId) as Override[];
    const bookings: Booking[] = allBookings
      .filter(b => b.memberId === mId)
      .map(b => ({
        memberId: b.memberId!, // Safe assertion as we filtered by mId
        startTime: b.startTime,
        endTime: b.endTime
      }));

    const memberSlots = computeMemberSlots(
      schedules,
      overrides,
      bookings,
      dayStart,
      duration
    );

    memberSlots.forEach(time => {
      allSlots.push({ time, memberId: mId });
    });
  }

  // 5. Return sorted results
  if (!memberId) {
    // "Any staff": return unique times
    const uniqueTimes = [...new Set(allSlots.map(s => s.time))];
    return uniqueTimes.sort().map(time => ({ time, memberId: '' })); // memberId empty implies "any"
  }

  return allSlots.sort((a, b) => a.time.localeCompare(b.time));
}

// ============ Pure Logic ============

export function computeMemberSlots(
  schedules: Schedule[],
  overrides: Override[],
  bookings: Booking[],
  dayStart: Date,
  serviceDuration: number
): string[] {
  // 1. Check for full day off
  if (overrides.some(o => o.type === 'day_off')) {
    return [];
  }

  // 2. Determine working intervals
  // Start with weekly schedule
  let workingIntervals: { start: number; end: number }[] = schedules.map(s => ({
    start: parseTime(s.startTime),
    end: parseTime(s.endTime),
  }));

  // Add 'extra_work' intervals
  const extraWork = overrides.filter(o => o.type === 'extra_work' && o.startTime && o.endTime);
  for (const extra of extraWork) {
    workingIntervals.push({
      start: parseTime(extra.startTime!),
      end: parseTime(extra.endTime!),
    });
  }

  // Merge overlapping intervals
  workingIntervals.sort((a, b) => a.start - b.start);
  const mergedIntervals: typeof workingIntervals = [];
  for (const interval of workingIntervals) {
    const last = mergedIntervals[mergedIntervals.length - 1];
    if (last && interval.start <= last.end) {
      last.end = Math.max(last.end, interval.end);
    } else {
      mergedIntervals.push(interval);
    }
  }

  // 3. Generate potential slots from intervals
  const candidateSlots: number[] = [];
  for (const interval of mergedIntervals) {
    let current = interval.start;
    while (current + serviceDuration <= interval.end) {
      candidateSlots.push(current);
      current += serviceDuration; // Step by duration? Or granularity? Usually duration for simple logic.
      // NOTE: Depending on requirements, we might want fixed 15/30m steps unrelated to duration.
      // But preserving existing logic: step by duration.
      // user's original logic: currentMinutes += serviceDuration;
    }
  }

  // 4. Filter out 'time_off' and 'bookings'
  const timeOffs = overrides.filter(o => o.type === 'time_off' && o.startTime && o.endTime).map(o => ({
    start: parseTime(o.startTime!),
    end: parseTime(o.endTime!)
  }));

  const validSlots: string[] = [];

  for (const startMin of candidateSlots) {
    const endMin = startMin + serviceDuration;

    // Check Date conflict (bookings)
    const slotStartDate = new Date(dayStart);
    slotStartDate.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
    const slotEndDate = new Date(dayStart);
    slotEndDate.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0);

    const isBookingConflict = bookings.some(b =>
      slotStartDate < b.endTime && slotEndDate > b.startTime
    );

    if (isBookingConflict) continue;

    // Check Time Off conflict
    const isTimeOffConflict = timeOffs.some(off =>
      startMin < off.end && endMin > off.start
    );

    if (isTimeOffConflict) continue;

    validSlots.push(formatTime(startMin));
  }

  return validSlots;
}

// Helpers
function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
