/**
 * EmptyState — Reusable empty state with icon, title, subtitle, and optional CTA.
 */

import { BoxRegular } from '@fluentui/react-icons';

export default function EmptyState({
  icon: Icon = BoxRegular,
  title = 'No data found',
  subtitle = '',
  actionLabel = '',
  onAction = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon fontSize={28} className="text-gray-400" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{subtitle}</p>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
