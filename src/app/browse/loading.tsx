export default function BrowseLoading() {
  return (
    <div
      className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3 border-b border-line pb-6">
          <div className="h-3 w-32 animate-pulse rounded bg-elevated" />
          <div className="h-10 w-64 animate-pulse rounded bg-elevated" />
        </div>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="hidden lg:col-span-3 lg:block">
            <div className="h-[460px] animate-pulse rounded-lg border border-line bg-surface" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg border border-line bg-surface">
                <div className="aspect-[16/10] animate-pulse bg-elevated" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-elevated" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-elevated" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-elevated" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
