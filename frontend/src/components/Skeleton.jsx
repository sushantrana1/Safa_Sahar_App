export function SkeletonLine({ className = "" }) {
  return <div className={`bg-slate-200 rounded animate-pulse ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex gap-3">
      <div className="w-20 h-20 rounded-lg bg-slate-200 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-2/3" />
        <SkeletonLine className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}