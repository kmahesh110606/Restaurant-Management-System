/**
 * LandingPage — 3D scroll-driven landing page for DineFlow.
 *
 * Sections:
 *   1. Hero with Three.js 3D food scene
 *   2. Features showcase with scroll animations
 *   3. Device demo section with 3D rotating mockups
 *   4. Stats / Social proof
 *   5. Pricing CTA
 *   6. Footer
 */

import { useRef, Suspense, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  IoRestaurant, IoGrid, IoPeople, IoBarChart, IoWallet,
  IoTabletLandscape, IoFlame, IoCheckmarkCircle, IoArrowForward,
  IoRocket, IoShieldCheckmark, IoGlobe, IoStar,
} from 'react-icons/io5';
import LandingNavbar from './LandingNavbar';
import DeviceMockup3D from './DeviceMockup3D';

// Lazy load 3D scene for performance
import { lazy } from 'react';
const Scene3D = lazy(() => import('./Scene3D'));

/* ── Reusable animated section wrapper ── */
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon: Icon, title, description, color, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      style={{
        background: '#1E1E1E',
        borderRadius: '16px',
        padding: '32px 24px',
        border: '1px solid #272727',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 8px 30px ${color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#272727';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle at 50% 50%, ${color}08, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        position: 'relative',
      }}>
        <Icon size={26} color={color} />
      </div>
      <h3 style={{
        fontSize: '1.2rem',
        fontWeight: 800,
        color: '#FAFAFA',
        marginBottom: '8px',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.9rem',
        color: '#9E9E9E',
        lineHeight: 1.6,
      }}>
        {description}
      </p>
    </motion.div>
  );
}

/* ── Stat Counter ── */
function StatItem({ value, label, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const target = parseInt(value);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 'clamp(2rem, 4vw, 3.5rem)',
        fontWeight: 900,
        letterSpacing: '-0.03em',
        background: 'linear-gradient(135deg, #FF5252, #FFB300)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#9E9E9E', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  );
}

/* ── Pricing Card ── */
function PricingCard({ name, price, period, features, highlighted = false, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      style={{
        background: highlighted ? 'linear-gradient(145deg, #1E1E1E, #252525)' : '#1E1E1E',
        borderRadius: '20px',
        padding: '36px 28px',
        border: highlighted ? '2px solid #E53935' : '1px solid #272727',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: highlighted ? '0 0 40px rgba(229,57,53,0.15)' : 'none',
        flex: '1',
        minWidth: '280px',
        maxWidth: '380px',
      }}
    >
      {highlighted && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'linear-gradient(135deg, #E53935, #FF8F00)',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Popular
        </div>
      )}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9E9E9E', marginBottom: '8px' }}>{name}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.03em' }}>{price}</span>
        <span style={{ fontSize: '0.9rem', color: '#616161', fontWeight: 600 }}>/{period}</span>
      </div>
      <div style={{ height: '1px', background: '#272727', margin: '20px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E0E0E0', fontSize: '0.9rem' }}>
            <IoCheckmarkCircle size={18} color={highlighted ? '#E53935' : '#4CAF50'} />
            <span>{f}</span>
          </div>
        ))}
      </div>
      <Link
        to="/signup"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '14px',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '0.95rem',
          textDecoration: 'none',
          transition: 'all 0.2s',
          ...(highlighted
            ? {
              background: 'linear-gradient(135deg, #E53935, #C62828)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(229,57,53,0.3)',
            }
            : {
              background: 'transparent',
              color: '#E0E0E0',
              border: '1px solid #333',
            }),
        }}
      >
        Get Started
      </Link>
    </motion.div>
  );
}

