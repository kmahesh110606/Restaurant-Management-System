/**
 * StatusBadge — Renders a color-coded status badge.
 */

const STATUS_MAP = {
  pending: { label: 'Pending', class: 'badge-pending' },
  confirmed: { label: 'Confirmed', class: 'badge-confirmed' },
  preparing: { label: 'Preparing', class: 'badge-preparing' },
  ready: { label: 'Ready', class: 'badge-ready' },
  served: { label: 'Served', class: 'badge-served' },
  cancelled: { label: 'Cancelled', class: 'badge-cancelled' },
  paid: { label: 'Paid', class: 'badge-paid' },
  unpaid: { label: 'Unpaid', class: 'badge-unpaid' },
  partial: { label: 'Partial', class: 'badge-pending' },
  active: { label: 'Active', class: 'badge-confirmed' },
  completed: { label: 'Completed', class: 'badge-served' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, class: '' };
  return <span className={`badge ${config.class}`}>{config.label}</span>;
}
