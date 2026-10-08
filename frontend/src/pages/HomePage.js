import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { routeAPI } from '../services/api';
import {
  Shield, Clock, Star, Headphones, Map as MapIcon, Award,
  ChevronDown, Wallet as WalletIcon, Tag, Bell, MessageCircle,
  ArrowRight, Sparkles, TrendingUp, Zap, Check, Bus as BusIcon,
  Users, Globe, Percent, Mail,
  Facebook, Twitter, Instagram, Youtube, Apple, Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import LiveChatWidget from '../components/LiveChatWidget';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */
const cities = ['Chennai','Coimbatore','Madurai','Trichy','Salem','Vellore','Pondicherry','Tirunelveli','Erode','Kanyakumari'];

const HERO_SLIDES = [
  { img: '/bus1.jpg', tag: '🚌 Tamil Nadu Express',  headline: 'Travel Smarter,',  sub: 'Book Faster.' },
  { img: '/bus2.jpg', tag: '⚡ Instant Booking',      headline: 'Comfort Every',    sub: 'Mile.' },
  { img: '/bus3.jpg', tag: '📍 500+ Routes',          headline: 'Across Tamil',     sub: 'Nadu.' },
];

/* Set to true after you add your own photos to  public/destinations/<city>.jpg
   (chennai.jpg, coimbatore.jpg, madurai.jpg, trichy.jpg, pondicherry.jpg, ooty.jpg, rameswaram.jpg, nagapattinam.jpg).
   Local files are the most reliable option and are tried first. */
const USE_LOCAL_IMAGES = false;

/* Image order for every destination card:
   1) your local file (if USE_LOCAL_IMAGES)  2) Wikipedia article photo  3) the old external URL  4) gradient + emoji */
const DESTINATIONS = [
  { city: 'Chennai', tag: 'Capital City', routes: 48, icon: '🛕', detail: 'Marina Beach • Kapaleeshwarar',
    wiki: ['Marina Beach', 'Chennai'], local: '/destinations/chennai.jpg',
    grad: 'linear-gradient(160deg,#c2410c,#f97316)', pattern: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 50%)' },
  { city: 'Coimbatore', tag: 'Manchester of TN', routes: 32, icon: '🏭', detail: 'Textile Hub • Kovai',
    wiki: ['Adiyogi Shiva statue', 'Coimbatore'], local: '/destinations/coimbatore.jpg',
    img: 'https://touristplace.in/wp-content/uploads/2023/02/061362631Isha.jpeg',
    grad: 'linear-gradient(160deg,#0c4a6e,#0ea5e9)', pattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  { city: 'Madurai', tag: 'Temple City', routes: 26, icon: '🕌', detail: 'Meenakshi Temple • Athisayam',
    wiki: ['Meenakshi Temple', 'Madurai'], local: '/destinations/madurai.jpg',
    img: 'https://www.clubmahindra.com/blog/media/section_images/placestovi-4bc8914dee0ace7.webp',
    grad: 'linear-gradient(160deg,#581c87,#7c3aed)', pattern: 'radial-gradient(circle at 50% 20%, rgba(255,220,100,0.2) 0%, transparent 50%)' },
  { city: 'Trichy', tag: 'Rock Fort City', routes: 18, icon: '🏯', detail: 'Rock Fort • Sri Ranganathar',
    wiki: ['Rockfort, Tiruchirappalli', 'Tiruchirappalli'], local: '/destinations/trichy.jpg',
    img: 'https://toursinindia.in/images/tourist-places/trichy/01.webp',
    grad: 'linear-gradient(160deg,#7f1d1d,#ef4444)', pattern: 'radial-gradient(ellipse at 50% 80%, rgba(139,69,19,0.4) 0%, transparent 60%)' },
  { city: 'Pondicherry', tag: 'French Riviera', routes: 14, icon: '🏖️', detail: 'Promenade Beach • Auroville',
    wiki: ['Puducherry (city)', 'Puducherry'], local: '/destinations/pondicherry.jpg',
    grad: 'linear-gradient(160deg,#064e3b,#10b981)', pattern: 'radial-gradient(ellipse at 50% 100%, rgba(0,100,200,0.4) 0%, transparent 50%)' },
  { city: 'Ooty', tag: 'Queen of Hills', routes: 10, icon: '🌿', detail: 'Nilgiri Hills • Botanical Garden',
    wiki: ['Ooty', 'Nilgiris district'], local: '/destinations/ooty.jpg',
    grad: 'linear-gradient(160deg,#14532d,#22c55e)', pattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  { city: 'Rameswaram', tag: 'Pamban Bridge', routes: 18, icon: '🌉', detail: 'Pamban Bridge • Boat Jetty',
    wiki: ['Pamban Bridge', 'Rameswaram'], local: '/destinations/rameswaram.jpg',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/The_New_Pamban_Bridge.jpg/1280px-The_New_Pamban_Bridge.jpg',
    grad: 'linear-gradient(160deg,#0f766e,#14b8a6)', pattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  { city: 'Nagapattinam', tag: 'Velankanni', routes: 20, icon: '⛪', detail: 'Velankanni • Beautiful Place',
    wiki: ['Basilica of Our Lady of Good Health', 'Nagapattinam'], local: '/destinations/nagapattinam.jpg',
    img: 'https://toim.b-cdn.net/pictures/travel_guide/thmb/nagapattinam-tour-848.jpeg',
    grad: 'linear-gradient(160deg,#1e3a8a,#3b82f6)', pattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
];

const MOCK_ROUTES = [
  { from: 'Chennai',    to: 'Coimbatore', price: 450, duration: '8h' },
  { from: 'Chennai',    to: 'Madurai',    price: 650, duration: '8.5h' },
  { from: 'Chennai',    to: 'Trichy',     price: 550, duration: '6h' },
  { from: 'Madurai',    to: 'Chennai',    price: 700, duration: '8.5h' },
  { from: 'Coimbatore', to: 'Chennai',    price: 500, duration: '8h' },
  { from: 'Chennai',    to: 'Salem',      price: 350, duration: '5h' },
];

const FAQS = [
  { q: 'How do I cancel my ticket?', a: 'Go to My Bookings → select booking → Cancel. Refund processed in 5–7 working days.' },
  { q: 'Is there a luggage limit?',  a: 'Most operators allow 15–20 kg. Excess may attract extra charges.' },
  { q: 'Are the buses AC?',          a: 'We offer AC, Non-AC, Sleeper, Volvo and Luxury. Filter by type when searching.' },
  { q: 'Can I track my bus live?',   a: 'Yes! Use Track Bus feature. Get live GPS location 1 hour before departure.' },
];

const OFFERS = [
  { code: 'FIRST50', title: 'First Booking Offer', desc: '50% off on your very first bus booking', discount: '50% OFF',  color: '#f97316', bg: '#fff7ed', border: '#fed7aa', valid: 'Valid till 31 Dec 2026' },
  { code: 'BUSPASS', title: 'BusPass Members',     desc: 'Flat ₹100 off for registered members',   discount: '₹100 OFF', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', valid: 'Valid till 31 Jan 2027' },
  { code: 'WEEKEND', title: 'Weekend Saver',       desc: '25% off on Saturday & Sunday bookings',  discount: '25% OFF',  color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', valid: 'Every Weekend' },
  { code: 'STUDENT', title: 'Student Discount',    desc: 'Extra 15% off with valid student ID',    discount: '15% OFF',  color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', valid: 'Year Round' },
];

const FOOTER_COLS = [
  { title: 'Quick Links', links: [['Home', '/'], ['Search Buses', '/search'], ['Track Bus', '/track'], ['My Bookings', '/my-bookings'], ['Profile', '/profile']] },
  { title: 'Account',     links: [['My Wallet', '/wallet'], ['Notifications', '/notifications'], ['Coupons & Offers', '/offers'], ['Live Chat Support', 'chat'], ['My Reviews', '/my-bookings']] },
  { title: 'Support',     links: [['Help Center', '/help'], ['Contact Us', '/help'], ['Cancellation Policy', '/help'], ['Refund Policy', '/help'], ['FAQs', '/help']] },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
// Local date as YYYY-MM-DD. toISOString() uses UTC, which gives "yesterday" in India after midnight.
const todayLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const lift = (over, out) => ({
  onMouseOver: (e) => Object.assign(e.currentTarget.style, over),
  onMouseOut:  (e) => Object.assign(e.currentTarget.style, out),
});

/* Wikipedia article photo for a place. Wikipedia allows browser requests and does not block hotlinking,
   unlike LinkedIn / Google thumbnail URLs that were failing before. */
async function wikiImage(titles = []) {
  for (const t of titles) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, '_'))}`, { signal: ctrl.signal });
      if (!res.ok) continue;
      const data = await res.json();
      const src = data.thumbnail && data.thumbnail.source;
      if (src) return src.replace(/\/(\d{2,4})px-/, '/500px-');
    } catch { /* try the next title */ }
    finally { clearTimeout(timer); }
  }
  return null;
}

const imageCache = new Map();
function resolveDestinationImages(d) {
  if (!imageCache.has(d.city)) {
    imageCache.set(d.city, (async () => {
      const list = [];
      if (USE_LOCAL_IMAGES && d.local) list.push(d.local);
      const w = await wikiImage(d.wiki);
      if (w) list.push(w);
      if (d.img) list.push(d.img);
      return list;
    })());
  }
  return imageCache.get(d.city);
}

function useReveal(delay = 0, threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setVis(true); return undefined; }
    let timer;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { timer = setTimeout(() => setVis(true), delay); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, [delay, threshold]);
  return [ref, vis];
}

/* ═══════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, y = 24, style = {} }) {
  const [ref, vis] = useReveal(delay);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : `translateY(${y}px)`,
      transition: 'opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, icon: Icon, color = '#f97316' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: `${color}12`, border: `1px solid ${color}30`, color,
      padding: '6px 14px', borderRadius: 50,
      fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase',
    }}>
      {Icon && <Icon size={12} strokeWidth={2.4} />}
      {children}
    </div>
  );
}

function SectionHeading({ children, size = 'lg' }) {
  const sizes = {
    sm: 'clamp(20px,2.2vw,26px)', md: 'clamp(22px,2.6vw,32px)',
    lg: 'clamp(24px,3vw,38px)',  xl: 'clamp(28px,3.4vw,44px)',
  };
  return (
    <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: sizes[size], fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.15, color: '#0b1220', margin: '12px 0 0' }}>
      {children}
    </h2>
  );
}

function GradientText({ children, from = '#f97316', to = '#fbbf24' }) {
  return (
    <span style={{ background: `linear-gradient(120deg, ${from}, ${to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {children}
    </span>
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#64748b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>
      {children}
    </label>
  );
}

function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let interval;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();                       // run once only (before, it restarted on every scroll-in)
      let v = 0;
      const step = target / 80;
      interval = setInterval(() => {
        v += step;
        if (v >= target) { setVal(target); clearInterval(interval); }
        else setVal(Math.floor(v));
      }, 16);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); clearInterval(interval); };
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* <img> that walks through fallbacks, then shows `fallback` */
function SmartImage({ sources, alt, style, fallback }) {
  const list = sources.filter(Boolean);
  const [idx, setIdx] = useState(0);
  if (idx >= list.length) return fallback;
  return <img key={list[idx]} src={list[idx]} alt={alt} loading="lazy" referrerPolicy="no-referrer"
    onError={() => setIdx((i) => i + 1)} style={style} />;
}

function FeatureCard({ Icon, color, title, desc, delay = 0 }) {
  const [ref, vis] = useReveal(delay, 0.1);
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `linear-gradient(155deg, #ffffff 0%, ${color}06 100%)` : '#ffffff',
        border: `1.5px solid ${hov ? color + '30' : '#e8ecf1'}`,
        borderRadius: 18, padding: '24px 22px',
        boxShadow: hov ? `0 20px 44px ${color}20, 0 4px 12px rgba(15,23,42,0.04)` : '0 2px 10px rgba(15,23,42,0.04)',
        transform: vis ? (hov ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(28px)',
        opacity: vis ? 1 : 0,
        transition: 'all .55s cubic-bezier(.22,1,.36,1)',
        position: 'relative', overflow: 'hidden', cursor: 'pointer', height: '100%',
      }}>
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22, transparent 70%)`,
        opacity: hov ? 1 : 0.6, transition: 'all .5s', transform: hov ? 'scale(1.8)' : 'scale(1)', pointerEvents: 'none',
      }} />
      <div style={{
        width: 48, height: 48, background: `linear-gradient(145deg, ${color}1e, ${color}06)`, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative',
        boxShadow: `inset 0 0 0 1px ${color}1e`,
        transform: hov ? 'scale(1.08) rotate(-5deg)' : 'scale(1)',
        transition: 'transform .4s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <Icon size={22} color={color} strokeWidth={2.2} />
      </div>
      <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#0b1220', letterSpacing: '-0.2px', position: 'relative' }}>{title}</h3>
      <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, margin: 0, position: 'relative' }}>{desc}</p>
    </div>
  );
}

function RouteCard({ from, to, price, duration, img, onClick, delay = 0 }) {
  const [ref, vis] = useReveal(delay, 0.1);
  const [hov, setHov] = useState(false);
  const fallbackImg = (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#c2410c,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46 }}>🚌</div>
  );
  return (
    <div ref={ref} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer', background: '#fff',
        border: `1.5px solid ${hov ? '#f97316' : '#e8ecf1'}`,
        boxShadow: hov ? '0 22px 48px rgba(249,115,22,0.18)' : '0 3px 12px rgba(15,23,42,0.05)',
        transform: vis ? (hov ? 'translateY(-6px) scale(1.01)' : 'translateY(0)') : 'translateY(30px) scale(.98)',
        opacity: vis ? 1 : 0, transition: 'all .5s cubic-bezier(.22,1,.36,1)',
      }}>
      <div style={{ height: 170, position: 'relative', overflow: 'hidden' }}>
        <SmartImage sources={[img, '/bus1.jpg', '/bus2.jpg', '/bus3.jpg']} alt={`${from} to ${to}`} fallback={fallbackImg}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s cubic-bezier(.22,1,.36,1)', transform: hov ? 'scale(1.1)' : 'scale(1)' }} />
        <div style={{
          position: 'absolute', inset: 0, transition: '.4s',
          background: hov
            ? 'linear-gradient(to top, rgba(249,115,22,0.55) 0%, rgba(15,23,42,0.15) 60%, transparent 100%)'
            : 'linear-gradient(to top, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.15) 60%, transparent 100%)',
        }} />
        {hov && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'routeCardFadeIn .35s ease' }}>
            <div style={{ background: '#f97316', color: '#fff', borderRadius: 50, padding: '10px 24px', fontSize: 13, fontWeight: 700, fontFamily: "'Inter',sans-serif", boxShadow: '0 14px 34px rgba(249,115,22,0.55)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Book Now <ArrowRight size={14} />
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '5px 11px', fontSize: 11, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
          <Check size={11} strokeWidth={3} /> Available
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '5px 11px', fontSize: 11, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={10} /> {duration}
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#0b1220', letterSpacing: '-0.2px' }}>
          {from} <span style={{ color: '#f97316' }}>→</span> {to}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={11} color="#f97316" /> AC · Sleeper · Volvo
          </span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#f97316', letterSpacing: '-0.4px' }}>₹{price}</span>
        </div>
      </div>
    </div>
  );
}

function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef(null);
  const listRef = useRef(null);

  const openDropdown = () => {
    const rect = btnRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (listRef.current && listRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const reposition = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  return (
    <>
      <button ref={btnRef} type="button" onClick={() => (open ? setOpen(false) : openDropdown())}
        style={{
          width: '100%', height: 42, padding: '0 34px 0 14px', boxSizing: 'border-box', background: '#fff',
          border: `1.5px solid ${open ? '#f97316' : '#e8ecf1'}`, borderRadius: 10, color: '#0b1220',
          fontSize: 13, fontWeight: 500, fontFamily: "'Inter',sans-serif", textAlign: 'left', cursor: 'pointer',
          position: 'relative', display: 'flex', alignItems: 'center',
          boxShadow: open ? '0 0 0 3px rgba(249,115,22,0.14)' : 'none', transition: 'all .2s',
        }}>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>{value}</span>
        <ChevronDown size={15} color="#94a3b8" style={{
          position: 'absolute', right: 11, top: '50%',
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          transition: 'transform .25s cubic-bezier(.22,1,.36,1)', pointerEvents: 'none',
        }} />
      </button>

      {open && createPortal(
        <div ref={listRef} style={{
          position: 'fixed', top: coords.top, left: coords.left, width: coords.width, minWidth: 160, maxHeight: 280, overflowY: 'auto',
          zIndex: 9999, background: '#fff', borderRadius: 12, border: '1.5px solid #fed7aa',
          boxShadow: '0 20px 50px rgba(15,23,42,0.25), 0 2px 8px rgba(15,23,42,0.06)', padding: 6,
          animation: 'selectDropdownIn .2s cubic-bezier(.22,1,.36,1)',
        }}>
          {options.map((opt) => (
            <div key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: opt === value ? 600 : 400, cursor: 'pointer',
                background: opt === value ? '#fff7ed' : 'transparent', color: opt === value ? '#f97316' : '#1e293b',
                transition: 'background .15s', lineHeight: 1.4, whiteSpace: 'nowrap', fontFamily: "'Inter',sans-serif",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = opt === value ? '#fed7aa' : '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = opt === value ? '#fff7ed' : 'transparent'; }}>
              {opt}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

/* Destination card. `d` comes from the module-level DESTINATIONS list, so its identity is stable and the
   image lookup runs once per card (before, the list was re-created on every scroll, so images kept resetting). */
function CityCard({ d, onSelect }) {
  const [srcs, setSrcs] = useState(null);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    let alive = true;
    resolveDestinationImages(d).then((list) => {
      if (alive) { setSrcs(list); setIdx(0); setLoaded(false); }
    });
    return () => { alive = false; };
  }, [d]);

  const src = srcs && idx < srcs.length ? srcs[idx] : null;

  return (
    <div onClick={() => onSelect(d.city)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative', height: 180,
        transition: 'all .4s cubic-bezier(.22,1,.36,1)', background: d.grad,
        boxShadow: hov ? '0 24px 48px rgba(15,23,42,0.30)' : '0 5px 16px rgba(15,23,42,0.14)',
        transform: hov ? 'translateY(-6px) scale(1.01)' : 'none',
      }}>
      {src && (
        <img key={src} src={src} alt={d.city} loading="lazy" referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(false); setIdx((i) => i + 1); }}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform .6s cubic-bezier(.22,1,.36,1), opacity .4s',
            transform: hov ? 'scale(1.1)' : 'scale(1)', opacity: loaded ? 1 : 0,
          }} />
      )}
      {!loaded && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: d.pattern }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 46, lineHeight: 1 }}>{d.icon}</div>
        </>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 3, textShadow: '0 2px 6px rgba(0,0,0,0.5)', letterSpacing: '-0.2px' }}>{d.city}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>{d.detail}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{d.tag}</span>
          <span style={{ fontSize: 10, background: '#f97316', color: '#fff', borderRadius: 20, padding: '3px 9px', fontWeight: 700, boxShadow: '0 5px 14px rgba(249,115,22,0.5)' }}>{d.routes} routes</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: 'Chennai', to: 'Coimbatore', date: todayLocal() });
  const [busType, setBusType] = useState('');
  const [popular, setPopular] = useState([]);
  const [heroVis, setHeroVis] = useState(false);
  const [slide, setSlide] = useState(0);
  const [slideFade, setSlideFade] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const heroBgRef = useRef(null);

  /* intro animation + popular routes */
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => setHeroVis(true), 100);
    routeAPI.popular()
      .then((r) => { if (alive) setPopular((r.data && r.data.routes) || []); })
      .catch(() => {});
    return () => { alive = false; clearTimeout(t); };
  }, []);

  /* hero parallax: written straight to the DOM. It used to be React state, which re-rendered the
     whole page (thousands of elements) on every scroll event. */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (heroBgRef.current) heroBgRef.current.style.transform = `scale(1.05) translateY(${window.scrollY * 0.02}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  /* hero slideshow */
  useEffect(() => {
    let swap;
    const timer = setInterval(() => {
      setSlideFade(false);
      swap = setTimeout(() => { setSlide((s) => (s + 1) % HERO_SLIDES.length); setSlideFade(true); }, 650);
    }, 5000);
    return () => { clearInterval(timer); clearTimeout(swap); };
  }, []);

  const goSearch = (from, to) => {
    const qs = new URLSearchParams({ from, to, date: form.date, busType }).toString();
    navigate(`/search?${qs}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (form.from === form.to) { toast.error('Source and destination cannot be same!'); return; }
    goSearch(form.from, form.to);
  };

  const goToCity = (city) => goSearch(form.from === city ? form.to : form.from, city);
  const swap = () => setForm((f) => ({ ...f, from: f.to, to: f.from }));

  const copyCode = async (code) => {
    try { await navigator.clipboard.writeText(code); toast.success(`${code} copied`); }
    catch { toast.error('Could not copy. Select the code and copy it manually.'); }
  };

  const footerGo = (e, to) => {
    e.preventDefault();
    if (to === 'chat') document.dispatchEvent(new CustomEvent('open-busgo-chat'));
    else navigate(to);
  };

  const displayRoutes = popular.length > 0
    ? popular.map((r) => ({ from: r.from, to: r.to, price: r.basePrice, duration: r.duration, img: r.bus && r.bus.images && r.bus.images[0] }))
    : MOCK_ROUTES.map((r, i) => ({ ...r, img: HERO_SLIDES[i % HERO_SLIDES.length].img }));

  const cur = HERO_SLIDES[slide];
  const today = todayLocal();

  const sInp = {
    width: '100%', height: 42, padding: '0 14px', boxSizing: 'border-box', background: '#fff',
    border: '1.5px solid #e8ecf1', borderRadius: 10, color: '#0b1220', fontSize: 13, fontWeight: 500,
    fontFamily: "'Inter',sans-serif", outline: 'none', transition: 'border-color .2s, box-shadow .2s', cursor: 'pointer',
  };

  const moduleCards = [
    { Icon: WalletIcon,    color: '#f97316', title: 'Wallet & Refunds',    desc: 'Top up balance, pay instantly, get refunds credited automatically.', action: () => navigate('/wallet') },
    { Icon: Tag,           color: '#22c55e', title: 'Coupons & Offers',    desc: 'Apply promo codes at checkout and stack up your savings.',          action: () => navigate('/offers') },
    { Icon: Star,          color: '#f59e0b', title: 'Reviews & Ratings',   desc: 'Read real traveller reviews before you book, leave your own after.', action: () => navigate('/search') },
    { Icon: Bell,          color: '#3b82f6', title: 'Smart Notifications', desc: 'Get instant alerts for bookings, delays, payments and refunds.',    action: () => navigate('/notifications') },
    { Icon: MessageCircle, color: '#8b5cf6', title: 'Live Chat Support',   desc: 'Chat with our support team in real time — tap the bubble anytime.',  action: () => document.dispatchEvent(new CustomEvent('open-busgo-chat')) },
  ];

  const statsItems = [
    { val: '5M+',  label: 'Monthly Passengers',  icon: Users },
    { val: null,   label: 'Bus Routes',          icon: Globe, target: 500 },
    { val: '99%',  label: 'On-Time Performance', icon: Clock },
    { val: '4.8★', label: 'User Rating',         icon: Star },
  ];

  const outlineBtn = {
    background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#f97316', padding: '10px 22px', borderRadius: 50,
    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .25s', display: 'flex', alignItems: 'center', gap: 6,
  };

  return (
    <div className="hp-root" style={{ overflowX: 'hidden', fontFamily: "'Inter',sans-serif", background: '#ffffff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        /* reset is scoped to this page (it used to be a global * rule that leaked into the Navbar and other pages) */
        .hp-root, .hp-root *, .hp-root *::before, .hp-root *::after { box-sizing: border-box; }
        .hp-root * { margin: 0; padding: 0; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
        @keyframes fadeLeft { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:none} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(2)} }
        @keyframes shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(220%)} }
        @keyframes gradS    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes barSlide { from{width:0} to{width:100%} }
        @keyframes routeCardFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes selectDropdownIn { from{opacity:0;transform:translateY(-6px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .s-inp:focus { border-color:#f97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.14) !important; }
        .shim-btn { position: relative; overflow: hidden; }
        .shim-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent);
          animation:shimmer 2.8s infinite; pointer-events: none;
        }
        .hp-root ul { list-style: none; }

        .search-grid {
          display: grid;
          grid-template-columns: minmax(120px, 1.2fr) auto minmax(120px, 1.2fr) minmax(100px, 0.85fr) minmax(100px, 0.85fr) auto;
          gap: 8px; align-items: flex-end; min-width: 0;
        }
        .search-grid > div { min-width: 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; position: relative; margin-top: 52px; }
        .app-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }

        @media (max-width: 1024px) {
          .search-grid { grid-template-columns: 1fr 1fr; }
          .search-grid > div:first-child, .search-grid > div:nth-child(3) { grid-column: span 2; }
          .search-grid > div:nth-child(2) { display: none; }
          .search-grid > div:last-child { grid-column: span 2; }
        }
        @media (max-width: 900px) {
          .app-grid { grid-template-columns: 1fr; gap: 40px; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .search-grid { grid-template-columns: 1fr; }
          .search-grid > div { grid-column: span 1 !important; }
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
          .steps-grid { grid-template-columns: 1fr; }
          .steps-line { display: none; }
          .footer-grid { grid-template-columns: 1fr; }
          .hp-root section, .hp-root footer { padding-left: 20px !important; padding-right: 20px !important; }
        }
        ::selection { background: #fed7aa; color: #7c2d12; }
      `}</style>

      {/* ═══════════ HERO ═══════════ */}
      <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', paddingTop: 70, overflow: 'hidden', background: '#0b1220' }}>
        <div key={slide} ref={heroBgRef} style={{
          position: 'absolute', inset: 0, backgroundImage: `url(${cur.img})`, backgroundSize: 'cover', backgroundPosition: 'center center',
          opacity: slideFade ? 1 : 0, transition: 'opacity .85s ease', transform: 'scale(1.05)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(8,12,22,0.95) 0%, rgba(8,12,22,0.80) 40%, rgba(8,12,22,0.35) 70%, rgba(8,12,22,0.15) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,22,1) 0%, transparent 32%)' }} />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)', zIndex: 10 }}>
          <div key={`b${slide}`} style={{ height: '100%', background: 'linear-gradient(90deg,#f97316,#fbbf24)', animation: 'barSlide 5s linear forwards' }} />
        </div>

        <div style={{ position: 'absolute', bottom: 30, right: 40, display: 'flex', gap: 7, zIndex: 10 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} aria-label={`Show slide ${i + 1}`}
              onClick={() => { setSlideFade(false); setTimeout(() => { setSlide(i); setSlideFade(true); }, 650); }}
              style={{
                width: i === slide ? 28 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
                background: i === slide ? '#f97316' : 'rgba(255,255,255,0.28)', transition: 'all .4s cubic-bezier(.22,1,.36,1)',
              }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 5, maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div style={{ maxWidth: 780, width: '100%' }}>

            <div style={{ animation: heroVis ? 'fadeUp .8s ease both' : 'none', opacity: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.45)', color: '#fdba74', padding: '7px 17px', borderRadius: 50, fontSize: 12, fontWeight: 600, marginBottom: 22, backdropFilter: 'blur(12px)' }}>
                <span style={{ width: 6, height: 6, background: '#f97316', borderRadius: '50%', animation: 'pulse 1.8s infinite' }} />
                {cur.tag}
              </div>
            </div>

            <div style={{ animation: heroVis ? 'fadeLeft .9s .1s ease both' : 'none', opacity: 0 }}>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,4.4vw,58px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1.8px', marginBottom: 12, color: '#f8fafc' }}>
                {cur.headline}<br />
                <span style={{ background: 'linear-gradient(120deg,#f97316,#fbbf24,#f97316)', backgroundSize: '220% 220%', animation: 'gradS 3.5s ease infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {cur.sub}
                </span>
              </h1>
              <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#f97316,#fbbf24)', borderRadius: 2, marginBottom: 22, marginTop: 8 }} />
            </div>

            <div style={{ animation: heroVis ? 'fadeLeft .9s .25s ease both' : 'none', opacity: 0 }}>
              <p style={{ fontSize: 15, color: 'rgba(248,250,252,0.74)', maxWidth: 480, lineHeight: 1.7, marginBottom: 30, fontWeight: 400 }}>
                Discover 500+ routes across Tamil Nadu. Comfortable buses, guaranteed seats, real-time tracking — all in one place.
              </p>
            </div>

            <div style={{ animation: heroVis ? 'fadeUp .9s .4s ease both' : 'none', opacity: 0 }}>
              <div style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderRadius: 18, padding: '20px 22px', boxShadow: '0 24px 60px rgba(15,23,42,0.30), 0 0 0 1px rgba(15,23,42,0.04)', width: '100%' }}>

                <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                  {['One Way', 'Round Trip', 'Multi City'].map((t, i) => (
                    <button key={t} type="button" onClick={() => setActiveTab(i)}
                      style={{
                        padding: '7px 15px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif",
                        background: activeTab === i ? 'linear-gradient(135deg,#f97316,#ea6c0a)' : 'transparent',
                        color: activeTab === i ? '#fff' : '#94a3b8', transition: 'all .25s',
                        boxShadow: activeTab === i ? '0 5px 14px rgba(249,115,22,0.35)' : 'none',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearch}>
                  <div className="search-grid">
                    <div>
                      <FieldLabel>From</FieldLabel>
                      <CustomSelect value={form.from} onChange={(v) => setForm({ ...form, from: v })} options={cities} />
                    </div>

                    <div style={{ alignSelf: 'flex-end' }}>
                      <button type="button" onClick={swap} aria-label="Swap cities"
                        style={{ width: 42, height: 42, background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '50%', color: '#f97316', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .35s cubic-bezier(.22,1,.36,1)', flexShrink: 0 }}
                        {...lift({ background: '#f97316', color: '#fff', transform: 'rotate(180deg)' }, { background: '#fff7ed', color: '#f97316', transform: 'none' })}>
                        ⇄
                      </button>
                    </div>

                    <div>
                      <FieldLabel>To</FieldLabel>
                      <CustomSelect value={form.to} onChange={(v) => setForm({ ...form, to: v })} options={cities} />
                    </div>

                    <div>
                      <FieldLabel>Date</FieldLabel>
                      <input type="date" className="s-inp" style={sInp} value={form.date} min={today}
                        onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>

                    <div>
                      <FieldLabel>Type</FieldLabel>
                      <CustomSelect value={busType || 'All Types'} onChange={(v) => setBusType(v === 'All Types' ? '' : v)}
                        options={['All Types', 'AC', 'Non-AC', 'Sleeper', 'Volvo', 'Luxury']} />
                    </div>

                    <div style={{ alignSelf: 'flex-end' }}>
                      <button type="submit" className="shim-btn"
                        style={{ background: 'linear-gradient(135deg,#f97316,#ea6c0a)', color: '#fff', border: 'none', borderRadius: 11, height: 42, padding: '0 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', position: 'relative', overflow: 'hidden', transition: 'all .3s', boxShadow: '0 8px 22px rgba(249,115,22,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        {...lift({ transform: 'translateY(-2px)', boxShadow: '0 14px 32px rgba(249,115,22,0.55)' }, { transform: 'none', boxShadow: '0 8px 22px rgba(249,115,22,0.42)' })}>
                        Search 🔍
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 18, marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                    {['✓ Free Cancellation', '✓ Instant Confirmation', '✓ 24/7 Support', '✓ Best Price'].map((b) => (
                      <span key={b} style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>{b}</span>
                    ))}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.4)', fontSize: 9, zIndex: 10, letterSpacing: '1.6px', animation: 'float 2.6s ease-in-out infinite' }}>
          <span>SCROLL</span>
          <ChevronDown size={12} color="#f97316" />
        </div>
      </section>

      {/* ═══════════ TICKER ═══════════ */}
      <div style={{ background: 'linear-gradient(90deg,#fff7ed,#fffbf5,#fff7ed)', borderTop: '1px solid #fed7aa', borderBottom: '1px solid #fed7aa', padding: '12px 0', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', animation: 'ticker 26s linear infinite', width: 'max-content' }}>
          {[0, 1].map((ri) => (
            <React.Fragment key={ri}>
              {['🚌 500+ Routes', '⚡ Instant Booking', '✓ GPS Tracked', '💺 Guaranteed Seats', '🌟 4.8★ Rating', '🔒 Secure Payment', '📱 Easy Reschedule', '🎫 E-Ticket'].map((item) => (
                <span key={item + ri} style={{ fontSize: 13, fontWeight: 600, color: '#c2410c', letterSpacing: '.4px' }}>{item}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ═══════════ STATS ═══════════ */}
      <section style={{ background: 'linear-gradient(135deg,#ea580c 0%,#f97316 40%,#fb923c 70%,#f59e0b 100%)', padding: '58px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -50, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div className="stats-grid" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {statsItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.label} delay={i * 80}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, margin: '0 auto 12px', borderRadius: 14, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={21} color="#fff" strokeWidth={2.2} />
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-1.6px', textShadow: '0 4px 16px rgba(0,0,0,0.18)', whiteSpace: 'nowrap' }}>
                    {item.target ? <Counter target={item.target} suffix="+" /> : item.val}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.94)', marginTop: 10, fontWeight: 600, letterSpacing: '0.3px' }}>{item.label}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section style={{ padding: '80px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <SectionLabel icon={Sparkles}>Why BusGo?</SectionLabel>
              <SectionHeading>Travel with Confidence</SectionHeading>
              <p style={{ color: '#64748b', maxWidth: 440, margin: '14px auto 0', fontSize: 14, lineHeight: 1.7 }}>Everything you need for a perfect journey</p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 18 }}>
            {[
              { Icon: Shield,     color: '#f97316', title: 'Safe & Verified',      desc: 'GPS tracked, CCTV monitored, operator-verified buses on every route.', delay: 0 },
              { Icon: Clock,      color: '#3b82f6', title: 'On-Time Guarantee',    desc: '95% on-time rate. Real-time delay alerts sent to your phone instantly.', delay: 70 },
              { Icon: Star,       color: '#f59e0b', title: 'Top-Rated Operators',  desc: 'Only 4★+ operators. Vetted by 5M+ real traveller reviews.', delay: 140 },
              { Icon: Headphones, color: '#22c55e', title: '24/7 Support',         desc: 'Chat, call, or email — our team is always ready to help you.', delay: 210 },
              { Icon: MapIcon,    color: '#8b5cf6', title: 'Live Bus Tracking',    desc: 'Real-time GPS tracking. Share your bus location with family.', delay: 280 },
              { Icon: Award,      color: '#ec4899', title: 'Best Price Guarantee', desc: 'Compare fares, apply coupons, save up to 20% on every booking.', delay: 350 },
            ].map((props) => <FeatureCard key={props.title} {...props} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ POPULAR ROUTES ═══════════ */}
      <section style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <SectionLabel icon={TrendingUp}>Trending Now</SectionLabel>
                <SectionHeading>Popular Routes</SectionHeading>
              </div>
              <button onClick={() => navigate('/search')} style={outlineBtn}
                {...lift({ background: '#f97316', color: '#fff', borderColor: '#f97316', transform: 'translateY(-2px)' }, { background: '#fff7ed', color: '#f97316', borderColor: '#fed7aa', transform: 'none' })}>
                View All Routes <ArrowRight size={14} />
              </button>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {displayRoutes.map((r, i) => (
              <RouteCard key={`${r.from}-${r.to}-${i}`} {...r} delay={i * 70} onClick={() => goSearch(r.from, r.to)} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MODULES ═══════════ */}
      <section style={{ padding: '80px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <SectionLabel icon={Sparkles}>New</SectionLabel>
              <SectionHeading>More Ways to BusGo</SectionHeading>
              <p style={{ color: '#64748b', maxWidth: 460, margin: '14px auto 0', fontSize: 14, lineHeight: 1.7 }}>
                Wallet payments, coupons, reviews, alerts and live support — all built in.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 18 }}>
            {moduleCards.map(({ Icon, color, title, desc, action }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div onClick={action}
                  style={{ background: '#fff', border: '1.5px solid #e8ecf1', borderRadius: 18, padding: '24px 20px', cursor: 'pointer', transition: 'all .4s cubic-bezier(.22,1,.36,1)', height: '100%' }}
                  {...lift({ borderColor: color + '50', boxShadow: `0 18px 40px ${color}18`, transform: 'translateY(-6px)' }, { borderColor: '#e8ecf1', boxShadow: 'none', transform: 'none' })}>
                  <div style={{ width: 46, height: 46, background: `linear-gradient(145deg,${color}1e,${color}06)`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon size={20} color={color} strokeWidth={2.2} />
                  </div>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14.5, fontWeight: 800, color: '#0b1220', marginBottom: 8, letterSpacing: '-0.2px' }}>{title}</h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <SectionLabel>Simple Process</SectionLabel>
            <SectionHeading>Book in 3 Easy Steps</SectionHeading>
          </Reveal>
          <div className="steps-grid">
            <div className="steps-line" style={{ position: 'absolute', top: 34, left: 'calc(33% + 20px)', right: 'calc(33% + 20px)', height: 2, background: 'linear-gradient(90deg,#f97316,#fbbf24)' }} />
            {[
              { n: '01', icon: '🔍', title: 'Search Buses',   desc: 'Enter source, destination & date to see available buses' },
              { n: '02', icon: '💺', title: 'Pick Your Seat', desc: 'Choose from the live interactive seat map layout' },
              { n: '03', icon: '💳', title: 'Pay & Travel',   desc: 'Instant e-ticket via UPI, Card or Net Banking' },
            ].map(({ n, icon, title, desc }, i) => (
              <Reveal key={n} delay={i * 110}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 68, height: 68, background: 'linear-gradient(155deg, #fff7ed, #ffedd5)', border: '2px solid #fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, position: 'relative', zIndex: 1, boxShadow: '0 10px 26px rgba(249,115,22,0.18)' }}>
                    {icon}
                    <span style={{ position: 'absolute', top: -6, right: -6, width: 24, height: 24, background: 'linear-gradient(135deg,#f97316,#ea6c0a)', borderRadius: '50%', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 5px 14px rgba(249,115,22,0.45)' }}>{n}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15.5, fontWeight: 800, color: '#0b1220', letterSpacing: '-0.3px' }}>{title}</h3>
                  <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section style={{ padding: '80px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <SectionLabel icon={Star}>What Travellers Say</SectionLabel>
              <SectionHeading>Loved by Millions</SectionHeading>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              { name: 'Priya S.',   route: 'Chennai → Coimbatore', text: 'Super easy booking! Bus was on time and AC was perfect. Will use BusGo every time!', avatar: 'P', color: '#f97316' },
              { name: 'Karthik M.', route: 'Madurai → Chennai',    text: 'Best bus booking app in Tamil Nadu. Live tracking helped my family know when I arrived.', avatar: 'K', color: '#3b82f6' },
              { name: 'Anitha R.',  route: 'Chennai → Pondicherry', text: 'Booked a Volvo sleeper in 2 minutes. Smooth ride, clean bus, amazing experience!', avatar: 'A', color: '#22c55e' },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 110}>
                <div style={{ background: '#fff', border: '1.5px solid #e8ecf1', borderRadius: 18, padding: '24px 22px', transition: 'all .4s cubic-bezier(.22,1,.36,1)', height: '100%' }}
                  {...lift({ borderColor: '#fed7aa', boxShadow: '0 20px 44px rgba(249,115,22,0.12)', transform: 'translateY(-6px)' }, { borderColor: '#e8ecf1', boxShadow: 'none', transform: 'none' })}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                    {[0, 1, 2, 3, 4].map((si) => <span key={si} style={{ color: '#f59e0b', fontSize: 15 }}>★</span>)}
                  </div>
                  <p style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.8, marginBottom: 18, fontStyle: 'italic' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${t.color}25,${t.color}08)`, border: `2px solid ${t.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: t.color }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0b1220' }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{t.route}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <SectionLabel>FAQ</SectionLabel>
              <SectionHeading>Got Questions?</SectionHeading>
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 55}>
                <div style={{ background: '#fff', border: `1.5px solid ${activeFaq === i ? '#fed7aa' : '#e8ecf1'}`, borderRadius: 15, overflow: 'hidden', transition: 'all .3s', boxShadow: activeFaq === i ? '0 12px 30px rgba(249,115,22,0.12)' : '0 2px 8px rgba(15,23,42,0.04)' }}>
                  <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} aria-expanded={activeFaq === i}
                    style={{ width: '100%', padding: '17px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0b1220', textAlign: 'left', letterSpacing: '-0.15px', fontFamily: "'Inter',sans-serif" }}>{f.q}</span>
                    <span style={{ color: '#f97316', fontSize: 22, flexShrink: 0, transition: 'transform .3s cubic-bezier(.22,1,.36,1)', transform: activeFaq === i ? 'rotate(45deg)' : 'rotate(0)', fontWeight: 300, lineHeight: 1 }}>+</span>
                  </button>
                  {activeFaq === i && (
                    <div style={{ padding: '12px 22px 20px', color: '#64748b', fontSize: 13.5, lineHeight: 1.8, borderTop: '1px solid #f1f5f9', animation: 'fadeIn .3s ease' }}>{f.a}</div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg,#0b1220 0%,#1e1b4b 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: 100, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.16), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: 100, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.13), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '52px 44px', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: 46, marginBottom: 18, animation: 'float 3.2s ease-in-out infinite', filter: 'drop-shadow(0 10px 22px rgba(249,115,22,0.4))' }}>🚌</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(26px,3.2vw,40px)', fontWeight: 800, letterSpacing: '-1.4px', marginBottom: 14, color: '#f8fafc', lineHeight: 1.15 }}>
                Ready to <GradientText>Travel?</GradientText>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.75, maxWidth: 440, margin: '0 auto 32px' }}>Join 5 million+ happy travellers. Book in under 2 minutes.</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="shim-btn" onClick={() => navigate('/search')}
                  style={{ background: 'linear-gradient(135deg,#f97316,#dc6309)', color: '#fff', border: 'none', borderRadius: 50, padding: '15px 36px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 32px rgba(249,115,22,0.5)', position: 'relative', overflow: 'hidden', transition: 'all .3s', fontFamily: "'Inter',sans-serif" }}
                  {...lift({ transform: 'translateY(-2px)', boxShadow: '0 18px 44px rgba(249,115,22,0.62)' }, { transform: 'none', boxShadow: '0 12px 32px rgba(249,115,22,0.5)' })}>
                  Search Buses Now 🚌
                </button>
                <button onClick={() => navigate('/register')}
                  style={{ background: 'transparent', color: '#f97316', border: '1.5px solid rgba(249,115,22,0.48)', borderRadius: 50, padding: '15px 36px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', transition: 'all .3s', fontFamily: "'Inter',sans-serif" }}
                  {...lift({ borderColor: '#f97316', background: 'rgba(249,115,22,0.12)', transform: 'translateY(-2px)' }, { borderColor: 'rgba(249,115,22,0.48)', background: 'transparent', transform: 'none' })}>
                  Create Free Account
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FESTIVAL BANNER ═══════════ */}
      <section style={{ padding: '70px 40px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ background: 'linear-gradient(120deg,#7c3aed 0%,#6d28d9 50%,#f97316 100%)', borderRadius: 22, padding: '42px 46px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 24px 60px rgba(124,58,237,0.25)' }}>
              <div style={{ position: 'absolute', top: -50, right: 100, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: '6px 15px', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 14, backdropFilter: 'blur(10px)' }}>🎊 Limited Time</div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,2.6vw,32px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 10, lineHeight: 1.15 }}>Festival Season Special 🎉</h2>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Book now and get <strong style={{ color: '#fbbf24', fontWeight: 800 }}>up to 30% off</strong> on all routes for Deepavali, Pongal & Christmas travel.
                </p>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'stretch', minWidth: 220 }}>
                <div style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px dashed rgba(255,255,255,0.55)', borderRadius: 14, padding: '12px 28px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 5, fontWeight: 700 }}>Use Code</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: '#fbbf24', letterSpacing: '3.5px' }}>FESTIVAL30</div>
                </div>
                <button onClick={() => navigate('/search')}
                  style={{ background: '#fff', color: '#7c3aed', border: 'none', borderRadius: 50, padding: '13px 30px', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', width: '100%', transition: 'all .25s', boxShadow: '0 10px 26px rgba(0,0,0,0.15)', fontFamily: "'Inter',sans-serif" }}
                  {...lift({ transform: 'translateY(-2px)', boxShadow: '0 14px 34px rgba(0,0,0,0.22)' }, { transform: 'none', boxShadow: '0 10px 26px rgba(0,0,0,0.15)' })}>
                  Book Now & Save →
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ POPULAR DESTINATIONS ═══════════ */}
      <section style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <SectionLabel icon={Globe}>Explore Tamil Nadu</SectionLabel>
              <SectionHeading>Popular Destinations</SectionHeading>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {DESTINATIONS.map((d, i) => (
              <Reveal key={d.city} delay={i * 50}>
                <CityCard d={d} onSelect={goToCity} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ LAST MINUTE DEALS ═══════════ */}
      <section style={{ padding: '0 40px 80px', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <SectionLabel icon={Zap} color="#ef4444">Limited Seats</SectionLabel>
                <SectionHeading size="md">Last Minute Deals</SectionHeading>
              </div>
              <button onClick={() => navigate('/search')} style={{ ...outlineBtn, fontSize: 12.5 }}>View All <ArrowRight size={13} /></button>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 16 }}>
            {[
              { from: 'Chennai', to: 'Madurai',     departs: 'Today 10:30 PM',   seats: 3, orig: 750, disc: 499, type: 'AC Sleeper' },
              { from: 'Trichy',  to: 'Chennai',     departs: 'Today 11:00 PM',   seats: 5, orig: 600, disc: 420, type: 'Volvo AC' },
              { from: 'Salem',   to: 'Coimbatore',  departs: 'Tomorrow 6:00 AM', seats: 2, orig: 350, disc: 249, type: 'Non-AC' },
              { from: 'Chennai', to: 'Pondicherry', departs: 'Tomorrow 7:30 AM', seats: 4, orig: 280, disc: 199, type: 'AC Seater' },
            ].map((d, i) => (
              <Reveal key={`${d.from}-${d.to}`} delay={i * 70}>
                <div onClick={() => goSearch(d.from, d.to)}
                  style={{ background: '#fff', border: '1.5px solid #e8ecf1', borderRadius: 16, padding: '18px 20px', cursor: 'pointer', transition: 'all .4s cubic-bezier(.22,1,.36,1)', position: 'relative' }}
                  {...lift({ borderColor: '#f97316', boxShadow: '0 20px 44px rgba(249,115,22,0.15)', transform: 'translateY(-6px)' }, { borderColor: '#e8ecf1', boxShadow: 'none', transform: 'none' })}>
                  <div style={{ position: 'absolute', top: 14, right: 14, background: '#fef2f2', color: '#ef4444', fontSize: 10.5, fontWeight: 800, borderRadius: 20, padding: '4px 10px', border: '1px solid #fecaca' }}>⚡ {d.seats} left</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15.5, fontWeight: 800, color: '#0b1220', marginBottom: 6, letterSpacing: '-0.3px', paddingRight: 64 }}>{d.from} → {d.to}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 14 }}>{d.type} • {d.departs}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: '#f97316', letterSpacing: '-0.4px' }}>₹{d.disc}</span>
                    <span style={{ fontSize: 12.5, color: '#cbd5e1', textDecoration: 'line-through' }}>₹{d.orig}</span>
                    <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10.5, fontWeight: 800, borderRadius: 20, padding: '4px 9px', marginLeft: 'auto' }}>{Math.round((1 - d.disc / d.orig) * 100)}% OFF</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SPECIAL OFFERS ═══════════ */}
      <section style={{ padding: '80px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <SectionLabel icon={Percent}>Save More</SectionLabel>
                <SectionHeading>Special Offers & Coupons</SectionHeading>
              </div>
              {/* was "Manage Coupons" → /admin/coupons, which regular users cannot open */}
              <button onClick={() => navigate('/offers')} style={{ ...outlineBtn, fontSize: 12.5 }}>View All Offers →</button>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {OFFERS.map((o, i) => (
              <Reveal key={o.code} delay={i * 60}>
                <div style={{ background: '#fff', border: `1.5px solid ${o.border}`, borderRadius: 18, padding: '22px 20px', transition: 'all .4s cubic-bezier(.22,1,.36,1)', boxShadow: '0 2px 10px rgba(15,23,42,0.04)', height: '100%' }}
                  {...lift({ boxShadow: `0 22px 46px ${o.color}20`, transform: 'translateY(-6px)' }, { boxShadow: '0 2px 10px rgba(15,23,42,0.04)', transform: 'none' })}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14.5, fontWeight: 800, color: '#0b1220', marginBottom: 6, letterSpacing: '-0.2px' }}>{o.title}</div>
                      <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.55 }}>{o.desc}</div>
                    </div>
                    <div style={{ background: o.bg, color: o.color, fontSize: 11.5, fontWeight: 800, borderRadius: 10, padding: '7px 10px', whiteSpace: 'nowrap', fontFamily: "'Syne',sans-serif", flexShrink: 0, marginLeft: 10 }}>{o.discount}</div>
                  </div>
                  <div style={{ background: o.bg, border: `1.5px dashed ${o.border}`, borderRadius: 11, padding: '10px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: o.color, letterSpacing: '2px' }}>{o.code}</span>
                    <button onClick={() => copyCode(o.code)}
                      style={{ background: o.color, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 13px', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'transform .2s', fontFamily: "'Inter',sans-serif" }}
                      {...lift({ transform: 'scale(1.06)' }, { transform: 'scale(1)' })}>
                      Copy
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>🗓 {o.valid}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ OPERATORS ═══════════ */}
      <section style={{ padding: '70px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <SectionLabel icon={BusIcon}>Trusted Partners</SectionLabel>
              <SectionHeading size="md">Our Bus Operators</SectionHeading>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
            {[
              { name: 'TNSTC',           rating: 4.5, routes: 120, color: '#f97316', icon: '🚌' },
              { name: 'SETC',            rating: 4.3, routes: 80,  color: '#3b82f6', icon: '🚍' },
              { name: 'Parveen Travels', rating: 4.7, routes: 45,  color: '#22c55e', icon: '🚎' },
              { name: 'KPN Travels',     rating: 4.6, routes: 60,  color: '#8b5cf6', icon: '🚌' },
              { name: 'SRS Travels',     rating: 4.4, routes: 38,  color: '#ec4899', icon: '🚍' },
              { name: 'Kallada Tours',   rating: 4.8, routes: 52,  color: '#f59e0b', icon: '🚎' },
            ].map((op, i) => (
              <Reveal key={op.name} delay={i * 55}>
                <div style={{ background: '#f8fafc', border: '1.5px solid #e8ecf1', borderRadius: 18, padding: '22px 16px', textAlign: 'center', transition: 'all .4s cubic-bezier(.22,1,.36,1)', cursor: 'pointer' }}
                  {...lift({ borderColor: op.color, background: '#fff', boxShadow: `0 20px 44px ${op.color}20`, transform: 'translateY(-6px)' }, { borderColor: '#e8ecf1', background: '#f8fafc', boxShadow: 'none', transform: 'none' })}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>{op.icon}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: '#0b1220', marginBottom: 8, letterSpacing: '-0.2px' }}>{op.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 5 }}>
                    {[0, 1, 2, 3, 4].map((si) => (
                      <span key={si} style={{ color: si < Math.floor(op.rating) ? '#f59e0b' : '#e5e7eb', fontSize: 11.5 }}>★</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{op.routes} routes</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ APP DOWNLOAD ═══════════ */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg,#0b1220 0%,#1e293b 60%,#0b1220 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.14), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.11), transparent 70%)', pointerEvents: 'none' }} />

        <div className="app-grid" style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div>
              <SectionLabel icon={Sparkles}>Mobile App</SectionLabel>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3vw,40px)', fontWeight: 800, letterSpacing: '-1.3px', marginTop: 14, marginBottom: 16, color: '#f8fafc', lineHeight: 1.15 }}>
                Book On The Go with<br /><GradientText>BusGo App</GradientText>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.75, marginBottom: 30, maxWidth: 420 }}>
                Download our app and enjoy seamless booking, live tracking, e-tickets and exclusive app-only discounts — anytime, anywhere.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 30 }}>
                {[
                  { store: 'App Store',   icon: <Apple size={20} color="#fff" />, sub: 'Download on the' },
                  { store: 'Google Play', icon: <Play size={20} color="#fff" />,  sub: 'Get it on' },
                ].map((s) => (
                  <button key={s.store} onClick={() => toast('Mobile app is coming soon!', { icon: '📱' })}
                    style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '11px 20px', cursor: 'pointer', transition: 'all .35s' }}
                    {...lift({ background: '#f97316', borderColor: '#f97316', transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(249,115,22,0.42)' }, { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.14)', transform: 'none', boxShadow: 'none' })}>
                    {s.icon}
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.68)', letterSpacing: '.5px', fontWeight: 500 }}>{s.sub}</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 1 }}>{s.store}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                {[['50K+', 'App Downloads'], ['4.8★', 'App Rating'], ['99%', 'Uptime']].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: '#f97316', letterSpacing: '-0.4px' }}>{v}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, fontWeight: 500 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 220, height: 430, background: 'linear-gradient(145deg,#1e293b,#0b1220)', borderRadius: 36, border: '2px solid rgba(255,255,255,0.09)', boxShadow: '0 40px 84px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.09), inset 0 1px 0 rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px', gap: 12, position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: 52, height: 5, background: 'rgba(255,255,255,0.13)', borderRadius: 3 }} />
                <div style={{ width: '100%', background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(249,115,22,0.06))', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 15, padding: '15px 13px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 5 }}>🚌</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12.5, fontWeight: 800, color: '#f97316', letterSpacing: '-0.2px' }}>BusGo</div>
                  <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 3 }}>Book your bus</div>
                </div>
                {[
                  ['Chennai → CBE', '8:30 PM • 3 seats', '#22c55e'],
                  ['Madurai → MAS', '10:00 PM • 5 seats', '#f59e0b'],
                  ['Trichy → Salem', '7:00 AM • 2 seats', '#ef4444'],
                ].map(([r, d, c]) => (
                  <div key={r} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 11, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 3 }}>{r}</div>
                      <div style={{ fontSize: 9.5, color: '#64748b' }}>{d}</div>
                    </div>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 12px ${c}` }} />
                  </div>
                ))}
                <div style={{ width: '100%', background: 'linear-gradient(135deg,#f97316,#ea6c0a)', color: '#fff', borderRadius: 11, padding: 10, fontSize: 12, fontWeight: 800, fontFamily: "'Inter',sans-serif", marginTop: 6, textAlign: 'center', boxShadow: '0 10px 24px rgba(249,115,22,0.42)' }}>
                  Search Buses 🔍
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ background: '#0b1220', padding: '60px 40px 0', color: '#64748b' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#f97316,#ea6c0a)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, boxShadow: '0 10px 24px rgba(249,115,22,0.35)' }}>🚌</div>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>Bus<span style={{ color: '#f97316' }}>Go</span></span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: '#64748b', maxWidth: 280, marginBottom: 22 }}>
                Tamil Nadu's most trusted bus booking platform. 500+ routes, guaranteed seats, real-time tracking for 5M+ travellers.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[[Facebook, '#1d4ed8', 'Facebook'], [Twitter, '#0ea5e9', 'Twitter'], [Instagram, '#ec4899', 'Instagram'], [Youtube, '#ef4444', 'YouTube']].map(([Icon, color, label]) => (
                  <div key={label} role="img" aria-label={label}
                    style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all .25s' }}
                    {...lift({ background: color, color: '#fff', transform: 'translateY(-2px)', borderColor: color }, { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', transform: 'none', borderColor: 'rgba(255,255,255,0.09)' })}>
                    <Icon size={15} />
                  </div>
                ))}
              </div>
            </div>

            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: '#e2e8f0', marginBottom: 16, letterSpacing: '.3px' }}>{col.title}</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {col.links.map(([label, to]) => (
                    <li key={label}>
                      <a href={to === 'chat' ? '/help' : to} onClick={(e) => footerGo(e, to)}
                        style={{ color: '#64748b', fontSize: 12.5, textDecoration: 'none', transition: 'color .25s' }}
                        {...lift({ color: '#f97316' }, { color: '#64748b' })}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.10), rgba(251,191,36,0.05))', border: '1px solid rgba(249,115,22,0.20)', borderRadius: 18, padding: '24px 26px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, background: 'linear-gradient(135deg, rgba(249,115,22,0.28), rgba(251,191,36,0.16))', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={21} color="#f97316" />
              </div>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14.5, fontWeight: 800, color: '#e2e8f0', marginBottom: 4, letterSpacing: '-0.2px' }}>Get exclusive deals in your inbox</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Subscribe for special offers, travel tips & route updates</div>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); toast.success('Thanks for subscribing!'); e.target.reset(); }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input type="email" required placeholder="Enter your email" aria-label="Email address"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, padding: '11px 18px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: "'Inter',sans-serif", minWidth: 220 }} />
              <button type="submit"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea6c0a)', color: '#fff', border: 'none', borderRadius: 11, padding: '11px 22px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', boxShadow: '0 10px 24px rgba(249,115,22,0.4)', transition: 'transform .2s' }}
                {...lift({ transform: 'translateY(-2px)' }, { transform: 'none' })}>
                Subscribe
              </button>
            </form>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#475569' }}>© {new Date().getFullYear()} BusGo. All rights reserved. Made with ❤️ for Tamil Nadu travellers.</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <a key={l} href="/help" onClick={(e) => footerGo(e, '/help')}
                  style={{ fontSize: 12, color: '#475569', textDecoration: 'none', transition: 'color .25s' }}
                  {...lift({ color: '#f97316' }, { color: '#475569' })}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <LiveChatWidget />
    </div>
  );
}