/**
 * AnalyticsDashboard — Charts: sales by day, popular items, peak hours, revenue by category.
 */

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getAnalyticsSummary, getSalesByDay, getPopularItems, getRevenueByCategory } from '../../api/analytics';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899', '#14b8a6'];

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [popularData, setPopularData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchAll = (d = days) => {
    setLoading(true);
    Promise.all([
      getAnalyticsSummary({ days: d }),
      getSalesByDay({ days: d }),
      getPopularItems({ days: d, limit: 8 }),
      getRevenueByCategory({ days: d }),
    ])
      .then(([sumRes, salesRes, popRes, catRes]) => {
        setSummary(sumRes.data);
        setSalesData(salesRes.data.map((d) => ({
          date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          revenue: parseFloat(d.total),
          orders: d.count,
        })));
        setPopularData(popRes.data.map((d) => ({
          name: d.name,
          ordered: d.total_ordered,
          revenue: parseFloat(d.total_revenue),
        })));
        setCategoryData(catRes.data.map((d) => ({
          name: d.category,
          value: parseFloat(d.total_revenue),
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDaysChange = (d) => {
    setDays(d);
    fetchAll(d);
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">📊 Analytics</h1>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => handleDaysChange(d)}
              className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-secondary'}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Sales over time */}
      <div className="card p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Revenue Over Time</h2>
        {salesData.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-8">No data for this period</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="orders" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Popular items */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Most Popular Items</h2>
          {popularData.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                  }}
                />
                <Bar dataKey="ordered" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by category */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Revenue by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
