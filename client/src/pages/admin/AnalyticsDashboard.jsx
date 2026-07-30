/**
 * AnalyticsDashboard — Rebuilt charts dashboard with Microsoft Fluent UI icons, updated spacing and contrast styling.
 */

import { useEffect, useState } from 'react';
import {
  DataTrending24Filled,
  Calendar24Regular,
} from '@fluentui/react-icons';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getAnalyticsSummary, getSalesByDay, getPopularItems, getRevenueByCategory } from '../../api/analytics';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#E53935', '#FFB300', '#4CAF50', '#42A5F5', '#AB47BC', '#EC4899', '#26A69A', '#FF7043'];

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
        setSalesData(salesRes.data.map((item) => ({
          date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          revenue: parseFloat(item.total),
          orders: item.count,
        })));
        setPopularData(popRes.data.map((item) => ({
          name: item.name,
          ordered: item.total_ordered,
          revenue: parseFloat(item.total_revenue),
        })));
        setCategoryData(catRes.data.map((item) => ({
          name: item.category,
          value: parseFloat(item.total_revenue),
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
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E53935]/10 border border-[#E53935]/20 flex items-center justify-center text-[#FF5252]">
            <DataTrending24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Analytics & Insights</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">Revenue breakdown, order trends, and popular menu items</p>
          </div>
        </div>

        {/* Time Period selector */}
        <div className="flex items-center gap-1.5 bg-[#1A1A1D] p-1.5 rounded-2xl border border-[#26262A]">
          <Calendar24Regular className="text-[#71717A] ml-2 text-base" />
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => handleDaysChange(d)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                days === d ? 'bg-[#E53935] text-white shadow-md shadow-[#E53935]/25' : 'text-[#71717A] hover:text-[#FAFAFA]'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Over Time Chart */}
      <div className="card p-6 bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl space-y-4">
        <h2 className="text-base font-extrabold text-[#FAFAFA]">Revenue & Orders Over Time</h2>
        {salesData.length === 0 ? (
          <p className="text-center text-[#71717A] py-12 text-sm font-semibold">No analytics data available for this time range</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
              <XAxis dataKey="date" tick={{ fill: '#9E9E9E', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9E9E9E', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#18181A',
                  border: '1px solid #33333A',
                  borderRadius: '12px',
                  color: '#FAFAFA',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#E53935" strokeWidth={3} dot={{ fill: '#E53935', r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="orders" stroke="#FFB300" strokeWidth={2} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items Chart */}
        <div className="card p-6 bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl space-y-4">
          <h2 className="text-base font-extrabold text-[#FAFAFA]">Top Ordered Menu Items</h2>
          {popularData.length === 0 ? (
            <p className="text-center text-[#71717A] py-12 text-sm font-semibold">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                <XAxis type="number" tick={{ fill: '#9E9E9E', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9E9E9E', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#18181A',
                    border: '1px solid #33333A',
                    borderRadius: '12px',
                    color: '#FAFAFA',
                  }}
                />
                <Bar dataKey="ordered" fill="#E53935" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by Category Chart */}
        <div className="card p-6 bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl space-y-4">
          <h2 className="text-base font-extrabold text-[#FAFAFA]">Revenue by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-center text-[#71717A] py-12 text-sm font-semibold">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#18181A',
                    border: '1px solid #33333A',
                    borderRadius: '12px',
                    color: '#FAFAFA',
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
