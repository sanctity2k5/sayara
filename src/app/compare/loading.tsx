export default function CompareLoading() {
  return (
    <div
      className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3 border-b border-line pb-6">
          <div className="h-3 w-36 animate-pulse rounded bg-elevated" />
          <div className="h-10 w-64 animate-pulse rounded bg-elevated" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-64 animate-pulse rounded-lg border border-line bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
