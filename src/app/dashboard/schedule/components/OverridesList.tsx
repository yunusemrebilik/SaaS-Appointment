'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteOverride, ScheduleOverride } from '@/actions/schedules';



interface OverridesListProps {
  overrides: ScheduleOverride[];
}

const TYPE_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  day_off: { label: 'Day Off', variant: 'destructive' },
  time_off: { label: 'Time Off', variant: 'secondary' },
  extra_work: { label: 'Extra Hours', variant: 'default' },
};

export function OverridesList({ overrides }: OverridesListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this exception?')) return;

    setDeletingId(id);
    try {
      await deleteOverride(id);
      toast.success('Exception deleted');
      router.refresh();
    } catch (error) {
      console.error('Error deleting override:', error);
      toast.error('Failed to delete exception');
    } finally {
      setDeletingId(null);
    }
  }

  if (overrides.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-3 font-medium">No upcoming exceptions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add day-offs or schedule changes as needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {overrides.map((override) => {
        const typeInfo = TYPE_LABELS[override.type];
        const dateStr = new Date(override.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={override.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
          >
            <div className="flex items-center gap-4">
              <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
              <div>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{dateStr}</span>
                </div>
                {override.startTime && override.endTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{override.startTime} - {override.endTime}</span>
                  </div>
                )}
                {override.reason && (
                  <p className="mt-1 text-sm text-muted-foreground">{override.reason}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(override.id)}
              disabled={deletingId === override.id}
              className="text-destructive hover:text-destructive"
            >
              {deletingId === override.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
