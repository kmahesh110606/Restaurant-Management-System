/**
 * LandingNavbar — Sticky top navbar for the landing page.
 * Transparent on top, glass-blur effect on scroll.
 * Contains Login (for existing staff) and Sign Up (for new restaurants).
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoFlame, IoMenu, IoClose } from 'react-icons/io5';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      id="landing-navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0 24px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(18, 18, 18, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
    >
      {/* Brand */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #E53935, #FF8F00)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <IoFlame size={22} color="white" />
        </div>
        <span style={{
          fontSize: '1.4rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #FF5252, #FFB300)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          DineFlow
        </span>
      </Link>

      {/* Desktop Nav Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
        className="hidden md:flex"
      >
        <a
          href="#features"
          style={{
            color: '#9E9E9E',
            textDecoration: 'none',
            padding: '8px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.color = '#E0E0E0'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { e.target.style.color = '#9E9E9E'; e.target.style.background = 'transparent'; }}
        >
          Features
        </a>
        <a
          href="#demo"
          style={{
            color: '#9E9E9E',
            textDecoration: 'none',
            padding: '8px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.color = '#E0E0E0'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { e.target.style.color = '#9E9E9E'; e.target.style.background = 'transparent'; }}
        >
          Demo
        </a>
        <a
          href="#pricing"
          style={{
            color: '#9E9E9E',
            textDecoration: 'none',
            padding: '8px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.color = '#E0E0E0'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { e.target.style.color = '#9E9E9E'; e.target.style.background = 'transparent'; }}
        >
          Pricing
        </a>

        <div style={{ width: '1px', height: '24px', background: '#333', margin: '0 8px' }} />

        <Link
          to="/login"
          id="nav-login-btn"
          style={{
            color: '#E0E0E0',
            textDecoration: 'none',
            padding: '8px 20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            borderRadius: '10px',
            border: '1px solid #333',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = '#E53935'; e.target.style.color = '#FF5252'; }}
          onMouseLeave={(e) => { e.target.style.borderColor = '#333'; e.target.style.color = '#E0E0E0'; }}
        >
          Login
        </Link>

        <Link
          to="/signup"
          id="nav-signup-btn"
          style={{
            textDecoration: 'none',
            padding: '8px 24px',
            fontSize: '0.9rem',
            fontWeight: 800,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #E53935, #C62828)',
            color: 'white',
            transition: 'all 0.2s',
            boxShadow: '0 2px 12px rgba(229,57,53,0.3)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #FF5252, #E53935)';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 20px rgba(229,57,53,0.45)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #E53935, #C62828)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 12px rgba(229,57,53,0.3)';
          }}
        >
          Sign Up Free
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          background: 'none',
          border: 'none',
          color: '#E0E0E0',
          cursor: 'pointer',
          padding: '8px',
        }}
        id="mobile-menu-toggle"
      >
        {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            background: 'rgba(18,18,18,0.98)',
            backdropFilter: 'blur(20px)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderBottom: '1px solid #272727',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <a href="#features" onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#E0E0E0', textDecoration: 'none', padding: '12px 16px', fontSize: '1rem', fontWeight: 600, borderRadius: '8px' }}>
            Features
          </a>
          <a href="#demo" onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#E0E0E0', textDecoration: 'none', padding: '12px 16px', fontSize: '1rem', fontWeight: 600, borderRadius: '8px' }}>
            Demo
          </a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#E0E0E0', textDecoration: 'none', padding: '12px 16px', fontSize: '1rem', fontWeight: 600, borderRadius: '8px' }}>
            Pricing
          </a>
          <div style={{ height: '1px', background: '#272727', margin: '8px 0' }} />
          <Link to="/login" onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#E0E0E0', textDecoration: 'none', padding: '12px 16px', fontSize: '1rem', fontWeight: 700, borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
            Login
          </Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)}
            style={{ textDecoration: 'none', padding: '12px 16px', fontSize: '1rem', fontWeight: 800, borderRadius: '8px', textAlign: 'center', background: 'linear-gradient(135deg, #E53935, #C62828)', color: 'white' }}>
            Sign Up Free
          </Link>
        </div>
      )}
    </nav>
  );
}
