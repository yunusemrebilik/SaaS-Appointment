export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-4 bg-muted rounded" />
          </div>
          <div className="mt-3 h-8 w-16 bg-muted rounded" />
          <div className="mt-2 h-3 w-20 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