/* ── WebGL Fallback ── */
function canWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function HeroFallback() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
    }}>
      {/* Animated gradient orbs as fallback */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(229,57,53,0.15), transparent)',
        top: '10%',
        left: '20%',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,179,0,0.1), transparent)',
        bottom: '20%',
        right: '15%',
        animation: 'float 6s ease-in-out infinite 1s',
      }} />
      <div style={{
        position: 'absolute',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,82,82,0.08), transparent)',
        top: '50%',
        left: '60%',
        animation: 'float 10s ease-in-out infinite 2s',
      }} />
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const hasWebGL = typeof window !== 'undefined' ? canWebGL() : false;

  const features = [
    { icon: IoRestaurant, title: 'Menu Management', description: 'Create stunning digital menus with categories, pricing, images, and real-time availability updates.', color: '#E53935' },
    { icon: IoTabletLandscape, title: 'Table Mapping', description: 'Map your floor plan, generate QR codes for each table, and track occupancy in real-time.', color: '#FFB300' },
    { icon: IoPeople, title: 'Staff Control', description: 'Add employees with role-based access — waiters, kitchen staff, billers — each with their own dashboard.', color: '#42A5F5' },
    { icon: IoBarChart, title: 'Live Analytics', description: 'Track revenue, popular items, peak hours, and growth trends with beautiful real-time charts.', color: '#4CAF50' },
    { icon: IoWallet, title: 'Smart Billing', description: 'Generate bills instantly, split payments, apply discounts, and track payment history effortlessly.', color: '#AB47BC' },
    { icon: IoGrid, title: 'Kitchen Display', description: 'Real-time order queue for kitchen staff with status tracking, prep time estimates, and priority handling.', color: '#FF7043' },
  ];

  return (
    <div style={{ background: '#121212', minHeight: '100vh', overflowX: 'hidden' }}>
      <LandingNavbar />

      {/* ═══════ HERO SECTION ═══════ */}
      <section
        ref={heroRef}
        id="hero"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* 3D Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {hasWebGL ? (
            <Suspense fallback={<HeroFallback />}>
              <Scene3D />
            </Suspense>
          ) : (
            <HeroFallback />
          )}
        </div>

        {/* Grid overlay */}
        <div className="landing-grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.5 }} />

        {/* Gradient overlay for readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'radial-gradient(ellipse at center, rgba(18,18,18,0.4) 0%, rgba(18,18,18,0.75) 70%)',
        }} />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div style={{
            position: 'relative',
            zIndex: 3,
            textAlign: 'center',
            maxWidth: '900px',
            padding: '0 24px',
          }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 18px',
                borderRadius: '100px',
                background: 'rgba(229,57,53,0.1)',
                border: '1px solid rgba(229,57,53,0.2)',
                marginBottom: '28px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#FF5252',
              }}
            >
              <IoRocket size={14} />
              Next-Gen Restaurant Platform
            </motion.div>

            {/* Main Headline */}
            <h1 className="heading-xl" style={{ marginBottom: '20px' }}>
              The Future of{' '}
              <span className="text-gradient-mixed">
                Restaurant Management
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#9E9E9E',
              maxWidth: '650px',
              margin: '0 auto 40px',
              lineHeight: 1.7,
              fontWeight: 500,
            }}>
              From digital menus to smart billing, manage your entire restaurant from one powerful dashboard. Set up in minutes, not months.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <Link
                to="/signup"
                id="hero-signup-btn"
                className="btn-xl"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #E53935, #C62828)',
                  color: 'white',
                  textDecoration: 'none',
                  boxShadow: '0 4px 24px rgba(229,57,53,0.35)',
                  transition: 'all 0.3s',
                  padding: '16px 36px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                Get Started Free <IoArrowForward size={20} />
              </Link>

              <Link
                to="/login"
                id="hero-login-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#E0E0E0',
                  textDecoration: 'none',
                  border: '1px solid #333',
                  background: 'rgba(30,30,30,0.5)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s',
                }}
              >
                Staff Login
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
          }}
        >
          <div style={{
            width: '24px',
            height: '40px',
            borderRadius: '12px',
            border: '2px solid rgba(255,255,255,0.15)',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '8px',
          }}>
            <div style={{
              width: '3px',
              height: '8px',
              borderRadius: '2px',
              background: '#E53935',
            }} />
          </div>
        </motion.div>
      </section>


      {/* ═══════ FEATURES SECTION ═══════ */}
      <section id="features" style={{ padding: 'clamp(60px, 10vw, 120px) 24px', position: 'relative' }}>
        <div className="red-glow" style={{ position: 'absolute', top: '0', left: '20%', width: '100%', height: '100%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '100px',
                background: 'rgba(255,179,0,0.1)',
                border: '1px solid rgba(255,179,0,0.2)',
                marginBottom: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#FFB300',
              }}>
                <IoFlame size={14} /> Powerful Features
              </div>
              <h2 className="heading-lg" style={{ marginBottom: '16px' }}>
                Everything You Need to{' '}
                <span className="text-gradient-red">Run Your Restaurant</span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#9E9E9E', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                A complete toolkit designed for modern restaurants. From ordering to analytics, we&apos;ve got you covered.
              </p>
            </div>
          </AnimatedSection>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ DEVICE DEMO SECTION ═══════ */}
      <section id="demo" style={{ padding: 'clamp(60px, 10vw, 120px) 24px', position: 'relative' }}>
        <div className="amber-glow" style={{ position: 'absolute', top: '20%', right: '10%', width: '100%', height: '100%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '100px',
                background: 'rgba(66,165,245,0.1)',
                border: '1px solid rgba(66,165,245,0.2)',
                marginBottom: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#42A5F5',
              }}>
                <IoGlobe size={14} /> Works Everywhere
              </div>
              <h2 className="heading-lg" style={{ marginBottom: '16px' }}>
                Beautiful on{' '}
                <span className="text-gradient-amber">Every Device</span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#9E9E9E', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                Responsive dashboards that work seamlessly on desktop, tablet, and mobile. Manage your restaurant from anywhere.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <DeviceMockup3D />
          </AnimatedSection>
        </div>
      </section>


      {/* ═══════ STATS SECTION ═══════ */}
      <section style={{
        padding: 'clamp(40px, 8vw, 80px) 24px',
        background: '#1a1a1a',
        borderTop: '1px solid #272727',
        borderBottom: '1px solid #272727',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
        }}>
          <AnimatedSection><StatItem value="2500" suffix="+" label="Restaurants" /></AnimatedSection>
          <AnimatedSection delay={0.1}><StatItem value="150000" suffix="+" label="Orders Processed" /></AnimatedSection>
          <AnimatedSection delay={0.2}><StatItem value="99" suffix="%" label="Uptime" /></AnimatedSection>
          <AnimatedSection delay={0.3}><StatItem value="4" suffix=".9" label="App Rating" /></AnimatedSection>
        </div>
      </section>


      {/* ═══════ TESTIMONIAL ═══════ */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) 24px' }}>
        <AnimatedSection>
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '20px' }}>
              {[...Array(5)].map((_, i) => <IoStar key={i} size={24} color="#FFB300" />)}
            </div>
            <blockquote style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: '#E0E0E0',
              lineHeight: 1.7,
              fontWeight: 500,
              fontStyle: 'italic',
              marginBottom: '24px',
            }}>
              &ldquo;DineFlow completely transformed how we manage our restaurant. The digital menu and real-time analytics have helped us increase our revenue by 40% in just 3 months.&rdquo;
            </blockquote>
            <div style={{ fontWeight: 800, color: '#FAFAFA', fontSize: '1rem' }}>Rahul Sharma</div>
            <div style={{ color: '#616161', fontSize: '0.9rem', fontWeight: 600 }}>Owner, Spice Garden, Mumbai</div>
          </div>
        </AnimatedSection>
      </section>


      {/* ═══════ PRICING SECTION ═══════ */}
      <section id="pricing" style={{ padding: 'clamp(60px, 10vw, 120px) 24px', position: 'relative' }}>
        <div className="red-glow" style={{ position: 'absolute', bottom: '0', right: '20%', width: '100%', height: '100%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '100px',
                background: 'rgba(76,175,80,0.1)',
                border: '1px solid rgba(76,175,80,0.2)',
                marginBottom: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#4CAF50',
              }}>
                <IoShieldCheckmark size={14} /> Simple Pricing
              </div>
              <h2 className="heading-lg" style={{ marginBottom: '16px' }}>
                Start Free,{' '}
                <span className="text-gradient-mixed">Scale as You Grow</span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#9E9E9E', maxWidth: '550px', margin: '0 auto', lineHeight: 1.7 }}>
                No hidden fees. No long-term contracts. Cancel anytime.
              </p>
            </div>
          </AnimatedSection>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <PricingCard
              name="Starter"
              price="Free"
              period="forever"
              features={[
                'Up to 50 menu items',
                '5 tables',
                '2 staff accounts',
                'Basic analytics',
                'QR code ordering',
              ]}
              delay={0}
            />
            <PricingCard
              name="Professional"
              price="₹999"
              period="month"
              highlighted
              features={[
                'Unlimited menu items',
                'Unlimited tables',
                '10 staff accounts',
                'Advanced analytics',
                'Recipe management',
                'Priority support',
              ]}
              delay={0.15}
            />
            <PricingCard
              name="Enterprise"
              price="₹2,499"
              period="month"
              features={[
                'Everything in Pro',
                'Unlimited staff',
                'Multi-location support',
                'Custom branding',
                'API access',
                'Dedicated support',
              ]}
              delay={0.3}
            />
          </div>
        </div>
      </section>


      {/* ═══════ FINAL CTA ═══════ */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(229,57,53,0.05), rgba(255,179,0,0.05))',
          pointerEvents: 'none',
        }} />

        <AnimatedSection>
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
          }}>
            <h2 className="heading-lg" style={{ marginBottom: '16px' }}>
              Ready to Transform{' '}
              <span className="text-gradient-red">Your Restaurant?</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#9E9E9E', marginBottom: '40px', lineHeight: 1.7 }}>
              Join thousands of restaurant owners who trust DineFlow. Set up your account in under 5 minutes.
            </p>
            <Link
              to="/signup"
              id="cta-signup-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #E53935, #C62828)',
                color: 'white',
                textDecoration: 'none',
                padding: '18px 48px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1.15rem',
                boxShadow: '0 4px 30px rgba(229,57,53,0.35)',
                transition: 'all 0.3s',
                letterSpacing: '-0.01em',
              }}
            >
              <IoFlame size={22} />
              Start Your Free Trial
            </Link>
          </div>
        </AnimatedSection>
      </section>


      {/* ═══════ FOOTER ═══════ */}
      <footer style={{
        padding: '40px 24px',
        borderTop: '1px solid #272727',
        background: '#1a1a1a',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #E53935, #FF8F00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IoFlame size={16} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FAFAFA' }}>DineFlow</span>
          </div>
          <p style={{ color: '#616161', fontSize: '0.85rem', fontWeight: 500 }}>
            © {new Date().getFullYear()} DineFlow. Built for modern restaurants.
          </p>
        </div>
      </footer>
    </div>
  );
}
