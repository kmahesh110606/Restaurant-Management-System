/**
 * AnalyticsDashboard — Performance intelligence and business reports with Recharts.
 * Line charts for daily sales, bar charts for popular items, donut charts for category shares.
 */

import { useEffect, useState } from 'react';
import {
  DataBarVerticalRegular,
  CalendarRegular,
  ArrowTrendingLinesRegular,
  MoneyRegular,
  ReceiptRegular,
  PeopleRegular,
} from '@fluentui/react-icons';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  getAnalyticsSummary,
  getSalesByDay,
  getPopularItems,
  getRevenueByCategory,
} from '../../api/analytics';
import LoadingSpinner from '../../components/LoadingSpinner';

const CHART_COLORS = ['#EA580C', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'];

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
        setSalesData(
          (salesRes.data || []).map((item) => ({
            date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            revenue: parseFloat(item.total || 0),
            orders: item.count || 0,
          }))
        );
        setPopularData(
          (popRes.data || []).map((item) => ({
            name: item.name,
            ordered: item.total_ordered,
            revenue: parseFloat(item.total_revenue || 0),
          }))
        );
        setCategoryData(
          (catRes.data || []).map((item) => ({
            name: item.category,
            value: parseFloat(item.total_revenue || 0),
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDaysChange = (d) => {
    setDays(d);
    fetchAll(d);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${(summary?.total_revenue || 0).toLocaleString()}`,
      icon: MoneyRegular,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Settled Orders',
      value: summary?.total_orders || 0,
      icon: ReceiptRegular,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Unique Diners',
      value: summary?.total_customers || 0,
      icon: PeopleRegular,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Avg Ticket Size',
      value: `₹${(summary?.avg_order_value || 0).toFixed(0)}`,
      icon: ArrowTrendingLinesRegular,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20"
            style={{ background: '#2563EB' }}
          >
            <DataBarVerticalRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics & Intelligence</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Sales performance, order frequencies, and category demand
            </p>
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-xs">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => handleDaysChange(d)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                days === d
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ KPI STAT CARDS ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.label}
              className="stat-card glass-card p-5 flex items-center gap-4 border border-gray-200/80"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${st.bg} ${st.color}`}>
                <Icon fontSize={22} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-gray-900 tracking-tight truncate">{st.value}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">{st.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════ SALES TREND CHART ═══════════ */}
      <div className="solid-card bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Revenue & Order Volume Trend</h2>
            <p className="text-xs text-gray-400 font-medium">Daily billing aggregate over selected timeframe</p>
          </div>
          <span className="badge badge-ready font-bold text-xs">Live API</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue (₹)"
                stroke="#EA580C"
                strokeWidth={3}
                dot={{ fill: '#EA580C', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══════════ DUAL CHARTS: POPULAR ITEMS & CATEGORIES ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Popular Dishes Bar Chart (7 cols) */}
        <div className="lg:col-span-7 solid-card bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Top Performing Dishes</h2>
            <p className="text-xs text-gray-400 font-medium">Ranked by total quantity ordered</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="ordered" name="Portions Ordered" fill="#10B981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart (5 cols) */}
        <div className="lg:col-span-5 solid-card bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Revenue by Category</h2>
            <p className="text-xs text-gray-400 font-medium">Distribution across food categories</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-gray-400">No category sales recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
