export function CalendarSkeleton() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 gap-1 border rounded-lg overflow-hidden">
        {days.map((day) => (
          <div key={day} className="flex flex-col">
            {/* Day header */}
            <div className="h-12 bg-muted/50 border-b flex items-center justify-center">
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>

            {/* Time slots */}
            <div className="flex-1 p-2 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/30 rounded animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
