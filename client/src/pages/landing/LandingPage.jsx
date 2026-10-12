import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRightRegular, FoodRegular, TableSimpleRegular, ReceiptRegular, BowlSaladRegular } from '@fluentui/react-icons';
=======
import {
  FoodRegular,
  BowlSaladRegular,
  ReceiptRegular,
  DataBarVerticalRegular,
  TableSimpleRegular,
  BookOpenRegular,
  CheckmarkCircleRegular,
  ArrowRightRegular,
  SparkleRegular,
  TimerRegular,
  ArrowTrendingLinesRegular,
} from '@fluentui/react-icons';
>>>>>>> f1ea09e5bde2de41601195eff51aa5ce266c02c6
import LandingNavbar from './LandingNavbar';
import './landing.css';

const MODES = [
  { name: 'Table service', title: 'From the first order to the final bill.', text: 'Guests scan their table’s QR code. Orders reach the kitchen, waiters see what’s ready, and the cashier closes the bill.', steps: ['Scan & order', 'Prepare & serve', 'Settle the bill'], table: 'Table 08' },
  { name: 'Token pickup', title: 'Keep the queue moving.', text: 'Each order gets a token. The kitchen prepares it and your team calls the number when it’s ready for pickup.', steps: ['Place an order', 'Prepare the ticket', 'Call the token'], table: 'Token 104' },
  { name: 'Counter billing', title: 'A clear view at the counter.', text: 'Review orders, apply a discount, and record cash, card or UPI payments in one place.', steps: ['Review orders', 'Generate a bill', 'Record payment'], table: 'Counter 01' },
];

function ServicePreview({ mode }) {
  return (
    <div className="service-preview">
      <div className="preview-top"><span className="preview-brand"><FoodRegular /> RMS</span><span>Sample restaurant</span><span>Friday service</span></div>
      <div className="preview-body">
        <aside className="preview-nav" aria-hidden="true"><span className="selected">Overview</span><span>Orders</span><span>Kitchen</span><span>Menu</span><span>Billing</span></aside>
        <div className="preview-content">
          <div className="preview-heading"><h3>Service overview</h3><span>Today</span></div>
          <div className="preview-metrics"><div><span>Sales</span><strong>₹24,680</strong></div><div><span>Orders</span><strong>48</strong></div><div><span>In the kitchen</span><strong>06</strong></div></div>
          <div className="preview-orders-title"><h4>Order queue</h4><span>6 orders in progress</span></div>
          <div className="preview-ticket"><span className="ticket-number">08</span><div><strong>{mode.table}</strong><span>2 × Margherita · 1 × Iced tea</span></div><span className="ticket-state preparing">Preparing</span><span className="ticket-time">8 min</span></div>
          <div className="preview-ticket"><span className="ticket-number">12</span><div><strong>{mode.name === 'Token pickup' ? 'Token 105' : 'Table 12'}</strong><span>1 × Mushroom risotto</span></div><span className="ticket-state ready">Ready</span><span className="ticket-time">12 min</span></div>
          <div className="preview-ticket"><span className="ticket-number">03</span><div><strong>{mode.name === 'Token pickup' ? 'Token 106' : 'Table 03'}</strong><span>2 × House burger · 2 × Lemonade</span></div><span className="ticket-state">Pending</span><span className="ticket-time">2 min</span></div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const stage = useRef(null);
  const reducedMotion = useReducedMotion();
  const [activeMode, setActiveMode] = useState(0);
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end start'] });
  const rotateX = useTransform(scrollYProgress, [0, 0.45, 1], [19, 0, -5]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-7, 0, 3]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.88, 1, 0.96]);
  const ticketY = useTransform(scrollYProgress, [0, 1], [70, -55]);
  const mode = MODES[activeMode];
  return (
    <div className="landing-page">
      <LandingNavbar />
      <main id="main-content">
        <section className="landing-hero landing-container">
          <h1>Good service.<br /><em>From start to finish.</em></h1>
          <div className="hero-intro"><p>Orders, kitchen, tables and billing.<br />One place to run your restaurant.</p><div className="landing-actions"><Link to="/signup" className="landing-button primary">Set up your restaurant <ArrowRightRegular /></Link><Link to="/demo" className="landing-button secondary">Explore the demo <ArrowRightRegular /></Link></div></div>
        </section>
        <section id="preview" className="landing-stage landing-container" ref={stage} aria-label="Restaurant workspace preview">
          <div className="stage-perspective">
            <motion.div className="stage-screen" style={reducedMotion ? {} : { rotateX, rotateY, scale }}><ServicePreview mode={mode} /></motion.div>
            <motion.div className="floating-receipt" style={reducedMotion ? {} : { y: ticketY }} aria-hidden="true"><ReceiptRegular /><span>Bill #0048</span><strong>₹1,240.00</strong><div><span>Payment</span><b>Recorded</b></div></motion.div>
          </div>
          <div className="preview-caption"><span>One connected service, from order to checkout.</span><span>Illustrative workspace</span></div>
        </section>
        <section id="features" className="landing-features landing-container">
          <h2>Less switching.<br />More serving.</h2>
          <div className="feature-columns">
            <article><TableSimpleRegular /><h3>At the table</h3><p>A menu on every phone. Guests browse dishes, add requests and follow their order.</p></article>
            <article><BowlSaladRegular /><h3>In the kitchen</h3><p>Clear tickets, preparation notes and a shared queue for the kitchen and floor.</p></article>
            <article><ReceiptRegular /><h3>At the counter</h3><p>Itemised bills, taxes and payment records. Sales reports when the service ends.</p></article>
          </div>
        </section>
        <section id="workflows" className="landing-workflows">
          <div className="landing-container workflow-layout">
            <div><h2>Your restaurant.<br />Your way of working.</h2><div className="workflow-tabs" role="tablist" aria-label="Restaurant workflow">{MODES.map((item, index) => <button key={item.name} id={`workflow-tab-${index}`} role="tab" aria-selected={index === activeMode} aria-controls="workflow-panel" tabIndex={index === activeMode ? 0 : -1} onClick={() => setActiveMode(index)} onKeyDown={(event) => { const next = event.key === 'ArrowRight' ? (activeMode + 1) % MODES.length : event.key === 'ArrowLeft' ? (activeMode + MODES.length - 1) % MODES.length : event.key === 'Home' ? 0 : event.key === 'End' ? MODES.length - 1 : null; if (next !== null) { event.preventDefault(); setActiveMode(next); document.getElementById(`workflow-tab-${next}`)?.focus(); } }}>{item.name}</button>)}</div></div>
            <div id="workflow-panel" role="tabpanel" aria-labelledby={`workflow-tab-${activeMode}`} tabIndex={0}><h3>{mode.title}</h3><p>{mode.text}</p><ol className="workflow-steps">{mode.steps.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol></div>
          </div>
        </section>
        <section className="landing-close landing-container"><h2>Ready for your<br /><em>next service?</em></h2><Link to="/signup" className="landing-button primary">Get started <ArrowRightRegular /></Link></section>
      </main>
      <footer className="landing-footer landing-container"><Link to="/" className="landing-brand"><FoodRegular /> RMS</Link><span>© {new Date().getFullYear()} RMS</span><Link to="/login">Staff sign in <ArrowRightRegular /></Link></footer>
    </div>
  );
}
