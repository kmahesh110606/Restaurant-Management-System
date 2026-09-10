/**
 * StatusBadge — Renders a colored badge with icon for order/payment statuses.
 */

import {
  ClockRegular,
  CheckmarkCircleRegular,
  ArrowSyncRegular,
  FoodRegular,
  CheckmarkRegular,
  DismissCircleRegular,
  MoneyRegular,
  WarningRegular,
} from '@fluentui/react-icons';

const STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'badge-pending', icon: ClockRegular },
  confirmed: { label: 'Confirmed', className: 'badge-confirmed', icon: CheckmarkRegular },
  preparing: { label: 'Preparing', className: 'badge-preparing', icon: ArrowSyncRegular },
  ready: { label: 'Ready', className: 'badge-ready', icon: FoodRegular },
  served: { label: 'Served', className: 'badge-served', icon: CheckmarkCircleRegular },
  cancelled: { label: 'Cancelled', className: 'badge-cancelled', icon: DismissCircleRegular },
  paid: { label: 'Paid', className: 'badge-paid', icon: MoneyRegular },
  unpaid: { label: 'Unpaid', className: 'badge-unpaid', icon: WarningRegular },
  partial: { label: 'Partial', className: 'badge-partial', icon: ClockRegular },
  active: { label: 'Active', className: 'badge-ready', icon: CheckmarkCircleRegular },
  completed: { label: 'Completed', className: 'badge-served', icon: CheckmarkCircleRegular },
};

export default function StatusBadge({ status, showIcon = true, className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'badge-pending',
    icon: ClockRegular,
  };

  const Icon = config.icon;

  return (
    <span className={`badge ${config.className} ${className}`}>
      {showIcon && <Icon fontSize={12} />}
      {config.label}
    </span>
  );
}
