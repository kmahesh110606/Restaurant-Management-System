/**
 * LoadingSpinner — Full-page or inline loading state with skeleton cards.
 */

export default function LoadingSpinner({ fullPage = true, text = 'Loading...' }) {
  if (!fullPage) {
    return (
      <div className="flex items-center justify-center gap-2.5 py-8">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin" />
        <span className="text-sm text-gray-500 font-medium">{text}</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton skeleton-heading mb-2" />
          <div className="skeleton skeleton-text w-48" />
        </div>
        <div className="skeleton w-28 h-9 rounded-xl" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
}
