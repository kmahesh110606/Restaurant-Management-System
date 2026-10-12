import { useEffect, useState } from 'react';
import { getMenuItems } from '../../api/menu';
import { createOrder } from '../../api/orders';
import toast from 'react-hot-toast';

export default function CounterOrderForm({ restaurant, onCreated }) {
  const [menu, setMenu] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    getMenuItems().then(({ data }) => setMenu((data.results || data).filter((item) => item.is_available))).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const items = Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => ({ menu_item: Number(id), quantity }));
    if (!items.length) { toast.error('Choose at least one item'); return; }
    setBusy(true);
    try { const { data } = await createOrder({ restaurant_slug: restaurant.slug, phone_number: phone, items }); onCreated(data); }
    catch (err) { toast.error(err.response?.data?.detail || 'Could not create the order.'); }
    finally { setBusy(false); }
  };
  if (loading) return <p role="status">Loading menu…</p>;
  if (error) return <p role="alert">Could not load the menu. Close this dialog and try again.</p>;
  return <form onSubmit={submit} className="space-y-5"><label className="block text-sm font-semibold">Customer phone<input className="input w-full mt-2" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={17} required /></label><div className="space-y-3 max-h-80 overflow-auto">{menu.map((item) => <label key={item.id} className="flex justify-between items-center gap-4 border-b border-gray-100 pb-3"><span className="text-sm">{item.name}<span className="block text-gray-500">{restaurant.currency} {Number(item.price).toFixed(2)}</span></span><input aria-label={`Quantity for ${item.name}`} type="number" min="0" max="100" className="input w-20" value={quantities[item.id] || 0} onChange={(event) => setQuantities((previous) => ({ ...previous, [item.id]: Math.max(0, Math.min(100, Math.floor(Number(event.target.value)))) }))} /></label>)}</div>{!menu.length && <p>Add available dishes to the menu first.</p>}<button type="submit" className="btn btn-primary w-full" disabled={busy || !menu.length}>{busy ? 'Creating order…' : 'Create order'}</button></form>;
}
