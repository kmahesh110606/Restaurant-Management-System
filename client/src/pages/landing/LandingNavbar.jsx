import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FoodRegular, NavigationRegular, DismissRegular } from '@fluentui/react-icons';

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  return (
    <header className="landing-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav className="landing-container" aria-label="Main navigation">
        <Link to="/" className="landing-brand" aria-label="Restaurant Management Service home" title="Restaurant Management Service"><FoodRegular /> RMS</Link>
        <button className="landing-menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="landing-links" onClick={() => setOpen(!open)}>{open ? <DismissRegular /> : <NavigationRegular />}</button>
        <div id="landing-links" className={`landing-nav-links ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)}>
          <a href="/#features">Features</a><a href="/#workflows">Workflows</a><Link to="/demo">Demo</Link><Link to="/login">Sign in</Link><Link to="/signup" className="landing-button primary">Get started</Link>
        </div>
      </nav>
    </header>
  );
}
