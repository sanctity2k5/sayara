export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2 border-b border-line pb-6">
        <div className="h-3 w-40 animate-pulse rounded bg-elevated" />
        <div className="h-9 w-56 animate-pulse rounded bg-elevated" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-28 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="h-80 animate-pulse rounded-lg border border-line bg-surface lg:col-span-8" />
        <div className="h-80 animate-pulse rounded-lg border border-line bg-surface lg:col-span-4" />
      </div>
    </div>
  );
}
