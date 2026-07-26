/**
 * LoadingSpinner — Animated loading indicator.
 */  // Component docstring describing LoadingSpinner

export default function LoadingSpinner({ size = 'md', className = '' }) {  // Export LoadingSpinner component accepting size and custom className props
  const sizes = {  // Define CSS class map for spinner dimensions and border widths
    sm: 'w-5 h-5 border-2',  // Small spinner size mapping
    md: 'w-8 h-8 border-3',  // Medium default spinner size mapping
    lg: 'w-12 h-12 border-4',  // Large spinner size mapping
  };  // End sizes map object

  return (  // Return JSX element tree
    <div className={`flex items-center justify-center ${className}`}>  {/* Outer container centering the spinner */}
      <div  {/* Inner animated spinning circle element */}
        className={`${sizes[size]} rounded-full border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin`}  {/* Circle border styling and theme colors */}
        style={{ animation: 'spin 0.8s linear infinite' }}  {/* Inline animation style for smooth rotation */}
      />  {/* Close spinner circle element */}
    </div>  {/* Close outer flex container */}
  );  // End return statement
}  // End LoadingSpinner component

