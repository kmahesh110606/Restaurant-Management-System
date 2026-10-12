export default function LiquidPills({ items = [], value, onChange, size = 'md', className = '' }) {
  const entries = items.map((item) => typeof item === 'object' && item !== null ? item : { value: item, label: typeof item === 'number' ? `${item} days` : String(item) });
  return <div role="group" className={`inline-flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 ${className}`}>
    {entries.map((item) => { const Icon = item.icon; return <button key={String(item.value)} type="button" aria-pressed={item.value === value} onClick={() => onChange?.(item.value)} className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors ${size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'} ${item.value === value ? 'bg-white text-orange-800 shadow-sm' : 'text-gray-600 hover:bg-white'}`}>{Icon && <Icon fontSize={17} />}<span>{item.label}</span></button>; })}
  </div>;
}
