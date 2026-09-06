export default function AppLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-3.5 w-32 rounded bg-surface-2" />
        <div className="h-8 w-80 rounded bg-surface-2" />
        <div className="h-4 w-96 rounded bg-surface-2" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-36 rounded-xl border border-border bg-surface p-5" />
        <div className="h-36 rounded-xl border border-border bg-surface p-5" />
        <div className="h-36 rounded-xl border border-border bg-surface p-5" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="h-10 border-b border-border bg-surface-2" />
        <div className="divide-y divide-border">
          <div className="h-14 bg-surface" />
          <div className="h-14 bg-surface" />
          <div className="h-14 bg-surface" />
          <div className="h-14 bg-surface" />
        </div>
      </div>
    </div>
  );
}
