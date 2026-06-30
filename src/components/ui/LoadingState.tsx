/**
 * Skeleton loading placeholder shown via route-level loading.tsx files.
 * Uses the shimmer `.skeleton` utility from globals.css (no spinners per
 * DESIGN-SYSTEM.md).
 */
export function LoadingState() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 p-4" aria-busy="true" aria-live="polite">
      <div className="skeleton h-8 w-1/2 rounded-input" />
      <div className="skeleton h-4 w-3/4 rounded-input" />
      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-24 rounded-card" />
        ))}
      </div>
    </div>
  )
}
