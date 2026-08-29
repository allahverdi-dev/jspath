import { Skeleton } from '../ui/index.jsx';

/** Route-level loading state. Skeletons mirror the layout that is arriving. */
export function PageSkeleton() {
  return (
    <div className="animate-fade-in" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    </div>
  );
}

export function ContentSkeleton({ lines = 6 }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${70 + ((i * 13) % 30)}%` }} />
      ))}
    </div>
  );
}
