export default function VehicleDetailLoading() {
  return (
    <div
      className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-4 w-36 animate-pulse rounded bg-elevated" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="aspect-[16/10] animate-pulse rounded-lg border border-line bg-surface" />
            <div className="h-64 animate-pulse rounded-lg border border-line bg-surface" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 animate-pulse rounded-lg border border-line bg-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}
