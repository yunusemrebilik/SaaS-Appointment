'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { setWeeklySchedule, WeeklySchedule } from '@/actions/schedules';



interface WeeklyScheduleEditorProps {
  initialSchedule: WeeklySchedule[];
  memberId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
});


type ScheduleSlot = Pick<WeeklySchedule, 'dayOfWeek' | 'startTime' | 'endTime'>;

export function WeeklyScheduleEditor({ initialSchedule, memberId }: WeeklyScheduleEditorProps) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(
    initialSchedule.map(s => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }))
  );
  const [saving, setSaving] = useState(false);

  // Group schedule by day
  const scheduleByDay = DAYS.map((_, dayIndex) => {
    return schedule.filter((slot) => slot.dayOfWeek === dayIndex);
  });

  const toggleDay = (dayIndex: number) => {
    const hasSlots = scheduleByDay[dayIndex].length > 0;
    if (hasSlots) {
      // Remove all slots for this day
      setSchedule((prev) => prev.filter((s) => s.dayOfWeek !== dayIndex));
    } else {
      // Add default slot (9:00 - 17:00)
      setSchedule((prev) => [
        ...prev,
        { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00' },
      ]);
    }
  };

  const updateSlot = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const daySlots = scheduleByDay[dayIndex];
    const slot = daySlots[slotIndex];

    setSchedule((prev) => {
      const newSchedule = prev.filter(
        (s) => !(s.dayOfWeek === dayIndex && s.startTime === slot.startTime && s.endTime === slot.endTime)
      );
      return [
        ...newSchedule,
        { ...slot, dayOfWeek: dayIndex, [field]: value },
      ];
    });
  };

  const hasChanges = JSON.stringify(schedule) !== JSON.stringify(initialSchedule.map(s => ({
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
  })));

  async function handleSave() {
    setSaving(true);
    try {
      await setWeeklySchedule(
        schedule.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        memberId
      );
      toast.success('Schedule saved');
      router.refresh();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        {DAYS.map((day, dayIndex) => {
          const daySlots = scheduleByDay[dayIndex];
          const isWorking = daySlots.length > 0;

          return (
            <div
              key={day}
              className="flex items-center gap-4 border-b last:border-b-0 p-4"
            >
              <div className="w-28">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWorking}
                    onChange={() => toggleDay(dayIndex)}
                    className="rounded border-gray-300"
                  />
                  <span className={isWorking ? 'font-medium' : 'text-muted-foreground'}>
                    {day}
                  </span>
                </label>
              </div>

              {isWorking ? (
                <div className="flex items-center gap-2">
                  {daySlots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-2">
                      <select
                        value={slot.startTime}
                        onChange={(e) => updateSlot(dayIndex, slotIndex, 'startTime', e.target.value)}
                        className="rounded border px-2 py-1 text-sm"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <span className="text-muted-foreground">to</span>
                      <select
                        value={slot.endTime}
                        onChange={(e) => updateSlot(dayIndex, slotIndex, 'endTime', e.target.value)}
                        className="rounded border px-2 py-1 text-sm"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Not working</span>
              )}
            </div>
          );
        })}
      </div>

      {hasChanges && (
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Schedule
            </>
          )}
        </Button>
      )}
    </div>
  );
}
