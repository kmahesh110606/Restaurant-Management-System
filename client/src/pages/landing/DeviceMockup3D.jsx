/**
 * DeviceMockup3D — 3D device frames (laptop, phone, tablet) that
 * rotate/tilt on scroll. Shows website demo screenshots inside frames.
 * Uses CSS 3D transforms with framer-motion scroll tracking.
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

function DeviceFrame({ type = 'laptop', children, className = '' }) {
  if (type === 'laptop') {
    return (
      <div className={`device-laptop ${className}`} style={{
        background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        borderRadius: '12px',
        padding: '12px 12px 0 12px',
        border: '2px solid #333',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(229,57,53,0.1)',
        maxWidth: '600px',
        width: '100%',
      }}>
        {/* Screen */}
        <div style={{
          background: '#121212',
          borderRadius: '6px',
          overflow: 'hidden',
          aspectRatio: '16/10',
          position: 'relative',
        }}>
          {children}
        </div>
        {/* Base */}
        <div style={{
          height: '20px',
          background: 'linear-gradient(180deg, #2a2a2a, #222)',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '8px',
        }}>
          <div style={{
            width: '60px',
            height: '4px',
            borderRadius: '2px',
            background: '#444',
          }} />
        </div>
      </div>
    );
  }

  if (type === 'phone') {
    return (
      <div className={`device-phone ${className}`} style={{
        background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        borderRadius: '24px',
        padding: '12px 6px',
        border: '2px solid #333',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 20px rgba(255,179,0,0.08)',
        maxWidth: '200px',
        width: '100%',
      }}>
        {/* Notch */}
        <div style={{
          width: '50%',
          height: '12px',
          margin: '0 auto 6px',
          background: '#1a1a1a',
          borderRadius: '0 0 10px 10px',
          border: '1px solid #333',
        }} />
        {/* Screen */}
        <div style={{
          background: '#121212',
          borderRadius: '14px',
          overflow: 'hidden',
          aspectRatio: '9/19',
          position: 'relative',
        }}>
          {children}
        </div>
        {/* Home bar */}
        <div style={{
          width: '40%',
          height: '4px',
          margin: '8px auto 0',
          background: '#444',
          borderRadius: '2px',
        }} />
      </div>
    );
  }

  if (type === 'tablet') {
    return (
      <div className={`device-tablet ${className}`} style={{
        background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        borderRadius: '16px',
        padding: '10px',
        border: '2px solid #333',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        maxWidth: '350px',
        width: '100%',
      }}>
        {/* Camera */}
        <div style={{
          width: '6px',
          height: '6px',
          margin: '0 auto 6px',
          background: '#333',
          borderRadius: '50%',
        }} />
        {/* Screen */}
        <div style={{
          background: '#121212',
          borderRadius: '8px',
          overflow: 'hidden',
          aspectRatio: '4/3',
          position: 'relative',
        }}>
          {children}
        </div>
      </div>
    );
  }

  return null;
}

/* Dashboard mockup content rendered inside devices */
function DashboardMockup({ variant = 'desktop' }) {
  const isCompact = variant !== 'desktop';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#121212',
      padding: isCompact ? '6px' : '12px',
      fontFamily: 'Inter, sans-serif',
      fontSize: isCompact ? '5px' : '8px',
      color: '#E0E0E0',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isCompact ? '3px 4px' : '4px 8px',
        background: '#1E1E1E',
        borderRadius: '4px',
        marginBottom: isCompact ? '4px' : '8px',
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: isCompact ? '6px' : '10px',
          background: 'linear-gradient(135deg, #FF5252, #FFB300)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>DineFlow</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: isCompact ? '10px' : '20px', height: isCompact ? '4px' : '6px', borderRadius: '2px', background: '#E53935' }} />
          <div style={{ width: isCompact ? '4px' : '6px', height: isCompact ? '4px' : '6px', borderRadius: '50%', background: '#333' }} />
        </div>
      </div>

      {/* Stats row */}
      {!isCompact && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {[
            { label: 'Revenue', value: '₹48,250', color: '#4CAF50' },
            { label: 'Orders', value: '127', color: '#42A5F5' },
            { label: 'Tables', value: '18/24', color: '#FFB300' },
            { label: 'Staff', value: '12', color: '#FF5252' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '4px',
              background: '#1E1E1E',
              borderRadius: '4px',
              border: '1px solid #272727',
            }}>
              <div style={{ fontSize: '5px', color: '#616161', marginBottom: '1px' }}>{s.label}</div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart area */}
      <div style={{
        background: '#1E1E1E',
        borderRadius: '4px',
        border: '1px solid #272727',
        padding: isCompact ? '4px' : '6px',
        marginBottom: isCompact ? '4px' : '8px',
        height: isCompact ? '40%' : '35%',
      }}>
        <div style={{ fontSize: isCompact ? '5px' : '7px', fontWeight: 700, marginBottom: '4px', color: '#FAFAFA' }}>
          Sales Overview
        </div>
        {/* Fake chart bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '70%' }}>
          {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: '2px 2px 0 0',
              background: i % 3 === 0
                ? 'linear-gradient(180deg, #FF5252, #C62828)'
                : i % 3 === 1
                  ? 'linear-gradient(180deg, #FFB300, #FF8F00)'
                  : 'linear-gradient(180deg, #333, #252525)',
            }} />
          ))}
        </div>
      </div>

      {/* Mini table */}
      <div style={{
        background: '#1E1E1E',
        borderRadius: '4px',
        border: '1px solid #272727',
        padding: isCompact ? '3px' : '6px',
      }}>
        <div style={{ fontSize: isCompact ? '5px' : '7px', fontWeight: 700, marginBottom: '3px', color: '#FAFAFA' }}>
          Recent Orders
        </div>
        {[
          { id: '#1284', status: 'Ready', color: '#4CAF50' },
          { id: '#1283', status: 'Preparing', color: '#FFB300' },
          { id: '#1282', status: 'Served', color: '#616161' },
        ].map((order, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '2px 0',
            borderBottom: '1px solid #272727',
            fontSize: isCompact ? '4px' : '6px',
          }}>
            <span style={{ fontWeight: 600 }}>{order.id}</span>
            <span style={{ color: order.color, fontWeight: 700 }}>{order.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DeviceMockup3D() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [25, 0, -10]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-15, 0, 10]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.5]);

  const phoneRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [20, 5, -5]);
  const phoneX = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -20]);
  const tabletRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-20, -5, 5]);
  const tabletX = useTransform(scrollYProgress, [0, 0.5, 1], [-80, 0, 20]);

  return (
    <div ref={containerRef} style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        padding: '0 16px',
      }}>
        {/* Tablet — left */}
        <motion.div
          style={{
            rotateY: tabletRotateY,
            x: tabletX,
            opacity,
            transformStyle: 'preserve-3d',
          }}
          className="hidden lg:block"
        >
          <DeviceFrame type="tablet">
            <DashboardMockup variant="tablet" />
          </DeviceFrame>
        </motion.div>

        {/* Laptop — center */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            scale,
            opacity,
            transformStyle: 'preserve-3d',
          }}
        >
          <DeviceFrame type="laptop">
            <DashboardMockup variant="desktop" />
          </DeviceFrame>
        </motion.div>

        {/* Phone — right */}
        <motion.div
          style={{
            rotateY: phoneRotateY,
            x: phoneX,
            opacity,
            transformStyle: 'preserve-3d',
          }}
          className="hidden md:block"
        >
          <DeviceFrame type="phone">
            <DashboardMockup variant="phone" />
          </DeviceFrame>
        </motion.div>
      </div>
    </div>
  );
}
