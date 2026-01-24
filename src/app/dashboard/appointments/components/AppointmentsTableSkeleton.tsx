export function AppointmentsTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Table header */}
      <div className="border-b px-6 py-4">
        <div className="grid grid-cols-6 gap-4">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-12 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="px-6 py-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="grid grid-cols-6 gap-4 items-center">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted/60 rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
