import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { routeAPI, busAPI, bookingAPI } from '../services/api';
import {
  Bus, User, CreditCard, Loader, ChevronRight, ChevronLeft, Shield, Zap, RotateCcw, Armchair,
  Info, Check, X, Calendar, Clock, Ticket, Lock, Flame, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';
import PassengerQuickPick from '../components/SavedPassengers/PassengerQuickPick';

/* ═══════════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#ffffff', soft: '#f8fafc', ink: '#0f172a', body: '#334155', muted: '#64748b', dim: '#94a3b8',
  line: '#e9edf2', lineWarm: '#fde3cc',
  orange: '#f97316', orangeDk: '#ea580c', orangeDeep: '#c2410c', amber: '#fbbf24', tint: '#fff5ec',
  green: '#16a34a', greenBg: '#f0fdf4', greenLn: '#bbf7d0',
  blue: '#2563eb', blueBg: '#eff6ff', pink: '#db2777', pinkBg: '#fdf2f8', red: '#dc2626',
};
const GRAD = `linear-gradient(135deg, ${C.orange}, ${C.orangeDk})`;
const SHADOW = '0 1px 2px rgba(15,23,42,.04), 0 14px 34px -18px rgba(15,23,42,.16)';
const MAX_SEATS = 6;

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS
   ═══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
  @keyframes stepIn { from { opacity:0; transform: translateX(26px) scale(.99); } to { opacity:1; transform: none; } }
  @keyframes popIn { 0% { transform: scale(.6); opacity:0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity:1; } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(249,115,22,.45); } 70% { box-shadow: 0 0 0 10px rgba(249,115,22,0); } 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); } }
  @keyframes busRun { 0% { left: 0; } 100% { left: calc(100% - 32px); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes shine { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(330%) skewX(-18deg); } }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.35; } }

  .bk-seat { position: relative; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease; outline: none; }
  .bk-seat.available:hover, .bk-seat.available:focus-visible { transform: translateY(-3px); border-color: ${C.orange} !important; background: ${C.tint} !important; box-shadow: 0 2px 0 ${C.lineWarm}, 0 14px 22px -12px rgba(249,115,22,.6) !important; }
  .bk-seat.available:active { transform: translateY(1px); }
  .bk-seat.selected { animation: popIn .28s ease; }
  .bk-seat:focus-visible { box-shadow: 0 0 0 3px rgba(249,115,22,.35) !important; }

  .bk-btn { transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease; }
  .bk-btn:hover:not(:disabled) { transform: translateY(-2px); }
  .bk-btn.primary:hover:not(:disabled) { box-shadow: 0 16px 28px -14px rgba(234,88,12,.85) !important; }
  .bk-btn.ghost:hover:not(:disabled) { background: ${C.soft} !important; border-color: ${C.dim} !important; }
  .bk-btn:active:not(:disabled) { transform: translateY(0); }
  .shine { position:absolute; top:0; bottom:0; left:0; width:32%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); animation: shine 3.2s ease-in-out infinite; pointer-events:none; }

  .glass { backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
  .skeleton { background: linear-gradient(90deg, #f1f5f9 0px, #e5eaf0 40px, #f1f5f9 80px); background-size: 400px 100%; animation: shimmer 1.3s infinite linear; }

  .bk-input { transition: border-color .2s ease, box-shadow .2s ease, background .2s ease; }
  .bk-input::placeholder { color: ${C.dim}; }
  .bk-input:focus { border-color: ${C.orange} !important; box-shadow: 0 0 0 4px rgba(249,115,22,.14); background:#fff !important; }
  .bk-input.err { border-color: ${C.red} !important; }
  .seg-btn { transition: all .18s ease; }
  .seg-btn:not(:disabled):hover { border-color: ${C.orange} !important; }

  .tooltip-body { opacity:0; transform: translate(-50%, 0) scale(.92); pointer-events:none; transition: all .18s ease; }
  .tooltip-wrap:hover .tooltip-body { opacity:1; transform: translate(-50%, -8px) scale(1); }

  /* boarding-pass passenger card */
  .bp { display:flex; position:relative; }
  .bp-main { flex:1; min-width:0; }
  .bp-stub { width:122px; flex-shrink:0; border-left:2px dashed var(--bp-line); display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:16px 10px 12px; text-align:center; }
  .bp-notch { position:absolute; right:111px; width:20px; height:20px; border-radius:50%; background:#fff; border:2px solid var(--bp-line); z-index:2; }
  .bp-notch.t { top:-11px; clip-path: inset(50% 0 0 0); }
  .bp-notch.b { bottom:-11px; clip-path: inset(0 0 50% 0); }
  @media (max-width: 640px) {
    .bp { flex-direction:column-reverse; }
    .bp-stub { width:auto; flex-direction:row; border-left:none; border-bottom:2px dashed var(--bp-line); padding:12px 16px; text-align:left; }
    .bp-notch { display:none; }
    .bp-bars { display:none; }
  }

  .booking-grid { display:grid; grid-template-columns:1fr 330px; gap:24px; align-items:start; }
  @media (max-width: 960px) { .booking-grid { grid-template-columns:1fr; } }
  @media (max-width: 640px) {
    .pax-grid { grid-template-columns:1fr !important; }
    .step-label { display:none; }
    .route-city { font-size:21px !important; }
  }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d5dbe3; border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: #b9c2ce; }
`;

/* ═══════════════════════════════════════════════════════════════
   SMALL PIECES
   ═══════════════════════════════════════════════════════════════ */
const MaleIcon = ({ size = 11, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="5.5" /><path d="M14 10l6-6" /><path d="M14 4h6v6" />
  </svg>
);
const FemaleIcon = ({ size = 11, color = C.pink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="5.5" /><path d="M12 14.5V22" /><path d="M8.5 18.5h7" />
  </svg>
);
const WheelIcon = ({ size = 22, color = C.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.2" />
    <path d="M12 3v5.5M12 15.5V21M3.2 12h5.5M15.3 12h5.5" />
  </svg>
);

/* Smoothly tweens a rupee amount when it changes */
const AnimatedNumber = ({ value, prefix = '₹' }) => {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    prev.current = value;
    if (from === to) return undefined;
    let raf, start;
    const tick = (t) => {
      if (start == null) start = t;
      const p = Math.min((t - start) / 450, 1);
      setShown(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{prefix}{shown}</>;
};

/* Decorative QR-style art, deterministic from a seed (not scannable) */
const QRArt = ({ seed, size = 92 }) => {
  const n = 21;
  let h = 2166136261;
  for (const ch of String(seed || 'busgo')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  h = h || 1;
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
  const finder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!finder(x, y) && rnd() > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  }
  const Eye = ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" /><rect x="1" y="1" width="5" height="5" fill="#fff" /><rect x="2" y="2" width="3" height="3" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} fill={C.ink} shapeRendering="crispEdges">
      {cells}<Eye x={0} y={0} /><Eye x={n - 7} y={0} /><Eye x={0} y={n - 7} />
    </svg>
  );
};

/* Ticket shell with real perforation notches (CSS mask) */
const TOP_MASK = 'radial-gradient(circle 11px at 0 100%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 100%, #0000 98%, #000) right / 51% 100% no-repeat';
const BOT_MASK = 'radial-gradient(circle 11px at 0 0, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 0, #0000 98%, #000) right / 51% 100% no-repeat';
const TicketShell = ({ top, bottom, style }) => (
  <div style={{ filter: 'drop-shadow(0 1px 2px rgba(15,23,42,.1)) drop-shadow(0 18px 24px rgba(15,23,42,.1))', ...style }}>
    <div style={{ background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeDk} 70%, ${C.orangeDeep} 100%)`, color: '#fff', borderRadius: '22px 22px 0 0', WebkitMask: TOP_MASK, mask: TOP_MASK, position: 'relative' }}>
      {top}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 0, borderBottom: '2px dashed rgba(255,255,255,.55)' }} />
    </div>
    <div style={{ background: '#fff', borderRadius: '0 0 22px 22px', WebkitMask: BOT_MASK, mask: BOT_MASK }}>{bottom}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const toMin = (t) => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; };
