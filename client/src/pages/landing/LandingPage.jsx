/**
 * LandingPage — High-converting, glassmorphic marketing homepage for Savoré RMS.
 * Built with Fluent UI icons, smooth gradients, interactive preview cards, and pricing tiers.
 */

import { Link } from 'react-router-dom';
import {
  FoodRegular,
  GridRegular,
  BowlSaladRegular,
  ReceiptRegular,
  DataBarVerticalRegular,
  TableSimpleRegular,
  PeopleTeamRegular,
  BookOpenRegular,
  CheckmarkCircleRegular,
  ArrowRightRegular,
  StarRegular,
  ShieldCheckmarkRegular,
  GlobeRegular,
  SparkleRegular,
  RocketRegular,
} from '@fluentui/react-icons';
import LandingNavbar from './LandingNavbar';

const FEATURES = [
  {
    icon: TableSimpleRegular,
    title: 'QR Code Table Ordering',
    desc: 'Guests scan desk QR codes, browse your visual digital menu, customize items, and place direct orders without waiting for waitstaff.',
    color: '#EA580C',
    bg: 'bg-orange-50',
  },
  {
    icon: FoodRegular,
    title: 'Live Kitchen Kanban Board',
    desc: 'Audio-notified 4-stage Kanban (Pending, Preparing, Ready, Served) keeps your chefs synchronized and food rolling out hot.',
    color: '#7C3AED',
    bg: 'bg-purple-50',
  },
  {
    icon: ReceiptRegular,
    title: 'Rapid Counter POS & Billing',
    desc: 'Lookup guest orders by Table or Token, calculate automated GST and discounts, and generate print-ready tax invoices in seconds.',
    color: '#10B981',
    bg: 'bg-emerald-50',
  },
  {
    icon: SparkleRegular,
    title: 'Adaptive Operating Workflows',
    desc: 'Switch seamlessly between Table-service (dine-in), Token-service (food courts), and Direct POS counter mode based on your venue type.',
    color: '#3B82F6',
    bg: 'bg-blue-50',
  },
  {
    icon: DataBarVerticalRegular,
    title: 'Revenue Analytics & Trends',
    desc: 'Live Recharts telemetry for daily sales, peak order hours, customer lifetime value, and popular dish popularity rankings.',
    color: '#F59E0B',
    bg: 'bg-amber-50',
  },
  {
    icon: BookOpenRegular,
    title: 'Kitchen Recipe Repository',
    desc: 'Standardize kitchen quality with internal chef recipes, portion sizes, preparation minutes, and detailed step-by-step cooking notes.',
    color: '#EC4899',
    bg: 'bg-pink-50',
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: '₹1,999',
    period: '/month',
    desc: 'Perfect for single-location cafes and bakeries launching digital ordering.',
    features: [
      'Up to 15 dining tables',
      'QR code customer menu',
      'POS counter billing',
      'Basic sales reports',
      'Standard email support',
    ],
    highlight: false,
    cta: 'Start 14-Day Trial',
  },
  {
    name: 'Professional',
    price: '₹4,499',
    period: '/month',
    desc: 'Best for busy dine-in restaurants, bistros, and full-service dining venues.',
    features: [
      'Unlimited tables & tokens',
      'Live Kitchen Display (KDS)',
      'Multi-role staff access (Waiters, Chefs, Cashiers)',
      'Custom brand theming & fonts',
      'Advanced revenue analytics',
      'Priority 24/7 assistance',
    ],
    highlight: true,
    cta: 'Launch Pro Workspace',
  },
  {
    name: 'Multi-Outlet',
    price: '₹9,999',
    period: '/month',
    desc: 'Engineered for restaurant chains, hospitality franchises, and food hubs.',
    features: [
      'Multi-tenant branch management',
      'Centralized recipe repository',
      'Custom domain & white-labeling',
      'Dedicated account manager',
      '99.9% uptime SLA guarantee',
    ],
    highlight: false,
    cta: 'Talk to Enterprise Team',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-warm text-gray-900 selection:bg-orange-500 selection:text-white">
      {/* ═══════════ NAVBAR ═══════════ */}
      <LandingNavbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-gray-200/80 shadow-xs backdrop-blur-md animate-fade-in">
          <SparkleRegular fontSize={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-bold text-gray-800">
            Next-Generation Hospitality Operating System
          </span>
        </div>

        <h1 className="heading-xl max-w-4xl mx-auto animate-slide-up">
          Craft seamless dining experiences from{' '}
          <span className="text-gradient-warm">QR scan to kitchen pan</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Savoré RMS unites self-service QR ordering, kitchen Kanban ticketing, lightning POS billing,
          and dynamic restaurant branding into one unified workspace.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            to="/signup"
            className="btn btn-primary px-8 py-3 text-sm font-extrabold gap-2 shadow-lg shadow-orange-500/25"
          >
            <span>Start Free Trial</span>
            <ArrowRightRegular fontSize={16} />
          </Link>
          <Link
            to="/login"
            className="btn btn-secondary px-7 py-3 text-sm font-bold gap-2"
          >
            <span>Explore Demo Portal</span>
          </Link>
        </div>

        {/* ═══════════ APP DASHBOARD PREVIEW ═══════════ */}
        <div className="pt-10 max-w-5xl mx-auto" id="preview">
          <div className="glass-card p-3 sm:p-5 rounded-3xl border border-white/60 shadow-2xl relative overflow-hidden group">
            {/* Top Bar inside mockup */}
            <div className="bg-white/90 rounded-2xl p-4 sm:p-6 border border-gray-200/70 shadow-xs space-y-6 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center">
                    <FoodRegular fontSize={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">Le Bistro Grand • Live Operations</h3>
                    <p className="text-[11px] text-gray-400">14 tables active • Kitchen average prep: 11 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-ready font-bold text-xs">System Online</span>
                </div>
              </div>

              {/* Mock Stat row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Today's Sales</p>
                  <p className="text-lg font-black text-gray-900 mt-0.5">₹42,850</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Tickets Served</p>
                  <p className="text-lg font-black text-gray-900 mt-0.5">68 Orders</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Active Tables</p>
                  <p className="text-lg font-black text-orange-600 mt-0.5">12 / 16</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Customer Rating</p>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">4.9 ★</p>
                </div>
              </div>

              {/* Mock Live Tickets Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold text-gray-900">
                    <span>Table 4 (QR Order)</span>
                    <span className="badge badge-pending text-[10px]">Pending</span>
                  </div>
                  <p className="text-xs text-gray-600">2× Truffle Pasta, 1× Burrata Salad</p>
                </div>
                <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/40 space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold text-gray-900">
                    <span>Table 9</span>
                    <span className="badge badge-preparing text-[10px]">Preparing</span>
                  </div>
                  <p className="text-xs text-gray-600">1× Ribeye Steak, 2× Artisanal Lemonade</p>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold text-gray-900">
                    <span>Token #104</span>
                    <span className="badge badge-ready text-[10px]">Ready to Serve</span>
                  </div>
                  <p className="text-xs text-gray-600">2× Wood-Fired Margherita Pizza</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="features">
        <div className="text-center space-y-3 mb-16">
          <p className="section-label">Enterprise-Grade Features</p>
          <h2 className="heading-lg">Everything you need to orchestrate your floor</h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Engineered to remove friction from table turnover, optimize kitchen coordination, and elevate customer satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-card p-7 rounded-3xl border border-gray-200/80 hover:border-gray-300 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feat.bg}`}
                  style={{ color: feat.color }}
                >
                  <Icon fontSize={24} />
                </div>
                <h3 className="text-base font-extrabold text-gray-900">{feat.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ WORKFLOW ADAPTABILITY SECTION ═══════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="workflows">
        <div className="glass-card p-8 sm:p-14 rounded-3xl border border-white/80 shadow-lg space-y-8">
          <div className="max-w-2xl space-y-3">
            <span className="badge badge-confirmed font-bold text-xs">Flexible Models</span>
            <h2 className="heading-md">Tailored for Every Style of Dining</h2>
            <p className="text-sm text-gray-600">
              Whether you run an upscale sit-down bistro, a buzzing QSR food hall stall, or a high-volume counter bakery, Savoré adapts instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-extrabold text-base text-gray-900">Table Dine-In</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Unique QR codes for every dining table. Guests browse, order, and track prep from their phone while waitstaff serve courses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-extrabold text-base text-gray-900">Token-Based Counter</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Customers place orders at the entry, receive sequential token badges, and monitor their order readiness on public screens.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-extrabold text-base text-gray-900">Counter POS / Shop</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Direct cashier-assisted billing terminal. Perfect for fast-casual checkouts, takeaways, retail counters, and bakeries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING SECTION ═══════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="pricing">
        <div className="text-center space-y-3 mb-16">
          <p className="section-label">Transparent Subscriptions</p>
          <h2 className="heading-lg">Simple plans that scale with your tables</h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            No hidden setup costs or per-order take rates. Choose the plan that best fits your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className={`p-8 rounded-3xl flex flex-col justify-between transition-all ${
                p.highlight
                  ? 'glass-card border-2 border-[var(--color-primary)] shadow-2xl relative'
                  : 'solid-card bg-white border border-gray-200/80 shadow-sm'
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase bg-[var(--color-primary)] text-white shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900">{p.price}</span>
                  <span className="text-xs font-semibold text-gray-400">{p.period}</span>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2.5">
                  {p.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-gray-700">
                      <CheckmarkCircleRegular fontSize={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/signup"
                  className={`w-full btn py-3 text-xs font-bold ${
                    p.highlight ? 'btn-primary shadow-md shadow-orange-500/25' : 'btn-secondary'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-gray-200/70 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              <FoodRegular fontSize={18} />
            </div>
            <span className="text-base font-extrabold text-gray-900">
              Savoré<span className="text-[var(--color-primary)]">RMS</span>
            </span>
          </div>

          <p className="text-xs text-gray-400 font-medium text-center sm:text-right">
            © {new Date().getFullYear()} Savoré Hospitality Technologies Inc. Production-Ready Restaurant Suite.
          </p>
        </div>
      </footer>
    </div>
  );
}
