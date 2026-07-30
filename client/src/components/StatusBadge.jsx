/**
 * StatusBadge — Renders a color-coded status badge.
 */  // Component header docstring explaining StatusBadge usage

const STATUS_MAP = {  // Define configuration mapping status keys to human labels and CSS badge classes
  pending: { label: 'Pending', class: 'badge-pending' },  // Config for Pending status
  confirmed: { label: 'Confirmed', class: 'badge-confirmed' },  // Config for Confirmed status
  preparing: { label: 'Preparing', class: 'badge-preparing' },  // Config for Preparing status
  ready: { label: 'Ready', class: 'badge-ready' },  // Config for Ready status
  served: { label: 'Served', class: 'badge-served' },  // Config for Served status
  cancelled: { label: 'Cancelled', class: 'badge-cancelled' },  // Config for Cancelled status
  paid: { label: 'Paid', class: 'badge-paid' },  // Config for Paid status
  unpaid: { label: 'Unpaid', class: 'badge-unpaid' },  // Config for Unpaid status
  partial: { label: 'Partial', class: 'badge-pending' },  // Config for Partial payment status
  active: { label: 'Active', class: 'badge-confirmed' },  // Config for Active entity status
  completed: { label: 'Completed', class: 'badge-served' },  // Config for Completed status
};  // End STATUS_MAP dictionary

export default function StatusBadge({ status }) {  // Export StatusBadge component receiving status prop
  const config = STATUS_MAP[status] || { label: status, class: '' };  // Retrieve status config or fallback to raw status label
  return <span className={`badge ${config.class}`}>{config.label}</span>;  // Render styled span badge element containing text label
}  // End StatusBadge function

