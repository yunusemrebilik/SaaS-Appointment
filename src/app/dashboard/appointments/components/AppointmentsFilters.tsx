'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AppointmentsFiltersProps {
  currentStatus?: string;
  currentDate?: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
];

export function AppointmentsFilters({ currentStatus, currentDate }: AppointmentsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Filter */}
      <div className="flex flex-wrap justify-center gap-1 rounded-lg border bg-card p-1">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={currentStatus === option.value || (!currentStatus && option.value === '') ? 'default' : 'ghost'}
            size="sm"
            className="px-3"
            onClick={() => updateFilter('status', option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={currentDate || ''}
          onChange={(e) => updateFilter('date', e.target.value)}
          className="w-auto"
        />
        {currentDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateFilter('date', '')}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