const calcDuration = (a, b) => {
  const x = toMin(a), y = toMin(b);
  if (x == null || y == null) return null;
  let d = y - x; if (d <= 0) d += 1440;
  return `${Math.floor(d / 60)}h ${String(d % 60).padStart(2, '0')}m`;
};
const getSeatState = (s, sel) => {
  if (sel.includes(s.seatNumber)) return 'selected';
  if (!s.isAvailable) return 'sold';
  if (s.genderLock === 'male') return 'maleLock';
  if (s.genderLock === 'female') return 'femaleLock';
  return 'available';
};
const buildRows = (arr) => {
  const rows = [];
  for (let i = 0; i < arr.length; i += 3) rows.push({ left: arr.slice(i, i + 1), right: arr.slice(i + 1, i + 3) });
  return rows;
};
const ageOk = (v) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 100; };

const LEGENDS = [
  { key: 'available', label: 'Available' }, { key: 'selected', label: 'Selected' }, { key: 'sold', label: 'Sold' },
  { key: 'male', label: 'Male only' }, { key: 'female', label: 'Female only' },
];
const SOLD_BG = 'repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9 5px,#e7ecf2 5px,#e7ecf2 10px)';

const LegendSwatch = ({ k }) => {
  const b = { width: 22, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  if (k === 'available') return <div style={{ ...b, background: '#fff', border: '1.5px solid #cbd5e1', boxShadow: '0 2px 0 #e2e8f0' }} />;
  if (k === 'selected') return <div style={{ ...b, background: GRAD, boxShadow: `0 2px 0 ${C.orangeDeep}` }}><Check size={11} color="#fff" strokeWidth={3} /></div>;
  if (k === 'sold') return <div style={{ ...b, background: SOLD_BG, border: '1.5px solid #e2e8f0' }} />;
  if (k === 'male') return <div style={{ ...b, background: C.blueBg, border: `1.5px solid ${C.blue}` }}><MaleIcon size={10} /></div>;
  return <div style={{ ...b, background: C.pinkBg, border: `1.5px solid ${C.pink}` }}><FemaleIcon size={10} /></div>;
};

const SeatSkeleton = () => (
  <div style={{ maxWidth: 360, margin: '0 auto' }}>
    <div className="skeleton" style={{ height: 22, width: 140, borderRadius: 8, marginBottom: 12 }} />
    <div style={{ border: `2px solid ${C.line}`, borderRadius: 28, padding: 16 }}>
      {[0, 1, 2, 3, 4].map(r => (
        <div key={r} style={{ display: 'flex', gap: 14, marginBottom: 10, justifyContent: 'center' }}>
          {[0, 1, 2].map(c => <div key={c} className="skeleton" style={{ width: 50, height: 76, borderRadius: 12 }} />)}
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SEAT CELL  (keycap style, keyboard accessible)
   ═══════════════════════════════════════════════════════════════ */
const SeatCell = ({ seat, selectedSeats, onToggle }) => {
  const st = getSeatState(seat, selectedSeats);
  const isSold = st === 'sold', isSel = st === 'selected', isMale = st === 'maleLock', isFemale = st === 'femaleLock';

  const bg = isSel ? GRAD : isSold ? SOLD_BG : isMale ? C.blueBg : isFemale ? C.pinkBg : 'linear-gradient(180deg,#fff,#f8fafc)';
  const border = isSel ? C.orange : isSold ? '#e2e8f0' : isMale ? C.blue : isFemale ? C.pink : '#d6dde6';
  const edge = isSel ? C.orangeDeep : isSold ? '#e2e8f0' : isMale ? '#bfdbfe' : isFemale ? '#fbcfe8' : '#e2e8f0';
  const pillow = isSel ? 'rgba(255,255,255,.65)' : isSold ? '#dbe2ea' : isMale ? C.blue : isFemale ? C.pink : '#cfd7e1';
  const label = `Seat ${seat.seatNumber}, ₹${seat.price}${isSold ? ', sold' : isSel ? ', selected' : ''}`;

  return (
    <div className="tooltip-wrap" style={{ position: 'relative' }}>
      <div role="button" tabIndex={isSold ? -1 : 0} aria-label={label} aria-pressed={isSel} aria-disabled={isSold}
        className={`bk-seat ${isSold ? '' : isSel ? 'selected' : 'available'}`}
        onClick={() => onToggle(seat)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(seat); } }}
        style={{
          width: 50, height: 76, borderRadius: 13, background: bg, border: `1.5px solid ${border}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          cursor: isSold ? 'not-allowed' : 'pointer', overflow: 'hidden',
          boxShadow: isSel ? `0 3px 0 ${edge}, 0 14px 22px -10px rgba(234,88,12,.7)` : isSold ? 'none' : `0 2px 0 ${edge}`,
        }}>
        <div style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', width: 24, height: 5, borderRadius: 99, background: pillow }} />
        {isSold ? (
          <span style={{ fontSize: 10, color: C.dim, fontWeight: 700, marginTop: 6 }}>Sold</span>
        ) : isSel ? (
          <>
            <Check size={16} color="#fff" strokeWidth={3} style={{ marginTop: 6 }} />
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 800 }}>₹{seat.price}</span>
          </>
        ) : (
          <>
            <div style={{ marginTop: 8, height: 14, display: 'flex', alignItems: 'center' }}>
              {isMale && <MaleIcon size={13} />}{isFemale && <FemaleIcon size={13} />}
            </div>
            <span style={{ fontSize: 12, color: C.ink, fontWeight: 800 }}>₹{seat.price}</span>
            <span style={{ fontSize: 8.5, color: C.dim, fontWeight: 700, letterSpacing: '.4px' }}>{seat.seatNumber}</span>
          </>
        )}
      </div>

      <div className="tooltip-body" style={{ position: 'absolute', bottom: '105%', left: '50%', background: C.ink, color: '#fff', padding: '8px 11px', borderRadius: 10, fontSize: 11, whiteSpace: 'nowrap', zIndex: 60, boxShadow: '0 12px 28px -8px rgba(15,23,42,.45)' }}>
        <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 2 }}>Seat {seat.seatNumber}</div>
        {isSold ? <div style={{ color: '#fca5a5' }}>Sold{seat.bookedGender ? ` (${seat.bookedGender})` : ''}</div>
          : <div style={{ color: '#fdba74' }}>₹{seat.price}{seat.seatType ? ` • ${seat.seatType}` : ''}</div>}
        {isMale && <div style={{ color: '#93c5fd', marginTop: 2 }}>Male only</div>}
        {isFemale && <div style={{ color: '#f9a8d4', marginTop: 2 }}>Female only</div>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DECK  (bus-shaped frame)
   ═══════════════════════════════════════════════════════════════ */
const Deck = ({ deckSeats, showDriver, selectedSeats, onToggle }) => {
  const rows = buildRows(deckSeats);
  return (
    <div style={{ maxWidth: 360, margin: '0 auto', animation: 'stepIn .35s ease' }}>
      <div style={{ border: `2px solid ${C.line}`, borderRadius: '34px 34px 16px 16px', background: `linear-gradient(180deg, ${C.soft}, #fff 45%)`, padding: '0 18px 22px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 1px 0 #fff' }}>
        <div style={{ margin: '0 -18px 18px', height: 54, background: `linear-gradient(180deg, ${C.tint}, #fff)`, borderBottom: `1px dashed ${C.lineWarm}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          {showDriver ? <WheelIcon /> : <span style={{ width: 22 }} />}
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.4px', color: C.orange }}>FRONT</span>
          <span style={{ width: 22 }} />
        </div>
        {deckSeats.length === 0
          ? <div style={{ color: C.dim, fontSize: 12, textAlign: 'center', padding: '24px 0' }}>No seats on this deck</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'center' }}>
              {rows.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 8 }}>{row.left.map(s => <SeatCell key={s.seatNumber} seat={s} selectedSeats={selectedSeats} onToggle={onToggle} />)}</div>
                  <div style={{ width: 24, textAlign: 'center', fontSize: 8, color: C.dim, letterSpacing: '1px' }}>{ri === 0 ? 'AISLE' : ''}</div>
                  <div style={{ display: 'flex', gap: 8 }}>{row.right.map(s => <SeatCell key={s.seatNumber} seat={s} selectedSeats={selectedSeats} onToggle={onToggle} />)}</div>
                </div>
              ))}
            </div>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
export default function BookingPage() {
  const { routeId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const travelDate = sp.get('date');

  const [route, setRoute] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [step, setStep] = useState(1);
  const [deckTab, setDeckTab] = useState('lower');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const fmtDate = (opts) => {
    const d = travelDate ? new Date(travelDate) : null;
    return d && !isNaN(d) ? d.toLocaleDateString('en-IN', opts) : '—';
  };

  /* ─── Load ─── */
  useEffect(() => {
    let cancelled = false;
    let script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
    setLoading(true); setLoadError(false);
    routeAPI.getById(routeId)
      .then(r => {
        if (cancelled) return null;
        setRoute(r.data.route);
        return busAPI.getSeats(r.data.route.bus?._id || r.data.route.bus);
      })
      .then(r => { if (r && !cancelled) setSeats(r.data.seats); })
      .catch(() => { if (!cancelled) { setLoadError(true); toast.error('Error loading route'); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [routeId]);

  /* ─── Seats ─── */
  const removeSeat = (n) => {
    setSelectedSeats(prev => prev.filter(s => s !== n));
    setPassengers(prev => prev.filter(p => p.seatNumber !== n));
  };
  const toggleSeat = (seat) => {
    if (!seat.isAvailable) { toast.error('Seat already booked'); return; }
    if (selectedSeats.includes(seat.seatNumber)) { removeSeat(seat.seatNumber); return; }
    if (selectedSeats.length >= MAX_SEATS) { toast.error(`Max ${MAX_SEATS} seats per booking`); return; }
    const g = seat.genderLock === 'female' ? 'Female' : 'Male';
    setSelectedSeats(prev => [...prev, seat.seatNumber]);
    setPassengers(prev => [...prev, { name: '', age: '', gender: g, seatNumber: seat.seatNumber, price: seat.price }]);
  };
  const updP = (n, field, val) => setPassengers(ps => ps.map(p => p.seatNumber === n ? { ...p, [field]: val } : p));

  /* ─── Create booking ─── */
  const handleContinueToPayment = async () => {
    for (const p of passengers) {
      if (!p.name.trim() || !p.age) { toast.error('Fill all passenger details'); return; }
      if (!ageOk(p.age)) { toast.error(`Enter a valid age for seat ${p.seatNumber}`); return; }
      const seat = seats.find(s => s.seatNumber === p.seatNumber);
      if (seat?.genderLock === 'male' && p.gender !== 'Male') { toast.error(`Seat ${p.seatNumber} is male only`); return; }
      if (seat?.genderLock === 'female' && p.gender !== 'Female') { toast.error(`Seat ${p.seatNumber} is female only`); return; }
    }
    if (!travelDate) { toast.error('Travel date missing. Go back and search again.'); return; }
    setLoading(true);
    try {
      const busId = route.bus?._id || route.bus;
      const cleaned = passengers.map(p => ({ ...p, name: p.name.trim(), age: Number(p.age) }));
      const { data } = await bookingAPI.create({
        routeId, busId, travelDate, passengers: cleaned,
        boardingPoint: route.from, droppingPoint: route.to, paymentMethod: 'razorpay'
      });
      setBookingId(data.booking._id);
      toast.success('Details saved! Proceed to payment.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating booking');
    } finally { setLoading(false); }
  };

  /* ─── Razorpay ─── */
  const handleRazorpayPayment = async () => {
    if (payLoading) return;
    if (!window.Razorpay) { toast.error('Payment gateway is still loading. Try again in a moment.'); return; }
    setPayLoading(true);
    try {
      const { data } = await API.post('/payments/create-order', { bookingId });
      const options = {
        key: data.key, amount: data.amount, currency: data.currency, name: 'BusGo',
        description: `Bus Ticket - ${route.from} to ${route.to}`,
        image: 'https://img.icons8.com/color/96/bus.png', order_id: data.orderId,
        prefill: { name: passengers[0]?.name || '', email: localStorage.getItem('busgo_user_email') || '', contact: '' },
        theme: { color: C.orange },
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature, bookingId
            });
            if (verifyRes.data.success) {
              toast.success('🎉 Payment Successful! Booking Confirmed!');
              navigate(`/booking/confirm/${bookingId}`);
            } else { toast.error('Payment could not be verified. Contact support.'); setPayLoading(false); }
          } catch { toast.error('Payment verification failed. Contact support.'); setPayLoading(false); }
        },
        modal: { ondismiss: () => { toast.error('Payment cancelled'); setPayLoading(false); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res) => { toast.error(`Payment failed: ${res.error.description}`); setPayLoading(false); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment init failed');
      setPayLoading(false);
    }
  };

  /* ─── Derived ─── */
  const total = passengers.reduce((s, p) => s + (Number(p.price) || route?.basePrice || 0), 0);
  const discount = total > 2000 ? Math.round(total * 0.05) : 0;
  const gst = Math.round((total - discount) * 0.05);
  const finalTotal = total - discount + gst;

  const filledCount = useMemo(() => passengers.filter(p => p.name.trim() && ageOk(p.age)).length, [passengers]);
  const lower = useMemo(() => seats.filter(s => s.deck !== 'upper'), [seats]);
  const upper = useMemo(() => seats.filter(s => s.deck === 'upper'), [seats]);
  const freeCount = seats.filter(s => s.isAvailable).length;
  const fillingFast = seats.length > 0 && freeCount / seats.length <= 0.25;
  const hasUpper = upper.length > 0;
  const activeDeck = hasUpper && deckTab === 'upper' ? upper : lower;
  const selInDeck = (arr) => arr.filter(s => selectedSeats.includes(s.seatNumber)).length;

  /* ─── Early screens ─── */
  if (loading && !route) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: C.muted }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ width: 54, height: 54, border: `4px solid ${C.line}`, borderTopColor: C.orange, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Loading seats...</span>
    </div>
  );
  if (loadError || !route) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: C.muted, padding: 24, textAlign: 'center' }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>Couldn't load this route</div>
      <div style={{ fontSize: 14 }}>It may have been removed or the server is not reachable.</div>
      <button className="bk-btn primary" onClick={() => navigate('/search')}
        style={{ background: GRAD, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Back to Search</button>
    </div>
  );

  const duration = calcDuration(route.departureTime, route.arrivalTime);
  const card = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 22, padding: 26, boxShadow: SHADOW };
  const h2Style = { fontFamily: 'Syne', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, color: C.ink, margin: 0 };
  const labelStyle = { fontSize: 11, fontWeight: 800, color: C.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.9px' };
  const inp = { width: '100%', background: C.soft, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: '12px 14px', color: C.ink, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter,system-ui,sans-serif' };
  const chip = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: C.body, background: '#fff', border: `1px solid ${C.line}`, padding: '6px 13px', borderRadius: 99 };
  const STEPS = [{ n: 1, l: 'Seats', i: Armchair }, { n: 2, l: 'Passengers', i: User }, { n: 3, l: 'Payment', i: CreditCard }];

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(900px 340px at 88% -60px, rgba(249,115,22,.10), transparent 70%), radial-gradient(700px 300px at 0% 0%, rgba(251,191,36,.08), transparent 70%), ${C.bg}`, paddingTop: 80, paddingBottom: 80, color: C.ink, fontFamily: 'Inter,system-ui,sans-serif' }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>

        {/* ════════ HERO ════════ */}
        <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: 18, position: 'relative', background: 'linear-gradient(120deg,#fff7ed 0%,#ffffff 55%,#fff3e6 100%)', animation: 'fadeUp .4s ease' }}>
          <Bus size={230} color="rgba(249,115,22,.07)" strokeWidth={1.2} style={{ position: 'absolute', right: -30, bottom: -56, transform: 'rotate(-8deg)', pointerEvents: 'none' }} />
          <div style={{ height: 5, background: `linear-gradient(90deg, ${C.orange}, ${C.amber})` }} />
          <div style={{ padding: '24px 28px 20px', display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ minWidth: 110 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '1.6px', color: C.dim }}>FROM</div>
              <div className="route-city" style={{ fontFamily: 'Syne', fontSize: 30, fontWeight: 800, lineHeight: 1.12 }}>{route.from}</div>
              <div style={{ fontSize: 14, color: C.orangeDk, fontWeight: 800, marginTop: 2 }}>{route.departureTime}</div>
            </div>

            <div style={{ flex: 1, minWidth: 150, position: 'relative', height: 32 }}>
              <div style={{ position: 'absolute', top: 15, left: 6, right: 6, borderTop: `2px dashed ${C.lineWarm}` }} />
              <div style={{ position: 'absolute', top: 10, left: 0, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: `3px solid ${C.orange}` }} />
              <div style={{ position: 'absolute', top: 10, right: 0, width: 12, height: 12, borderRadius: '50%', background: C.orange }} />
              <div style={{ position: 'absolute', top: 0, width: 32, height: 32, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -6px rgba(234,88,12,.8)', animation: 'busRun 4.5s ease-in-out infinite alternate' }}>
                <Bus size={16} color="#fff" />
              </div>
              {duration && (
                <div style={{ position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  <Clock size={11} /> {duration}
                </div>
              )}
            </div>

            <div style={{ minWidth: 110, textAlign: 'right' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '1.6px', color: C.dim }}>TO</div>
              <div className="route-city" style={{ fontFamily: 'Syne', fontSize: 30, fontWeight: 800, lineHeight: 1.12 }}>{route.to}</div>
              <div style={{ fontSize: 14, color: C.orangeDk, fontWeight: 800, marginTop: 2 }}>{route.arrivalTime}</div>
            </div>
          </div>

          <div style={{ borderTop: `1px dashed ${C.lineWarm}`, padding: '13px 28px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', position: 'relative' }}>
            <span style={chip}><Calendar size={13} color={C.orange} /> {fmtDate({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {typeof route.bus?.name === 'string' && <span style={chip}><Bus size={13} color={C.orange} /> {route.bus.name}</span>}
            {seats.length > 0 && (
              <span style={{ ...chip, color: fillingFast ? C.orangeDeep : C.body, borderColor: fillingFast ? C.lineWarm : C.line, background: fillingFast ? C.tint : '#fff' }}>
                {fillingFast ? <Flame size={13} color={C.orange} style={{ animation: 'blink 1.6s infinite' }} /> : <Armchair size={13} color={C.orange} />}
                {freeCount} seats left{fillingFast ? ' · filling fast' : ''}
              </span>
            )}
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: C.green }}>
              <Shield size={13} /> Free cancellation up to 24h
            </span>
          </div>
        </div>

        {/* ════════ STEPPER ════════ */}
        <div className="glass" style={{ position: 'sticky', top: 74, zIndex: 40, marginBottom: 22, background: 'rgba(255,255,255,.9)', border: `1px solid ${C.line}`, borderRadius: 18, padding: '12px 18px', boxShadow: SHADOW, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {STEPS.map(({ n, l, i: Icon }, idx) => {
              const active = step === n, done = step > n;
              const clickable = done && !payLoading && step < 3;
              return (
                <React.Fragment key={n}>
                  <button onClick={() => clickable && setStep(n)}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: 0, cursor: clickable ? 'pointer' : 'default', color: active ? C.orangeDk : done ? C.green : C.dim, fontWeight: 800, fontSize: 13 }}>
                    <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? C.green : active ? GRAD : '#fff', border: `2px solid ${done ? C.green : active ? C.orange : C.line}`, animation: active ? 'pulseRing 2s infinite' : 'none', transition: 'all .3s' }}>
                      {done ? <Check size={16} color="#fff" strokeWidth={3} /> : <Icon size={16} color={active ? '#fff' : C.dim} />}
                    </span>
                    <span className="step-label">{l}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 3, margin: '0 12px', borderRadius: 99, background: C.line, overflow: 'hidden', minWidth: 20 }}>
                      <div style={{ height: '100%', width: step > n ? '100%' : '0%', background: C.green, transition: 'width .5s ease' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <button className="bk-btn ghost" onClick={() => navigate(-1)}
            style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: C.muted, cursor: 'pointer' }}>Cancel</button>
        </div>

        <div className="booking-grid">
          <div key={step} style={{ animation: 'stepIn .45s cubic-bezier(.2,.8,.2,1)' }}>

            {/* ═══════════ STEP 1 · SEATS ═══════════ */}
            {step === 1 && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <h2 style={h2Style}><Armchair size={20} color={C.orange} /> Choose your seats</h2>
                  <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 6, background: C.soft, padding: '6px 12px', borderRadius: 99 }}>
                    <Info size={13} color={C.orange} /> Tap to select · max {MAX_SEATS}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', padding: '12px 16px', background: C.soft, borderRadius: 14, border: `1px solid ${C.line}` }}>
                  {LEGENDS.map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.body, fontWeight: 600 }}><LegendSwatch k={key} /> {label}</div>
                  ))}
                </div>

                {/* deck switch with sliding pill */}
                {hasUpper && (
                  <div style={{ position: 'relative', display: 'flex', background: C.soft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 4, maxWidth: 360, margin: '0 auto 18px' }}>
                    <div style={{ position: 'absolute', top: 4, bottom: 4, left: 4, width: 'calc(50% - 4px)', borderRadius: 11, background: '#fff', boxShadow: '0 2px 8px rgba(15,23,42,.1)', transform: deckTab === 'upper' ? 'translateX(100%)' : 'none', transition: 'transform .3s cubic-bezier(.4,0,.2,1)' }} />
                    {[['lower', 'Lower deck', lower], ['upper', 'Upper deck', upper]].map(([k, l, arr]) => (
                      <button key={k} onClick={() => setDeckTab(k)}
                        style={{ position: 'relative', flex: 1, background: 'none', border: 'none', padding: '10px 8px', fontSize: 13, fontWeight: 800, cursor: 'pointer', color: deckTab === k ? C.orangeDk : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                        {l}
                        <span style={{ fontSize: 10.5, fontWeight: 800, background: selInDeck(arr) ? C.orange : C.line, color: selInDeck(arr) ? '#fff' : C.muted, padding: '1px 7px', borderRadius: 99 }}>
                          {selInDeck(arr) ? `${selInDeck(arr)} picked` : `${arr.filter(s => s.isAvailable).length} free`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {loading ? <SeatSkeleton /> : seats.length === 0 ? (
                  <div style={{ textAlign: 'center', color: C.dim, padding: '30px 0', fontSize: 14 }}>No seat data available for this bus.</div>
                ) : (
                  <Deck key={deckTab} deckSeats={activeDeck} showDriver={activeDeck === lower} selectedSeats={selectedSeats} onToggle={toggleSeat} />
                )}

                {/* sticky tray */}
                <div className="glass" style={{ position: 'sticky', bottom: 14, zIndex: 30, marginTop: 26, background: 'rgba(255,255,255,.95)', border: `1px solid ${selectedSeats.length ? C.lineWarm : C.line}`, borderRadius: 18, padding: '12px 14px 12px 18px', boxShadow: '0 16px 36px -14px rgba(15,23,42,.32)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    {selectedSeats.length === 0 ? (
                      <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>No seats selected yet. Tap a seat to begin.</div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {selectedSeats.map(s => (
                          <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.tint, color: C.orangeDk, border: `1px solid ${C.lineWarm}`, padding: '3px 6px 3px 11px', borderRadius: 99, fontSize: 12, fontWeight: 800, animation: 'popIn .25s' }}>
                            {s}
                            <button onClick={() => removeSeat(s)} aria-label={`Remove seat ${s}`} style={{ background: 'rgba(234,88,12,.12)', border: 'none', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                              <X size={11} color={C.orangeDk} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: C.dim, fontWeight: 700 }}>{selectedSeats.length} seat(s) · incl. GST</div>
                    <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}><AnimatedNumber value={finalTotal} /></div>
                  </div>
                  <button className="bk-btn primary" onClick={() => { if (!selectedSeats.length) { toast.error('Select at least 1 seat'); return; } setStep(2); }}
                    style={{ position: 'relative', overflow: 'hidden', background: selectedSeats.length ? GRAD : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 13, padding: '14px 26px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Syne', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {selectedSeats.length > 0 && <span className="shine" />}
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════ STEP 2 · PASSENGERS ═══════════ */}
            {step === 2 && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
                  <h2 style={h2Style}><User size={20} color={C.orange} /> Who's travelling?</h2>
                  <span style={{ fontSize: 12, fontWeight: 800, color: filledCount === passengers.length ? C.green : C.muted, background: filledCount === passengers.length ? C.greenBg : C.soft, padding: '6px 12px', borderRadius: 99, transition: 'all .3s' }}>
                    {filledCount}/{passengers.length} completed
                  </span>
                </div>
                <p style={{ fontSize: 13, color: C.muted, margin: '0 0 20px' }}>Names should match the ID proof carried during travel.</p>

                {passengers.map((p, i) => {
                  const rawLock = seats.find(s => s.seatNumber === p.seatNumber)?.genderLock;
                  const lock = rawLock === 'male' || rawLock === 'female' ? rawLock : null;
                  const complete = p.name.trim() && ageOk(p.age);
                  const ageBad = p.age !== '' && !ageOk(p.age);
                  const lineCol = complete ? C.greenLn : C.lineWarm;
                  return (
                    <div key={p.seatNumber} className="bp" style={{ '--bp-line': lineCol, border: `1.5px solid ${complete ? C.greenLn : C.line}`, borderRadius: 20, marginBottom: 18, background: '#fff', boxShadow: '0 2px 10px -6px rgba(15,23,42,.1)', animation: 'fadeUp .4s ease', animationDelay: `${i * .07}s`, animationFillMode: 'both', zIndex: passengers.length - i + 5, transition: 'border-color .3s' }}>
                      <span className="bp-notch t" /><span className="bp-notch b" />

                      <div className="bp-main" style={{ padding: '18px 20px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.4px', color: C.dim }}>PASSENGER {i + 1}</span>
                          {lock && <span style={{ fontSize: 10.5, fontWeight: 800, color: lock === 'male' ? C.blue : C.pink, background: lock === 'male' ? C.blueBg : C.pinkBg, padding: '2px 9px', borderRadius: 99 }}>{lock === 'male' ? 'Male' : 'Female'} only seat</span>}
                        </div>

                        <div className="pax-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
                          <div>
                            <label style={labelStyle}>Full name *</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input className="bk-input" style={{ ...inp, flex: 1 }} placeholder="As on ID proof" value={p.name} onChange={e => updP(p.seatNumber, 'name', e.target.value)} />
                              <PassengerQuickPick onSelect={(saved) => {
                                updP(p.seatNumber, 'name', saved.name);
                                updP(p.seatNumber, 'age', String(saved.age));
                                updP(p.seatNumber, 'gender', saved.gender);
                              }} />
                            </div>
                          </div>
                          <div>
                            <label style={labelStyle}>Age *</label>
                            <input className={`bk-input${ageBad ? ' err' : ''}`} style={inp} type="number" placeholder="e.g. 28" min="1" max="100" value={p.age} onChange={e => updP(p.seatNumber, 'age', e.target.value)} />
                            {ageBad && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.red, marginTop: 5, fontWeight: 600 }}><AlertCircle size={11} /> Enter age between 1 and 100</div>}
                          </div>
                        </div>

                        <label style={labelStyle}>Gender *</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['Male', 'Female', 'Other'].map(g => {
                            const sel = p.gender === g;
                            const blocked = (lock === 'male' && g !== 'Male') || (lock === 'female' && g !== 'Female');
                            const col = g === 'Male' ? C.blue : g === 'Female' ? C.pink : C.orangeDk;
                            const bgSel = g === 'Male' ? C.blueBg : g === 'Female' ? C.pinkBg : C.tint;
                            return (
                              <button key={g} type="button" disabled={blocked} className="seg-btn" onClick={() => updP(p.seatNumber, 'gender', g)}
                                style={{ flex: '1 1 90px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 12px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: `1.5px solid ${sel ? col : C.line}`, background: sel ? bgSel : '#fff', color: sel ? col : C.muted, cursor: blocked ? 'not-allowed' : 'pointer', opacity: blocked ? .4 : 1 }}>
                                {g === 'Male' && <MaleIcon size={13} color={sel ? col : C.dim} />}
                                {g === 'Female' && <FemaleIcon size={13} color={sel ? col : C.dim} />}
                                {g}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* stub */}
                      <div className="bp-stub" style={{ background: complete ? C.greenBg : C.tint, borderRadius: '0 18px 18px 0', transition: 'background .3s' }}>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '1.6px', color: complete ? C.green : C.orangeDk }}>SEAT</div>
                          <div style={{ fontFamily: 'Syne', fontSize: 30, fontWeight: 800, color: complete ? C.green : C.orangeDk, lineHeight: 1.05, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                            {complete && <Check size={18} strokeWidth={3} />}{p.seatNumber}
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, marginTop: 4 }}>₹{p.price}</div>
                        </div>
                        <div className="bp-bars" style={{ width: '100%', height: 26, marginTop: 10, opacity: .55, background: `repeating-linear-gradient(90deg, ${C.ink} 0 2px, transparent 2px 4px, ${C.ink} 4px 5px, transparent 5px 8px, ${C.ink} 8px 11px, transparent 11px 13px)` }} />
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', gap: 10, marginTop: 8, position: 'relative', zIndex: 1 }}>
                  <button className="bk-btn ghost" onClick={() => setStep(1)}
                    style={{ background: '#fff', color: C.body, border: `1.5px solid ${C.line}`, borderRadius: 13, padding: '14px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button className="bk-btn primary" onClick={handleContinueToPayment} disabled={loading}
                    style={{ position: 'relative', overflow: 'hidden', flex: 1, background: loading ? '#cbd5e1' : GRAD, color: '#fff', border: 'none', borderRadius: 13, padding: '14px 24px', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {!loading && <span className="shine" />}
                    {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <>Continue to payment <ChevronRight size={15} /></>}
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════ STEP 3 · PAYMENT ═══════════ */}
            {step === 3 && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <h2 style={h2Style}><CreditCard size={20} color={C.orange} /> Review & pay</h2>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: C.green, background: C.greenBg, padding: '6px 12px', borderRadius: 99 }}>
                    <Lock size={12} /> Secure checkout
                  </span>
                </div>

                {/* e-ticket preview */}
                <TicketShell style={{ marginBottom: 24 }}
                  top={
                    <div style={{ padding: '20px 24px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 800, letterSpacing: '2px', opacity: .85 }}><Ticket size={12} /> E-TICKET PREVIEW</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{route.from}</div>
                          <div style={{ fontSize: 12.5, opacity: .9, marginTop: 3 }}>{route.departureTime}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: .9 }}>
                          <span style={{ width: 34, borderTop: '2px dashed rgba(255,255,255,.7)' }} /><Bus size={18} /><span style={{ width: 34, borderTop: '2px dashed rgba(255,255,255,.7)' }} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{route.to}</div>
                          <div style={{ fontSize: 12.5, opacity: .9, marginTop: 3 }}>{route.arrivalTime}</div>
                        </div>
                      </div>
                    </div>
                  }
                  bottom={
                    <div style={{ padding: '22px 24px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 11, color: C.dim, fontWeight: 800, letterSpacing: '1px', marginBottom: 8 }}>{fmtDate({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</div>
                        {passengers.map((p, i) => (
                          <div key={p.seatNumber} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i ? `1px dashed ${C.line}` : 'none' }}>
                            <span style={{ minWidth: 42, textAlign: 'center', background: C.tint, color: C.orangeDk, fontWeight: 800, fontSize: 12.5, padding: '4px 8px', borderRadius: 8 }}>{p.seatNumber}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{p.name}</div>
                              <div style={{ fontSize: 11.5, color: C.muted }}>{p.age} yrs · {p.gender}</div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800 }}>₹{p.price}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ padding: 8, border: `1px solid ${C.line}`, borderRadius: 12, background: '#fff' }}><QRArt seed={bookingId || routeId} /></div>
                        <div style={{ fontSize: 9.5, color: C.dim, marginTop: 6, fontWeight: 700, letterSpacing: '.6px' }}>ISSUED AFTER PAYMENT</div>
                      </div>
                    </div>
                  } />

                {/* pay box */}
                <div style={{ background: `linear-gradient(135deg, ${C.tint}, #fff8ee)`, border: `1px solid ${C.lineWarm}`, borderRadius: 20, padding: 26, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, background: 'radial-gradient(circle, rgba(249,115,22,.18), transparent 70%)', borderRadius: '50%' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, position: 'relative' }}>Amount payable</div>
                  <div style={{ fontFamily: 'Syne', fontSize: 40, fontWeight: 800, color: C.ink, margin: '2px 0 16px', position: 'relative' }}>₹{finalTotal}</div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 22, position: 'relative' }}>
                    {[['💳', 'Cards'], ['📱', 'UPI'], ['🏦', 'Net Banking'], ['👛', 'Wallets']].map(([e, l]) => (
                      <div key={l} style={{ fontSize: 12, color: C.body, display: 'flex', alignItems: 'center', gap: 5, background: '#fff', padding: '6px 12px', borderRadius: 99, border: `1px solid ${C.line}`, fontWeight: 600 }}>{e} {l}</div>
                    ))}
                  </div>

                  <button className="bk-btn primary" onClick={handleRazorpayPayment} disabled={payLoading}
                    style={{ position: 'relative', overflow: 'hidden', background: payLoading ? '#cbd5e1' : GRAD, color: '#fff', border: 'none', borderRadius: 15, padding: '18px 40px', fontSize: 16, fontWeight: 800, cursor: payLoading ? 'not-allowed' : 'pointer', fontFamily: 'Syne', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: payLoading ? 'none' : '0 16px 30px -16px rgba(234,88,12,.95)' }}>
                    {!payLoading && <span className="shine" />}
                    {payLoading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <><Lock size={17} /> Pay ₹{finalTotal} securely</>}
                  </button>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12, position: 'relative' }}>Payments are processed by Razorpay. Your card details never touch our servers.</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 18 }}>
                  {[[Shield, '100% Secure', '256-bit SSL'], [Zap, 'Instant', 'Confirmation'], [RotateCcw, 'Easy', 'Refunds']].map(([Icon, t, s]) => (
                    <div key={t} style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><Icon size={20} color={C.orange} /></div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{t}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ═══════════ SIDEBAR · FARE TICKET ═══════════ */}
          <div style={{ position: 'sticky', top: 160 }}>
            <TicketShell
              top={
                <div style={{ padding: '18px 22px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.8px', opacity: .85 }}><Ticket size={12} /> YOUR TRIP</div>
                  <div style={{ fontFamily: 'Syne', fontSize: 19, fontWeight: 800, marginTop: 7 }}>{route.from} → {route.to}</div>
                  <div style={{ fontSize: 12, opacity: .92, marginTop: 4 }}>{fmtDate({ day: 'numeric', month: 'short', year: 'numeric' })} · {route.departureTime} → {route.arrivalTime}</div>
                </div>
              }
              bottom={
                <div style={{ padding: '20px 22px 22px' }}>
                  <div style={{ fontSize: 11, color: C.dim, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Seats</div>
                  {selectedSeats.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>Nothing selected yet</div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {selectedSeats.map(s => <span key={s} style={{ background: C.tint, color: C.orangeDk, padding: '3px 11px', borderRadius: 99, fontSize: 12, fontWeight: 800, animation: 'popIn .25s' }}>{s}</span>)}
                    </div>
                  )}
                  <div style={{ borderTop: `1px dashed ${C.line}`, paddingTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.muted, marginBottom: 8 }}><span>Fare × {selectedSeats.length}</span><span style={{ color: C.ink, fontWeight: 600 }}>₹{total}</span></div>
                    {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.green, marginBottom: 8 }}><span>Discount (5%)</span><span style={{ fontWeight: 600 }}>-₹{discount}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.muted, marginBottom: 8 }}><span>GST (5%)</span><span style={{ color: C.ink, fontWeight: 600 }}>+₹{gst}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px dashed ${C.line}`, paddingTop: 14, marginTop: 10 }}>
                      <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 800 }}>Total</span>
                      <span style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: C.orangeDk }}><AnimatedNumber value={finalTotal} /></span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, background: C.greenBg, border: `1px solid ${C.greenLn}`, borderRadius: 12, padding: '11px 13px', fontSize: 12, color: '#15803d', lineHeight: 1.8, fontWeight: 600 }}>
                    ✓ Free cancellation 24h before travel<br />✓ Instant e-ticket on email<br />✓ Secured by Razorpay
                  </div>
                </div>
              } />
          </div>
        </div>
      </div>
    </div>
  );
}