import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRegular, ArrowClockwiseRegular } from '@fluentui/react-icons';

const INITIAL = [{ id: 1, table: 8, items: '2 × Margherita · 1 × Iced tea', total: 740, status: 'pending' }, { id: 2, table: 12, items: '1 × Mushroom risotto', total: 520, status: 'preparing' }];
const NEXT = { pending: 'preparing', preparing: 'ready', ready: 'served' };
const LABEL = { pending: 'Start preparing', preparing: 'Mark ready', ready: 'Mark served' };
export default function DemoPortalPage() {
  const [role, setRole] = useState('Kitchen');
  const [orders, setOrders] = useState(INITIAL);
  const [paid, setPaid] = useState([]);
  const advance = (id) => setOrders((previous) => previous.map((order) => order.id === id ? { ...order, status: NEXT[order.status] } : order));
  return <main className="min-h-screen bg-gradient-warm p-5 sm:p-10"><div className="max-w-6xl mx-auto space-y-8">
    <header className="flex justify-between items-center gap-4"><Link to="/" className="btn btn-secondary"><ArrowLeftRegular /> Home</Link><Link to="/signup" className="btn btn-primary">Set up your restaurant</Link></header>
    <div className="flex justify-between items-end gap-4"><div><h1 className="text-3xl font-bold">Try a service</h1><p className="text-sm text-gray-600 mt-2">Sample data in this browser. No real orders or payments.</p></div><button className="btn btn-secondary" onClick={() => { setOrders(INITIAL); setPaid([]); }}><ArrowClockwiseRegular /> Reset</button></div>
    <div className="flex gap-2 flex-wrap" aria-label="Demo role">{['Customer', 'Kitchen', 'Waiter', 'Cashier', 'Manager'].map((name) => <button key={name} aria-pressed={role === name} className={`btn ${role === name ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRole(name)}>{name}</button>)}</div>
    {role === 'Customer' && <section className="glass-card p-6 space-y-4"><h2 className="text-xl font-bold">Table 3</h2><p>House burger & lemonade · ₹480</p><button className="btn btn-primary" onClick={() => { setOrders((previous) => [...previous, { id: Math.max(...previous.map((item) => item.id), 0) + 1, table: 3, items: '1 × House burger · 1 × Lemonade', total: 480, status: 'pending' }]); setRole('Kitchen'); }}>Place sample order</button></section>}
    {role === 'Manager' && <section className="grid grid-cols-2 sm:grid-cols-3 gap-4"><div className="glass-card p-5"><p className="text-sm text-gray-500">Orders</p><p className="text-3xl font-bold">{orders.length}</p></div><div className="glass-card p-5"><p className="text-sm text-gray-500">Payments recorded</p><p className="text-3xl font-bold">₹{orders.filter((order) => paid.includes(order.id)).reduce((sum, order) => sum + order.total, 0)}</p></div><div className="glass-card p-5"><p className="text-sm text-gray-500">In progress</p><p className="text-3xl font-bold">{orders.filter((order) => order.status !== 'served').length}</p></div></section>}
    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Sample orders">{orders.filter((order) => role !== 'Waiter' || order.status === 'ready' || order.status === 'served').map((order) => <article key={order.id} className="glass-card p-6 space-y-4"><div className="flex justify-between gap-3"><h2 className="font-bold">Table {order.table}</h2><span className="text-sm capitalize text-gray-600">{order.status}</span></div><p className="text-sm text-gray-600">{order.items}</p><p className="font-semibold">₹{order.total}</p>{role === 'Kitchen' && ['pending', 'preparing'].includes(order.status) && <button className="btn btn-primary w-full" onClick={() => advance(order.id)}>{LABEL[order.status]}</button>}{role === 'Waiter' && order.status === 'ready' && <button className="btn btn-primary w-full" onClick={() => advance(order.id)}>Mark served</button>}{role === 'Cashier' && <button className="btn btn-primary w-full" disabled={paid.includes(order.id)} onClick={() => setPaid((previous) => [...previous, order.id])}>{paid.includes(order.id) ? 'Payment recorded' : 'Record sample payment'}</button>}</article>)}</section>
    {role === 'Waiter' && !orders.some((order) => ['ready', 'served'].includes(order.status)) && <p className="glass-card p-8 text-gray-600">No orders ready. Mark a ticket ready in the kitchen first.</p>}
  </div></main>;
}
