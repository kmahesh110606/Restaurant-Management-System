export default function CustomSelect({ options = [], value, onChange, placeholder = 'Select an option', className = '', disabled = false, size = 'md', required = false, id, name, ...props }) {
  const entries = options.map((option) => {
    if (typeof option === 'object' && option !== null) return 'value' in option ? option : { value: option.id, label: option.name || option.title || String(option.id) };
    return { value: option, label: String(option) };
  });
  return <select id={id} name={name} value={value ?? ''} disabled={disabled} required={required} aria-label={props['aria-label'] || placeholder} className={`input w-full ${size === 'sm' ? 'text-xs' : 'text-sm'} ${className}`} onChange={(event) => { const selected = entries.find((entry) => String(entry.value) === event.target.value); onChange?.(selected ? selected.value : ''); }}>
    {!entries.some((entry) => String(entry.value) === '') && <option value="" disabled={required}>{placeholder}</option>}
    {entries.map((entry) => <option key={String(entry.value)} value={entry.value} disabled={entry.disabled}>{entry.label}</option>)}
  </select>;
}
