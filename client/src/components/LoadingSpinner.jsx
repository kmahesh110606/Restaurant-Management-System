/**
 * LoadingSpinner — Animated loading indicator.
 */

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} rounded-full border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin`}
        style={{ animation: 'spin 0.8s linear infinite' }}
      />
    </div>
  );
}
