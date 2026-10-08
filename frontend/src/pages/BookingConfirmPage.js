import React, {
  useEffect, useState, useRef, useCallback, useMemo,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  CheckCircle2, Ticket, Home, Printer, Share2, Bus, Copy, Check,
  Download, MapPin, Calendar, Users, Armchair, Clock, AlertCircle,
  QrCode, Sparkles, ChevronRight, RefreshCw, Sun, Moon,
  MessageCircle, FileText, ArrowRight, Shield, Phone, Mail,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   🎨 GLOBAL STYLES — Professional White Theme + Dark Mode
   ═══════════════════════════════════════════════════════════════════ */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');

  .bcp-root, .bcp-root * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  .bcp-root {
    --bg: #f8fafc;
    --bg-elev: #ffffff;
    --bg-subtle: #f1f5f9;
    --border: #e2e8f0;
    --border-strong: #cbd5e1;
    --text: #0f172a;
    --text-sec: #475569;
    --text-muted: #94a3b8;
    --brand: #ea580c;
    --brand-light: #fb923c;
    --brand-soft: #fff7ed;
    --success: #16a34a;
    --success-soft: #f0fdf4;
    --shadow-sm: 0 1px 2px rgba(15,23,42,0.04);
    --shadow: 0 4px 16px rgba(15,23,42,0.06);
    --shadow-lg: 0 12px 32px rgba(15,23,42,0.08);
    --shadow-xl: 0 24px 60px rgba(15,23,42,0.10);
    --radius: 16px;
    --radius-sm: 10px;
  }

  .bcp-root[data-theme="dark"] {
    --bg: #0a0f1e;
    --bg-elev: #131b31;
    --bg-subtle: #1a2540;
    --border: #26334d;
    --border-strong: #334155;
    --text: #f1f5f9;
    --text-sec: #cbd5e1;
    --text-muted: #64748b;
    --brand: #f97316;
    --brand-light: #fb923c;
    --brand-soft: rgba(249,115,22,0.1);
    --success: #22c55e;
    --success-soft: rgba(34,197,94,0.1);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow: 0 4px 16px rgba(0,0,0,0.3);
    --shadow-lg: 0 12px 32px rgba(0,0,0,0.4);
    --shadow-xl: 0 24px 60px rgba(0,0,0,0.5);
  }

  @keyframes bcpFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bcpPop {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); }
  }
  @keyframes bcpPulseRing {
    0%   { transform: scale(1); opacity: 0.5; }
    100% { transform: scale(1.7); opacity: 0; }
  }
  @keyframes bcpSpin { to { transform: rotate(360deg); } }
  @keyframes bcpConfetti {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(700px) rotate(540deg); opacity: 0; }
  }
  @keyframes bcpToastIn {
    from { opacity: 0; transform: translateY(-16px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bcpShine {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  @keyframes bcpShimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .bcp-a1 { animation: bcpFadeUp 0.5s cubic-bezier(.16,1,.3,1) both; }
  .bcp-a2 { animation: bcpFadeUp 0.5s 0.08s cubic-bezier(.16,1,.3,1) both; }
  .bcp-a3 { animation: bcpFadeUp 0.5s 0.16s cubic-bezier(.16,1,.3,1) both; }
  .bcp-a4 { animation: bcpFadeUp 0.5s 0.24s cubic-bezier(.16,1,.3,1) both; }
  .bcp-a5 { animation: bcpFadeUp 0.5s 0.32s cubic-bezier(.16,1,.3,1) both; }

  .bcp-btn {
    transition: all 0.18s cubic-bezier(.16,1,.3,1);
    position: relative; overflow: hidden;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.01em;
  }
  .bcp-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .bcp-btn:active:not(:disabled) { transform: translateY(0); }
  .bcp-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .bcp-btn-shine::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    transform: translateX(-100%);
  }
  .bcp-btn-shine:hover::after { animation: bcpShine 0.8s ease; }

  .bcp-skeleton {
    background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--border) 50%, var(--bg-subtle) 75%);
    background-size: 200% 100%;
    animation: bcpShimmer 1.5s ease infinite;
    border-radius: 8px;
  }

  .bcp-toast {
    position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
    z-index: 10000; padding: 12px 20px; border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 14px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 12px 40px rgba(15,23,42,0.15);
    animation: bcpToastIn 0.3s cubic-bezier(.16,1,.3,1);
    backdrop-filter: blur(16px);
  }

  .bcp-copy {
    transition: all 0.18s ease;
    background: transparent;
    border: 1px solid var(--border);
  }
  .bcp-copy:hover {
    background: var(--brand-soft) !important;
    border-color: var(--brand) !important;
    color: var(--brand) !important;
  }
  .bcp-copy:active { transform: scale(0.92); }

  .bcp-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0; border-bottom: 1px solid var(--border);
    gap: 16px;
  }
  .bcp-row:last-of-type { border-bottom: none; }

  .bcp-ticket {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition: box-shadow 0.3s ease;
  }
  .bcp-ticket:hover { box-shadow: var(--shadow-xl); }

  .bcp-tool-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px; border-radius: 10px;
    font-size: 13.5px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1px solid var(--border);
    background: var(--bg-elev);
    color: var(--text);
    cursor: pointer;
    transition: all 0.18s cubic-bezier(.16,1,.3,1);
    white-space: nowrap;
  }
  .bcp-tool-btn:hover:not(:disabled) {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
  .bcp-tool-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .bcp-tool-primary {
    background: linear-gradient(135deg, var(--brand) 0%, var(--brand-light) 100%);
    color: #fff !important;
    border: none !important;
    box-shadow: 0 4px 14px rgba(234,88,12,0.28);
  }
  .bcp-tool-primary:hover:not(:disabled) {
    box-shadow: 0 8px 22px rgba(234,88,12,0.4);
  }

  .bcp-print-area {
    background: var(--bg-elev);
  }

  @media print {
    @page { size: A4; margin: 12mm; }
    body, html { background: #fff !important; }
    nav, header, .no-print { display: none !important; }
    .bcp-root {
      padding: 0 !important; background: #fff !important;
      min-height: auto !important;
    }
    .bcp-ticket {
      box-shadow: none !important;
      border: 1.5px solid #e2e8f0 !important;
      page-break-inside: avoid;
    }
    .bcp-print-only { display: block !important; }
  }

  @media (max-width: 640px) {
    .bcp-container { padding: 80px 14px 40px !important; }
    .bcp-route-name { font-size: 17px !important; }
    .bcp-amount { font-size: 24px !important; }
    .bcp-tools button { flex: 1 1 calc(50% - 6px); justify-content: center; }
    .bcp-qr-block { display: none !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   🎨 QR CODE — Real scannable QR
   ═══════════════════════════════════════════════════════════════════ */
function QRCodeBlock({ value, size = 128 }) {
  const canvasRef = useRef(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    }).catch(() => setErr(true));
  }, [value, size]);

  if (err) return null;

  return (
    <div style={{
      padding: 10,
      background: '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: 14,
      boxShadow: 'var(--shadow-sm)',
      display: 'inline-flex',
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 6 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   🔔 TOAST
   ═══════════════════════════════════════════════════════════════════ */
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  const styles = {
    success: { bg: 'rgba(240,253,244,0.95)', border: '#86efac', color: '#15803d', Icon: CheckCircle2 },
    error:   { bg: 'rgba(254,242,242,0.95)', border: '#fca5a5', color: '#b91c1c', Icon: AlertCircle },
    info:    { bg: 'rgba(239,246,255,0.95)', border: '#93c5fd', color: '#1d4ed8', Icon: Sparkles },
  }[type];
  const { Icon } = styles;

  return (
    <div className="bcp-toast" style={{
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      color: styles.color,
    }} role="status">
      <Icon size={16} strokeWidth={2.5} />
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   🎊 CONFETTI — Subtle professional
   ═══════════════════════════════════════════════════════════════════ */
function Confetti({ active }) {
  const pieces = useMemo(() => {
    if (!active) return [];
    const colors = ['#ea580c', '#fb923c', '#16a34a', '#3b82f6', '#eab308', '#f97316'];
    return Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.4 + Math.random() * 1.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 6,
      radius: Math.random() > 0.5 ? '50%' : '2px',
    }));
  }, [active]);

  if (!active) return null;
  return (
    <>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: p.left + '%', top: -20,
          width: p.size, height: p.size * 1.4,
          background: p.color, borderRadius: p.radius,
          pointerEvents: 'none', zIndex: 9999,
          animation: `bcpConfetti ${p.duration}s ${p.delay}s linear forwards`,
        }} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ⏱️ COUNTDOWN HOOK
   ═══════════════════════════════════════════════════════════════════ */
function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return { expired: true };
  return {
    expired: false,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   💀 SKELETON
   ═══════════════════════════════════════════════════════════════════ */
function Skeleton() {
  return (
    <div style={{ maxWidth: 620, width: '100%', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="bcp-skeleton" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px' }} />
        <div className="bcp-skeleton" style={{ width: 220, height: 26, margin: '0 auto 10px' }} />
        <div className="bcp-skeleton" style={{ width: 280, height: 14, margin: '0 auto' }} />
      </div>
      <div className="bcp-skeleton" style={{ height: 460, borderRadius: 20 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ⚠️ ERROR STATE
   ═══════════════════════════════════════════════════════════════════ */
function ErrorState({ onRetry, onHome }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 420 }}>
      <div style={{
        width: 84, height: 84, borderRadius: '50%',
        background: '#fef2f2', border: '1px solid #fecaca',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <AlertCircle size={40} color="#dc2626" strokeWidth={2} />
      </div>
      <h2 style={{
        fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22,
        color: 'var(--text)', fontWeight: 700, marginBottom: 10,
        letterSpacing: '-0.02em',
      }}>
        Ticket Not Found
      </h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 26, lineHeight: 1.6 }}>
        We couldn't load this booking. The link may have expired or the ticket was cancelled.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onRetry} className="bcp-btn bcp-tool-primary" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 22px', borderRadius: 10, fontSize: 14,
          fontWeight: 700, cursor: 'pointer', border: 'none', color: '#fff',
        }}>
          <RefreshCw size={15} /> Try Again
        </button>
        <button onClick={onHome} className="bcp-tool-btn" style={{ padding: '12px 22px' }}>
          <Home size={15} /> Go Home
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   🎫 MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function BookingConfirmPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketRef = useRef(null);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [busy, setBusy] = useState(null); // 'pdf' | 'print' | 'share' | null
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('bcp-theme') || 'light'; }
    catch { return 'light'; }
  });

  const countdown = useCountdown(booking?.travelDate);

  /* Inject styles */
  useEffect(() => {
    const id = 'bcp-global-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = GLOBAL_STYLES;
      document.head.appendChild(s);
    }
  }, []);

  /* Persist theme */
  useEffect(() => {
    try { localStorage.setItem('bcp-theme', theme); } catch {}
  }, [theme]);

  /* Fetch booking */
  const fetchBooking = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res = await bookingAPI.getById(id);
      const b = res?.data?.booking;
      if (!b) throw new Error('Not found');
      setBooking(b);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3200);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  /* Derived */
  const travelDateStr = booking
    ? new Date(booking.travelDate).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';
  const seats = booking?.passengers?.map(p => p.seatNumber).join(', ') || '—';

  /* Notify */
  const notify = (message, type = 'success') => setToast({ message, type });

  /* Copy */
  const copy = async (text, field) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      setCopied(field);
      notify('Copied to clipboard', 'success');
      setTimeout(() => setCopied(null), 1800);
    } catch { notify('Copy failed', 'error'); }
  };

  /* Share — WhatsApp + native */
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
`🚌 *BusGo E-Ticket*

*Booking ID:* ${booking.bookingId}
*PNR:* ${booking.pnr}
*Route:* ${booking.route?.from} → ${booking.route?.to}
*Date:* ${travelDateStr}
*Passengers:* ${booking.passengers?.length}
*Seats:* ${seats}
*Amount:* ₹${booking.finalAmount}
*Status:* ${booking.status?.toUpperCase()}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
    notify('Opening WhatsApp...', 'info');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'BusGo E-Ticket',
      text: `Booking ${booking.bookingId} • ${booking.route?.from} → ${booking.route?.to}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        notify('Shared successfully', 'success');
      } catch { /* cancelled */ }
    } else {
      copy(window.location.href, 'share');
    }
  };

  /* Print */
  const handlePrint = () => {
    setBusy('print');
    notify('Preparing print...', 'info');
    setTimeout(() => {
      window.print();
      setBusy(null);
    }, 300);
  };

  /* PDF Download */
  const handlePDF = async () => {
    if (!ticketRef.current) return;
    setBusy('pdf');
    notify('Generating PDF...', 'info');
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      const y = Math.max(10, (pageH - imgH) / 2);

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageW, pageH, 'F');
      pdf.addImage(imgData, 'PNG', 10, y, imgW, imgH);
      pdf.save(`BusGo-Ticket-${booking.bookingId}.pdf`);
      notify('PDF downloaded', 'success');
    } catch { notify('PDF generation failed', 'error'); }
    finally { setBusy(null); }
  };

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div
      className="bcp-root bcp-container"
      data-theme={theme}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        backgroundImage: `
          radial-gradient(circle at 0% 0%, rgba(234,88,12,0.05), transparent 40%),
          radial-gradient(circle at 100% 100%, rgba(22,163,74,0.04), transparent 40%)
        `,
        padding: '100px 20px 60px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        color: 'var(--text)',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      <Confetti active={showConfetti} />
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        aria-label="Toggle theme"
        className="no-print bcp-btn"
        style={{
          position: 'fixed', top: 24, right: 24, zIndex: 100,
          width: 42, height: 42, borderRadius: 12,
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
        }}
      >
        {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
      </button>

      <div style={{ maxWidth: 620, width: '100%' }}>
        {loading && <Skeleton />}
        {!loading && error && <ErrorState onRetry={fetchBooking} onHome={() => navigate('/')} />}

        {!loading && !error && booking && (
          <>
            {/* ═══ Header ═══ */}
            <div style={{ textAlign: 'center', marginBottom: 28 }} className="bcp-a1 no-print">
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--success-soft)',
                border: '1.5px solid #86efac',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px', position: 'relative',
                animation: 'bcpPop 0.5s cubic-bezier(.16,1,.3,1)',
              }}>
                <div style={{
                  position: 'absolute', inset: -4, borderRadius: '50%',
                  border: '1.5px solid #86efac',
                  animation: 'bcpPulseRing 2.2s ease-out infinite',
                }} />
                <CheckCircle2 size={38} color="#16a34a" strokeWidth={2.2} />
              </div>
              <h1 style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 28, fontWeight: 800,
                color: 'var(--text)', marginBottom: 8,
                letterSpacing: '-0.03em', lineHeight: 1.15,
              }}>
                Booking Confirmed
              </h1>
              <p style={{ color: 'var(--text-sec)', fontSize: 14.5, lineHeight: 1.5 }}>
                Your e-ticket is ready. Safe travels! 🎉
              </p>
            </div>

            {/* ═══ Ticket ═══ */}
            <div ref={ticketRef} className="bcp-ticket bcp-a2" style={{ position: 'relative' }}>

              {/* Top stripe */}
              <div style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
                padding: '20px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative pattern */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.15,
                  backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }} />
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <Bus size={18} color="#fff" strokeWidth={2.4} />
                  </div>
                  BusGo
                  <span style={{ fontWeight: 500, opacity: 0.85, fontSize: 13 }}>
                    E-Ticket
                  </span>
                </div>
                <span style={{
                  background: 'rgba(255,255,255,0.95)',
                  color: '#c2410c',
                  fontSize: 11, fontWeight: 800,
                  padding: '5px 12px', borderRadius: 20,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {booking.status?.toUpperCase()}
                </span>
              </div>

              {/* Route */}
              <div className="bcp-print-area" style={{ padding: '28px 28px 20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 10.5, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: 1,
                      fontWeight: 700, marginBottom: 6,
                    }}>
                      From
                    </div>
                    <div className="bcp-route-name" style={{
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: 22, fontWeight: 800,
                      color: 'var(--text)', letterSpacing: '-0.03em',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {booking.route?.from}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', color: 'var(--brand)',
                    padding: '0 4px',
                  }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: '50%',
                      background: 'var(--brand-soft)',
                      border: '1px solid rgba(234,88,12,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ArrowRight size={20} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div style={{ minWidth: 0, textAlign: 'right' }}>
                    <div style={{
                      fontSize: 10.5, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: 1,
                      fontWeight: 700, marginBottom: 6,
                    }}>
                      To
                    </div>
                    <div className="bcp-route-name" style={{
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: 22, fontWeight: 800,
                      color: 'var(--text)', letterSpacing: '-0.03em',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {booking.route?.to}
                    </div>
                  </div>
                </div>

                {/* Perforation divider */}
                <div style={{
                  position: 'relative', margin: '24px -28px 20px',
                  display: 'flex', alignItems: 'center',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--bg)', marginLeft: -11,
                    border: '1px solid var(--border)',
                  }} />
                  <div style={{
                    flex: 1,
                    borderTop: '1.5px dashed var(--border)',
                    margin: '0 2px',
                  }} />
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--bg)', marginRight: -11,
                    border: '1px solid var(--border)',
                  }} />
                </div>

                {/* QR + Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 24,
                  alignItems: 'flex-start',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <Row
                      icon={<Ticket size={13} />}
                      label="Booking ID"
                      value={booking.bookingId}
                      mono
                      copied={copied === 'bookingId'}
                      onCopy={() => copy(booking.bookingId, 'bookingId')}
                    />
                    <Row
                      icon={<QrCode size={13} />}
                      label="PNR"
                      value={booking.pnr}
                      mono
                      copied={copied === 'pnr'}
                      onCopy={() => copy(booking.pnr, 'pnr')}
                    />
                    <Row
                      icon={<Calendar size={13} />}
                      label="Travel Date"
                      value={travelDateStr}
                    />
                    <Row
                      icon={<Users size={13} />}
                      label="Passengers"
                      value={`${booking.passengers?.length || 0} ${booking.passengers?.length === 1 ? 'person' : 'people'}`}
                    />
                    <Row
                      icon={<Armchair size={13} />}
                      label="Seats"
                      value={seats}
                    />
                  </div>

                  <div className="bcp-qr-block" style={{ textAlign: 'center' }}>
                    <QRCodeBlock
                      value={`BUSGO|${booking.bookingId}|${booking.pnr}`}
                      size={124}
                    />
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)',
                      marginTop: 10, letterSpacing: 0.8,
                      fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      Scan at Boarding
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer — Amount + Countdown */}
              <div style={{
                padding: '20px 28px 24px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}>
                <div>
                  <div style={{
                    fontSize: 10.5, color: 'var(--text-muted)',
                    fontWeight: 700, letterSpacing: 1,
                    textTransform: 'uppercase', marginBottom: 4,
                  }}>
                    Total Paid
                  </div>
                  <div className="bcp-amount" style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    color: 'var(--brand)', fontSize: 28,
                    fontWeight: 800, letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}>
                    ₹{booking.finalAmount}
                  </div>
                </div>

                {countdown && !countdown.expired && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 10.5, color: 'var(--text-muted)',
                      fontWeight: 700, letterSpacing: 1,
                      textTransform: 'uppercase', marginBottom: 6,
                      display: 'flex', alignItems: 'center',
                      gap: 5, justifyContent: 'flex-end',
                    }}>
                      <Clock size={11} strokeWidth={2.5} />
                      Departs In
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <CD value={countdown.days} label="D" />
                      <CD value={countdown.hours} label="H" />
                      <CD value={countdown.minutes} label="M" />
                      <CD value={countdown.seconds} label="S" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Info banner ═══ */}
            <div className="bcp-a3 no-print" style={{
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '14px 18px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--brand-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Mail size={17} color="var(--brand)" strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 700,
                  color: 'var(--text)', marginBottom: 2,
                }}>
                  Confirmation sent to your email
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-sec)' }}>
                  Keep this ticket handy during boarding
                </div>
              </div>
              <Shield size={16} color="var(--success)" strokeWidth={2.4} />
            </div>

            {/* ═══ Actions ═══ */}
            <div className="bcp-tools bcp-a4 no-print" style={{
              display: 'flex', gap: 10, flexWrap: 'wrap',
            }}>
              <button
                onClick={handlePDF}
                disabled={busy === 'pdf'}
                className="bcp-tool-btn bcp-tool-primary bcp-btn bcp-btn-shine"
                style={{ flex: '1 1 auto' }}
              >
                {busy === 'pdf' ? (
                  <Spinner size={15} />
                ) : (
                  <FileText size={15} strokeWidth={2.4} />
                )}
                Download PDF
              </button>

              <button
                onClick={handleWhatsApp}
                className="bcp-tool-btn bcp-btn"
                style={{ flex: '1 1 auto' }}
              >
                <MessageCircle size={15} color="#25D366" strokeWidth={2.4} />
                WhatsApp
              </button>

              <button onClick={handlePrint} className="bcp-tool-btn bcp-btn">
                <Printer size={15} strokeWidth={2.4} />
                Print
              </button>

              <button onClick={handleShare} className="bcp-tool-btn bcp-btn">
                <Share2 size={15} strokeWidth={2.4} />
                Share
              </button>

              <button
                onClick={() => navigate('/my-bookings')}
                className="bcp-tool-btn bcp-btn"
                style={{ flex: '1 1 auto' }}
              >
                <Ticket size={15} strokeWidth={2.4} />
                My Bookings
              </button>

              <button
                onClick={() => navigate('/')}
                className="bcp-tool-btn bcp-btn"
                style={{ color: 'var(--text-sec)' }}
              >
                <Home size={15} strokeWidth={2.4} />
                Home
              </button>
            </div>

            {/* Footer hint */}
            <div className="bcp-a5 no-print" style={{
              textAlign: 'center', marginTop: 24,
              fontSize: 12, color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: 'Inter, sans-serif',
            }}>
              <Sparkles size={11} />
              Powered by BusGo • Safe & Secure Booking
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   🧩 SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */
function Row({ icon, label, value, onCopy, copied, mono }) {
  return (
    <div className="bcp-row">
      <span style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
        letterSpacing: 0.8, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
      }}>
        {icon}
        {label}
      </span>
      <span style={{
        fontSize: 13.5, fontWeight: 600, color: 'var(--text)',
        display: 'flex', alignItems: 'center', gap: 8,
        minWidth: 0, overflow: 'hidden',
        fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
        letterSpacing: mono ? '-0.02em' : 'normal',
      }}>
        <span style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            aria-label={`Copy ${label}`}
            className="bcp-copy"
            style={{
              borderRadius: 6, padding: 5,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              borderColor: copied ? 'var(--success)' : 'var(--border)',
              flexShrink: 0,
            }}
          >
            {copied ? <Check size={11} strokeWidth={3} /> : <Copy size={11} strokeWidth={2.4} />}
          </button>
        )}
      </span>
    </div>
  );
}

function CD({ value, label }) {
  return (
    <div style={{
      background: 'var(--bg-elev)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '6px 8px',
      minWidth: 36,
      textAlign: 'center',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700, fontSize: 13.5,
        color: 'var(--text)', lineHeight: 1,
        letterSpacing: '-0.03em',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{
        fontSize: 9, color: 'var(--text-muted)',
        fontWeight: 700, letterSpacing: 0.5,
        marginTop: 3,
      }}>
        {label}
      </div>
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'bcpSpin 0.7s linear infinite',
    }} />
  );
}