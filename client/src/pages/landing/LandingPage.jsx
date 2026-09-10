/**
 * LandingPage — iOS 28 Liquid Glassmorphism Marketing Homepage.
 * Pure RMS (Restaurant Management System) branding.
 * Features ultra-visible liquid glass transparency, ambient moving mesh orbs,
 * real optical refraction, specular rim lights, and refined human-crafted typography.
 */

import { Link } from 'react-router-dom';
import {
  FoodRegular,
  BowlSaladRegular,
  ReceiptRegular,
  DataBarVerticalRegular,
  TableSimpleRegular,
  PeopleTeamRegular,
  BookOpenRegular,
  CheckmarkCircleRegular,
  ArrowRightRegular,
  SparkleRegular,
  TimerRegular,
  ArrowTrendingLinesRegular,
  ShieldCheckmarkRegular,
  CheckmarkRegular,
} from '@fluentui/react-icons';
import LandingNavbar from './LandingNavbar';

const FEATURES = [
  {
    icon: TableSimpleRegular,
    title: 'QR Code Table Ordering',
    desc: 'Guests scan desk QR codes, browse your visual digital menu, customize dishes, and order directly without waiting for waitstaff.',
    color: '#EA580C',
    bg: 'rgba(234, 88, 12, 0.12)',
  },
  {
    icon: BowlSaladRegular,
    title: 'Live Kitchen Kanban Board',
    desc: 'Audio-synchronized 4-stage Kanban (Pending, Preparing, Ready, Served) keeps your chefs coordinated and food rolling out hot.',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.12)',
  },
  {
    icon: ReceiptRegular,
    title: 'Rapid Counter POS & Billing',
    desc: 'Lookup orders by Table or Token, calculate automatic taxes and discounts, and generate print-ready tax invoices in milliseconds.',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    icon: SparkleRegular,
    title: 'Adaptive Operating Workflows',
    desc: 'Switch effortlessly between Table-service (dine-in), Token-service (food courts), and Direct POS counter mode based on your floor type.',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
  {
    icon: DataBarVerticalRegular,
    title: 'Revenue Analytics & Telemetry',
    desc: 'Live telemetry for daily turnover, peak table hours, ticket velocity, and top-selling signature dishes with instant insights.',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  {
    icon: BookOpenRegular,
    title: 'Chef Recipe Standardization',
    desc: 'Standardize kitchen output with internal chef recipes, portion controls, preparation minutes, and step-by-step plating guides.',
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.12)',
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: '₹1,999',
    period: '/month',
    desc: 'Essential digital tools for single-location cafes, bistros, and bakeries.',
    features: [
      'Up to 15 dining tables',
      'QR code customer menu & ordering',
      'POS counter cashier terminal',
      'Standard daily sales telemetry',
      'Fast email & setup support',
    ],
    highlight: false,
    cta: 'Start 14-Day Trial',
  },
  {
    name: 'Professional',
    price: '₹4,499',
    period: '/month',
    desc: 'Designed for high-traffic dine-in restaurants and busy venues.',
    features: [
      'Unlimited tables & token queue',
      'Live Kitchen Display System (KDS)',
      'Multi-role staff access (Waiters, Chefs, Billers)',
      'Custom theme engine & branding',
      'Real-time revenue telemetry & reports',
      'Priority 24/7 direct assistance',
    ],
    highlight: true,
    cta: 'Launch Pro Workspace',
  },
  {
    name: 'Multi-Outlet',
    price: '₹9,999',
    period: '/month',
    desc: 'Enterprise architecture for restaurant chains and hospitality franchises.',
    features: [
      'Multi-tenant branch management',
      'Centralized recipe repository',
      'Custom domain & white-labeling',
      'Dedicated account manager',
      '99.9% uptime SLA guarantee',
    ],
    highlight: false,
    cta: 'Contact Enterprise',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-warm text-slate-900 selection:bg-orange-500 selection:text-white bg-mesh-canvas relative overflow-hidden">
      {/* ═══════════ AMBIENT FLUID GLOW ORBS ═══════════ */}
      <div className="ambient-glow-orb-1" />
      <div className="ambient-glow-orb-2" />
      <div className="ambient-glow-orb-3" />

      {/* ═══════════ FLOATING NAVBAR ═══════════ */}
      <LandingNavbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="pt-36 sm:pt-44 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto text-center relative z-10">
        {/* Hero Title — Clean, confident, no AI pill tags */}
        <h1 className="heading-xl max-w-5xl mx-auto mb-6 animate-slide-up tracking-tight">
          Craft seamless dining experiences from{' '}
          <span className="text-gradient-warm">QR scan to kitchen pan</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          A unified liquid glass workspace orchestrating customer self-ordering, real-time kitchen Kanban ticketing, lightning POS billing, and intelligent revenue telemetry.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/signup"
            className="btn btn-primary btn-xl gap-2.5 shadow-xl shadow-orange-500/25 rounded-full px-8 py-4 font-extrabold text-sm"
          >
            <span>Start Free Trial</span>
            <ArrowRightRegular fontSize={17} />
          </Link>
          <Link
            to="/login"
            className="btn btn-secondary btn-xl gap-2 rounded-full px-8 py-4 font-bold text-sm bg-white/40 hover:bg-white/70 border border-white/70 shadow-sm"
          >
            <span>Explore Demo Portal</span>
          </Link>
        </div>

        {/* ═══════════ APP DASHBOARD PREVIEW (iOS 28 Liquid Glass Cockpit) ═══════════ */}
        <div className="pt-4 max-w-6xl mx-auto relative" id="preview">
          {/* Subtle colorful back-glow spotlight behind cockpit */}
          <div
            className="absolute inset-x-12 top-10 h-64 pointer-events-none rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(234, 88, 12, 0.22) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 75%)',
              filter: 'blur(70px)',
              zIndex: 0,
            }}
          />

          <div className="glass-card p-3 sm:p-5 rounded-3xl relative overflow-hidden group shadow-2xl">
            {/* Inner Frosted Cockpit */}
            <div className="glass-panel p-5 sm:p-8 rounded-2xl space-y-6 text-left border border-white/75 relative z-10">
              {/* Cockpit Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/60">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <FoodRegular fontSize={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-black text-slate-900">Grand Bistro & Bar</h3>
                      <span className="badge badge-ready text-[10px] py-0.5 px-2.5">Live Floor</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">14 active tables • Average prep time: 11 mins</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-extrabold backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                    Kitchen Display Active
                  </span>
                </div>
              </div>

              {/* Cockpit Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/45 hover:bg-white/65 backdrop-blur-xl border border-white/80 shadow-xs transition-all duration-200">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Today's Revenue</span>
                    <ArrowTrendingLinesRegular fontSize={14} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">₹42,850</p>
                  <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">+18% vs yesterday</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/45 hover:bg-white/65 backdrop-blur-xl border border-white/80 shadow-xs transition-all duration-200">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Orders Served</span>
                    <CheckmarkCircleRegular fontSize={14} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">68 Tickets</p>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 inline-block">100% fulfill rate</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/45 hover:bg-white/65 backdrop-blur-xl border border-white/80 shadow-xs transition-all duration-200">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Table Occupancy</span>
                    <TableSimpleRegular fontSize={14} className="text-orange-500" />
                  </div>
                  <p className="text-2xl font-black text-orange-600 tracking-tight">12 / 16</p>
                  <span className="text-[11px] font-bold text-orange-600/90 mt-1 inline-block">75% capacity</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/45 hover:bg-white/65 backdrop-blur-xl border border-white/80 shadow-xs transition-all duration-200">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Avg Ticket Prep</span>
                    <TimerRegular fontSize={14} className="text-purple-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">11.4 min</p>
                  <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">Under target</span>
                </div>
              </div>

              {/* Mock Live Tickets Preview */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Live Ticket Stream</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl border border-amber-300/50 bg-amber-500/10 backdrop-blur-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-900">
                      <span>Table 4 (QR Order)</span>
                      <span className="badge badge-pending text-[10px]">Pending</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">2× Truffle Pasta, 1× Burrata Salad</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-purple-300/50 bg-purple-500/10 backdrop-blur-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-900">
                      <span>Table 9</span>
                      <span className="badge badge-preparing text-[10px]">Preparing</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">1× Ribeye Steak, 2× Artisanal Lemonade</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-emerald-300/50 bg-emerald-500/10 backdrop-blur-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-900">
                      <span>Token #104</span>
                      <span className="badge badge-ready text-[10px]">Ready to Serve</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">2× Wood-Fired Margherita Pizza</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto relative z-10" id="features">
        <div className="text-center space-y-4 mb-16">
          <h2 className="heading-lg">Everything you need to orchestrate your floor</h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Engineered to remove friction from table turnover, optimize kitchen coordination, and elevate diner satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-card-interactive p-8 rounded-3xl space-y-4"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: feat.bg, color: feat.color }}
                >
                  <Icon fontSize={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ WORKFLOW ADAPTABILITY SECTION ═══════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto relative z-10" id="workflows">
        <div className="glass-card p-8 sm:p-14 rounded-3xl space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="heading-md">Tailored for Every Style of Dining</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Whether you operate an upscale sit-down bistro, a buzzing food hall stall, or a high-volume counter bakery, the platform adapts effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/75 space-y-3 shadow-xs transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Table Dine-In</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Unique QR codes for every dining table. Guests browse, customize, and order while waitstaff seamlessly fulfill courses.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/75 space-y-3 shadow-xs transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Token-Based QSR</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Guests place orders at entry, receive digital token numbers, and track prep completion on live public pickup screens.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/75 space-y-3 shadow-xs transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Counter POS / Bakery</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Direct cashier-assisted billing terminal. Perfect for quick takeaway counters, delis, coffee shops, and retail checkouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING SECTION ═══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto relative z-10" id="pricing">
        <div className="text-center space-y-4 mb-16">
          <h2 className="heading-lg">Simple plans that scale with your tables</h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            No hidden commissions or per-order take rates. Select the plan that fits your dining venue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className={`p-8 sm:p-9 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                p.highlight
                  ? 'glass-card bg-white/55 backdrop-blur-3xl border-2 border-orange-500/70 shadow-2xl shadow-orange-500/15 relative md:-translate-y-2'
                  : 'glass-card bg-white/40 backdrop-blur-2xl shadow-sm'
              }`}
            >
              <div className="space-y-6">
                {p.highlight && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-600 border border-orange-500/25">
                    ★ Most Popular Plan
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{p.price}</span>
                  <span className="text-xs font-bold text-slate-400">{p.period}</span>
                </div>

                <div className="pt-5 border-t border-slate-200/60 space-y-3">
                  {p.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs font-medium text-slate-700">
                      <CheckmarkCircleRegular fontSize={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/signup"
                  className={`w-full btn py-3 text-xs font-bold justify-center rounded-full ${
                    p.highlight ? 'btn-primary shadow-lg shadow-orange-500/25' : 'btn-secondary bg-white/40 hover:bg-white/70 border border-white/60'
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
      <footer className="border-t border-slate-200/60 py-12 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
            >
              <FoodRegular fontSize={16} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900">RMS</span>
              <span className="text-xs text-slate-400 font-semibold">• Restaurant Management System</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium text-center sm:text-right">
            © {new Date().getFullYear()} Restaurant Management System Technologies Inc. Production-Ready Suite.
          </p>
        </div>
      </footer>
    </div>
  );
}
