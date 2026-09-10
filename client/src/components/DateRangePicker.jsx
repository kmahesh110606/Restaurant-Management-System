/**
 * DateRangePicker — Quick date range selector for analytics and order history.
 * Presets: Today, This Week, This Month, Custom range.
 */

import { useState } from 'react';
import { CalendarRegular } from '@fluentui/react-icons';

const PRESETS = [
  { label: 'Today', key: 'today' },
  { label: 'This Week', key: 'week' },
  { label: 'This Month', key: 'month' },
  { label: 'Custom', key: 'custom' },
];

function getDateRange(preset) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      break;
  }

  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  };
}

export default function DateRangePicker({ onChange, className = '' }) {
  const [activePreset, setActivePreset] = useState('today');
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handlePresetClick = (key) => {
    setActivePreset(key);
    if (key === 'custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const range = getDateRange(key);
    onChange?.(range);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange?.({ start_date: customStart, end_date: customEnd });
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <CalendarRegular fontSize={16} className="text-gray-400 hidden sm:block" />

      {PRESETS.map((preset) => (
        <button
          key={preset.key}
          onClick={() => handlePresetClick(preset.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activePreset === preset.key
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {preset.label}
        </button>
      ))}

      {showCustom && (
        <div className="flex items-center gap-2 animate-fade-in">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="input py-1 px-2 text-xs w-auto"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="input py-1 px-2 text-xs w-auto"
          />
          <button onClick={handleCustomApply} className="btn btn-primary btn-sm text-xs">
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
