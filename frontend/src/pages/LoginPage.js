import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bus, Eye, EyeOff, User, Lock, ShieldCheck, Sparkles, Clock3, Users,
  ArrowRight, Smartphone, AlertTriangle, Check, Star, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* =========================================================================
   CONSTANTS
   ========================================================================= */

const TESTIMONIALS = [
  { name: 'Priya S.', route: 'Chennai → Madurai', quote: 'Booked in under a minute, bus was spotless and right on time.', rating: 5 },
  { name: 'Arun K.', route: 'Coimbatore → Chennai', quote: 'Live tracking saved me so much waiting time at the stop.', rating: 5 },
  { name: 'Divya R.', route: 'Chennai → Trichy', quote: 'Best fares I have found for overnight Volvo buses.', rating: 4 },
  { name: 'Karthik M.', route: 'Madurai → Chennai', quote: 'Clean seats, on-time driver, and easy refund when my plan changed.', rating: 5 },
];

const STATS = [
  { key: 'routes', label: 'Routes', target: 500, suffix: '+' },
  { key: 'cities', label: 'Cities', target: 120, suffix: '+' },
  { key: 'travelers', label: 'Happy Travelers', target: 1000000, suffix: '+' },
];

const FEATURE_BADGES = [
  { icon: ShieldCheck, title: 'Secure Booking', sub: 'Safe & encrypted' },
  { icon: Sparkles, title: 'Premium Comfort', sub: 'Top-rated buses' },
  { icon: Clock3, title: 'On Time Always', sub: 'Live tracking' },
  { icon: Users, title: 'Trusted by 1M+', sub: 'Happy travelers' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

/* =========================================================================
   HOOKS
   ========================================================================= */

/** Animates a number from 0 up to `target` over `durationMs`, using rAF. */
function useCountUp(target, durationMs = 1400, startWhen = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!startWhen) return;
    let startTs = null;
    let raf;
    const step = ts => {
      if (startTs === null) startTs = ts;
      const progress = Math.min((ts - startTs) / durationMs, 1);
      // ease-out cubic for a nicer deceleration near the end
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [target, durationMs, startWhen]);
  return value;
}

/** Cycles through an array's indices every `intervalMs`. */
function useCycle(length, intervalMs = 4200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (length <= 1) return;
    const id = setInterval(() => setIndex(i => (i + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);
  return index;
}

/* =========================================================================
   SMALL PRESENTATIONAL COMPONENTS
   ========================================================================= */

function formatStat(n) {
  if (n >= 1000000) {
    const millions = n / 1000000;
    return (Number.isInteger(millions) ? millions : millions.toFixed(1)) + 'M';
  }
  if (n >= 1000) return Math.floor(n / 1000) + 'K';
  return String(n);
}

function StatCounter({ target, label, suffix }) {
  const value = useCountUp(target);
  return (
    <div className="lt-stat">
      <span className="lt-stat-num">{formatStat(value)}{suffix}</span>
      <span className="lt-stat-label">{label}</span>
    </div>
  );
}

function FeatureBadge({ icon: Icon, title, sub }) {
  return (
    <div className="lt-badge">
      <div className="lt-badge-icon"><Icon size={13} /></div>
      <b>{title}</b>
      <span>{sub}</span>
    </div>
  );
}

function StarRow({ count }) {
  return (
    <div className="lt-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} fill={i < count ? '#fbbf24' : 'none'} color={i < count ? '#fbbf24' : '#cbd5e1'} />
      ))}
    </div>
  );
}

function TestimonialRotator() {
  const idx = useCycle(TESTIMONIALS.length, 4200);
  const t = TESTIMONIALS[idx];
  return (
    <div className="lt-testimonial" key={idx}>
      <StarRow count={t.rating} />
      <p className="lt-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
      <div className="lt-testimonial-foot">
        <span className="lt-testimonial-name">{t.name}</span>
        <span className="lt-testimonial-route"><MapPin size={10} /> {t.route}</span>
      </div>
      <div className="lt-testimonial-dots">
        {TESTIMONIALS.map((_, i) => (
          <span key={i} className={`lt-dot ${i === idx ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

function SocialButton({ label, onClick, children }) {
  return (
    <button type="button" className="lt-social" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function FormField({
  label, icon: Icon, type = 'text', placeholder, value, onChange,
  name, focused, onFocus, onBlur, error, rightSlot, onKeyUp,
}) {
  return (
    <div className="lt-field-group">
      <label className="lt-field-label">{label}</label>
      <div className={`lt-field ${focused ? 'on' : ''} ${error ? 'err' : ''}`}>
        <Icon size={15} className="lt-icon" />
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          autoComplete={name === 'password' ? 'current-password' : 'username'}
        />
        {rightSlot}
      </div>
      {error && (
        <p className="lt-field-error"><AlertTriangle size={11} /> {error}</p>
      )}
    </div>
  );
}

function RememberMeCheckbox({ checked, onChange }) {
  return (
    <label className="lt-remember">
      <span
        className={`lt-checkbox ${checked ? 'checked' : ''}`}
        onClick={() => onChange(!checked)}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}
      >
        {checked && <Check size={11} color="#fff" strokeWidth={3} />}
      </span>
      Remember me for 30 days
    </label>
  );
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [remember, setRemember] = useState(true);
  const [capsOn, setCapsOn] = useState(false);
  const submitAttempted = useRef(false);

  const birds = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i, top: 8 + Math.random() * 18, delay: i * 1.4, dur: 9 + Math.random() * 4,
  })), []);

  /* ---- validation ---- */
  const validate = (values = form) => {
    const errs = {};
    const emailVal = values.email.trim();
    if (!emailVal) {
      errs.email = 'Email or phone number is required';
    } else if (!EMAIL_RE.test(emailVal) && !PHONE_RE.test(emailVal)) {
      errs.email = 'Enter a valid email or 10-digit phone number';
    }
    if (!values.password) {
      errs.password = 'Password is required';
    } else if (values.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  };

  // live re-validate only after the user has already attempted a submit once,
  // so we don't nag them before they've even finished typing
  useEffect(() => {
    if (submitAttempted.current) setErrors(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const updateField = (name, value) => setForm(f => ({ ...f, [name]: value }));

  const handlePasswordKeyUp = e => {
    if (e.getModifierState) setCapsOn(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    submitAttempted.current = true;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (remember) {
        try { localStorage.setItem('busgo_remember_email', form.email); } catch (_) { /* ignore storage errors */ }
      }
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const social = provider => toast(`${provider} login coming soon`, { icon: '🚧' });
  const continueAsGuest = () => {
    toast('Browsing as guest — sign in anytime to book', { icon: '👋' });
    navigate('/');
  };

  return (
    <div className="lt-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=Caveat:wght@600&display=swap');

        * { box-sizing: border-box; }

        .lt-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #eef2f9, #f7f4ee); padding: 24px; font-family: 'Inter', sans-serif;
        }

        .lt-card {
          width: 100%; max-width: 1040px; min-height: 620px; display: flex;
          border-radius: 26px; overflow: hidden; box-shadow: 0 40px 100px -30px rgba(15,23,42,0.28);
          opacity: 0; animation: ltIn .6s cubic-bezier(.2,.8,.2,1) forwards;
        }
        @keyframes ltIn { from { opacity:0; transform: translateY(20px) scale(.98); } to { opacity:1; transform: translateY(0) scale(1); } }

        /* ---------- LEFT: photo ---------- */
        .lt-left {
          flex: 1.25; position: relative; min-width: 0; overflow: hidden;
          background:
            linear-gradient(180deg, rgba(6,10,22,0.18) 0%, rgba(6,10,22,0.15) 38%, rgba(6,10,22,0.72) 100%),
            url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1400&q=70') center/cover;
          display: flex; flex-direction: column; justify-content: space-between; padding: 30px 36px 26px;
        }

        .lt-brand { display: flex; align-items: center; gap: 9px; z-index: 2; opacity:0; animation: ltRise .5s ease .05s forwards; }
        .lt-brand-icon { width: 34px; height: 34px; border-radius: 9px; background: #0f172a; display: flex; align-items: center; justify-content: center; }
        .lt-brand-text { font-family: 'Syne'; font-weight: 800; font-size: 17px; color: #fff; }
        .lt-brand-text span { color: #fb923c; }

        .lt-bird { position: absolute; color: rgba(255,255,255,0.85); animation: fly linear infinite; z-index: 2; }
        @keyframes fly { from { left: -6%; opacity: 0; } 8% { opacity: .9; } 92% { opacity: .9; } to { left: 108%; opacity: 0; } }

        .lt-sticker {
          position: absolute; top: 24px; right: 30px; z-index: 2;
          background: rgba(255,255,255,0.92); border-radius: 14px; padding: 8px 14px;
          transform: rotate(-6deg); box-shadow: 0 10px 22px rgba(0,0,0,0.18);
          font-family: 'Caveat'; font-weight: 600; font-size: 15px; color: #0f172a;
          display: flex; align-items: center; gap: 5px;
          animation: stickerFloat 4s ease-in-out infinite, ltPop .5s cubic-bezier(.34,1.56,.64,1) .2s backwards;
        }
        @keyframes stickerFloat { 0%,100% { transform: rotate(-6deg) translateY(0); } 50% { transform: rotate(-3deg) translateY(-5px); } }
        @keyframes ltPop { from { opacity:0; transform: scale(.6) rotate(-6deg); } to { opacity:1; transform: scale(1) rotate(-6deg); } }

        .lt-mid { z-index: 2; opacity:0; animation: ltRise .5s ease .15s forwards; }
        .lt-headline { font-family: 'Syne'; font-weight: 800; color: #fff; font-size: 33px; line-height: 1.15; margin: 0 0 10px; }
        .lt-headline .accent { color: #fb923c; }
        .lt-sub { color: rgba(241,245,249,0.9); font-size: 13.5px; max-width: 340px; line-height: 1.6; margin-bottom: 18px; }

        @keyframes ltRise { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }

        /* animated stat counters */
        .lt-stats { display: flex; gap: 22px; z-index: 2; margin-bottom: 18px; opacity:0; animation: ltRise .5s ease .22s forwards; }
        .lt-stat { display: flex; flex-direction: column; }
        .lt-stat-num { font-family: 'Syne'; font-weight: 800; font-size: 21px; color: #fff; line-height: 1; }
        .lt-stat-label { font-size: 10px; color: rgba(226,232,240,0.75); margin-top: 3px; }

        /* rotating testimonial */
        .lt-testimonial {
          z-index: 2; background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2); border-radius: 14px; padding: 13px 15px;
          margin-bottom: 16px; max-width: 400px;
          animation: fadeSlide .45s ease;
        }
        @keyframes fadeSlide { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
        .lt-stars { display: flex; gap: 2px; margin-bottom: 6px; }
        .lt-testimonial-quote { font-size: 12px; color: #f1f5f9; line-height: 1.5; margin: 0 0 8px; font-style: italic; }
        .lt-testimonial-foot { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .lt-testimonial-name { font-size: 11px; font-weight: 700; color: #fff; }
        .lt-testimonial-route { font-size: 9.5px; color: rgba(226,232,240,0.75); display: flex; align-items: center; gap: 3px; }
        .lt-testimonial-dots { display: flex; gap: 5px; }
        .lt-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.35); transition: background .2s, width .2s; }
        .lt-dot.active { background: #fb923c; width: 14px; border-radius: 3px; }

        .lt-badges { display: flex; gap: 10px; z-index: 2; opacity:0; animation: ltRise .5s ease .3s forwards; flex-wrap: wrap; }
        .lt-badge {
          flex: 1; min-width: 94px; display: flex; flex-direction: column; align-items: flex-start; gap: 7px;
          background: rgba(255,255,255,0.14); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.28); border-radius: 12px; padding: 10px 11px;
          transition: transform .2s, background .2s;
        }
        .lt-badge:hover { transform: translateY(-3px); background: rgba(255,255,255,0.22); }
        .lt-badge-icon { width: 26px; height: 26px; border-radius: 50%; background: rgba(251,146,60,0.9); display: flex; align-items: center; justify-content: center; color: #fff; }
        .lt-badge b { font-size: 10.5px; color: #fff; font-weight: 700; }
        .lt-badge span { font-size: 9px; color: rgba(255,255,255,0.8); }

        /* ---------- RIGHT: white form ---------- */
        .lt-right { width: 410px; flex-shrink: 0; background: #fff; padding: 36px 36px 26px; display: flex; flex-direction: column; overflow-y: auto; }

        .lt-toprow { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; opacity:0; animation: ltRise .5s ease .1s forwards; }
        .lt-welcome { display: flex; align-items: center; gap: 8px; }
        .lt-welcome-icon { width: 30px; height: 30px; border-radius: 50%; background: #fff7ed; display: flex; align-items: center; justify-content: center; }
        .lt-welcome span { font-size: 11px; color: #94a3b8; font-weight: 600; }
        .lt-new { font-size: 11px; color: #64748b; }
        .lt-new a { color: #f97316; font-weight: 700; text-decoration: none; }

        .lt-title { font-family: 'Syne'; font-weight: 800; font-size: 23px; color: #0f172a; margin: 0 0 4px; opacity:0; animation: ltRise .5s ease .16s forwards; }
        .lt-title .accent { color: #f97316; }
        .lt-titlesub { font-size: 12.5px; color: #94a3b8; margin-bottom: 20px; opacity:0; animation: ltRise .5s ease .22s forwards; }

        .lt-form { opacity:0; animation: ltRise .5s ease .28s forwards; }
        .lt-field-group { margin-bottom: 14px; }
        .lt-field-label { font-size: 11px; font-weight: 700; color: #475569; margin: 0 0 7px; display: block; }
        .lt-field { position: relative; display: flex; align-items: center; }
        .lt-field svg.lt-icon { position: absolute; left: 14px; color: #94a3b8; }
        .lt-field input {
          width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px;
          padding: 12px 42px 12px 42px; font-size: 13.5px; color: #0f172a; outline: none;
          font-family: 'Inter', sans-serif; transition: border-color .18s, background .18s;
        }
        .lt-field.on input { border-color: #f97316; background: #fff; box-shadow: 0 0 0 4px rgba(249,115,22,0.1); }
        .lt-field.err input { border-color: #ef4444; }
        .lt-field-error { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #ef4444; margin: 6px 0 0; }
        .lt-eye { position: absolute; right: 12px; background: none; border: none; cursor: pointer; display: flex; padding: 4px; }

        .lt-caps-warning {
          display: flex; align-items: center; gap: 6px; font-size: 11px; color: #b45309;
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 6px 10px; margin: 8px 0 0;
        }

        .lt-options-row { display: flex; justify-content: space-between; align-items: center; margin: 14px 0 18px; }
        .lt-remember { display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: #475569; cursor: pointer; user-select: none; }
        .lt-checkbox {
          width: 16px; height: 16px; border-radius: 5px; border: 1.5px solid #cbd5e1;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: background .15s, border-color .15s;
        }
        .lt-checkbox.checked { background: #f97316; border-color: #f97316; }
        .lt-forgot { font-size: 11.5px; color: #f97316; text-decoration: none; font-weight: 700; }

        .lt-submit {
          width: 100%; border: none; border-radius: 12px; padding: 13px; cursor: pointer;
          background: linear-gradient(135deg, #fb923c, #ea580c); background-size: 200% 200%;
          color: #fff; font-family: 'Syne'; font-weight: 700; font-size: 14px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 14px 26px -8px rgba(234,88,12,0.5);
          transition: transform .15s, box-shadow .15s, background-position .4s, opacity .15s;
        }
        .lt-submit:hover:not(:disabled) { transform: translateY(-2px); background-position: 100% 0; box-shadow: 0 18px 32px -8px rgba(234,88,12,0.6); }
        .lt-submit:disabled { opacity: .6; cursor: not-allowed; }
        .lt-submit svg { transition: transform .2s; }
        .lt-submit:hover:not(:disabled) svg { transform: translateX(3px); }

        .lt-guest {
          width: 100%; background: none; border: 1.5px dashed #e2e8f0; border-radius: 12px; padding: 11px;
          font-size: 12.5px; font-weight: 600; color: #64748b; cursor: pointer; margin-top: 10px;
          transition: border-color .15s, color .15s;
        }
        .lt-guest:hover { border-color: #f97316; color: #f97316; }

        .lt-divider { display: flex; align-items: center; gap: 10px; margin: 20px 0 16px; }
        .lt-divider::before, .lt-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
        .lt-divider span { font-size: 11px; color: #94a3b8; white-space: nowrap; }

        .lt-social-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 18px; }
        .lt-social {
          width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
          background: #f8fafc; border: 1.5px solid #e2e8f0; cursor: pointer;
          transition: transform .15s, border-color .15s, background .15s;
        }
        .lt-social:hover { transform: translateY(-2px); border-color: #cbd5e1; background: #fff; }

        .lt-signup { text-align: center; font-size: 12.5px; color: #94a3b8; margin-top: auto; padding-top: 8px; }
        .lt-signup a { color: #f97316; font-weight: 700; text-decoration: none; }

        @media (prefers-reduced-motion: reduce) {
          .lt-card, .lt-brand, .lt-bird, .lt-sticker, .lt-mid, .lt-stats, .lt-testimonial,
          .lt-badges, .lt-toprow, .lt-title, .lt-titlesub, .lt-form, .lt-submit {
            animation: none !important; transition: none !important; opacity: 1 !important;
          }
        }

        @media (max-width: 900px) {
          .lt-left { display: none; }
          .lt-right { width: 100%; max-width: 440px; }
        }
      `}</style>

      <div className="lt-card">
        {/* ================= LEFT: photo hero ================= */}
        <div className="lt-left">
          {birds.map(b => (
            <svg
              key={b.id} className="lt-bird" viewBox="0 0 24 24" width="16" height="16"
              style={{ top: `${b.top}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
            >
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M2 12c3-4 6-4 10-1 4-3 7-3 10 1" />
            </svg>
          ))}

          <div className="lt-sticker"><Sparkles size={13} color="#f97316" /> Better trips ahead</div>

          <div className="lt-brand">
            <div className="lt-brand-icon"><Bus size={17} color="#fff" /></div>
            <span className="lt-brand-text">Bus<span>Go</span></span>
          </div>

          <div className="lt-mid">
            <h1 className="lt-headline">Find Your<br /><span className="accent">Perfect Ride</span></h1>
            <p className="lt-sub">Book your bus tickets in seconds and travel to your dream destinations comfortably.</p>

            <div className="lt-stats">
              {STATS.map(s => <StatCounter key={s.key} target={s.target} label={s.label} suffix={s.suffix} />)}
            </div>

            <TestimonialRotator />

            <div className="lt-badges">
              {FEATURE_BADGES.map(b => <FeatureBadge key={b.title} icon={b.icon} title={b.title} sub={b.sub} />)}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: form ================= */}
        <div className="lt-right">
          <div className="lt-toprow">
            <div className="lt-welcome">
              <div className="lt-welcome-icon"><Bus size={14} color="#f97316" /></div>
              <span>Welcome</span>
            </div>
            <div className="lt-new">New to BusGo? <Link to="/register">Create Account</Link></div>
          </div>

          <h2 className="lt-title">Login to<br /><span className="accent">Your Account</span></h2>
          <p className="lt-titlesub">Sign in to continue your journey</p>

          <form className="lt-form" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email or Phone Number"
              icon={User}
              name="email"
              type="text"
              placeholder="Enter your email or phone"
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              focused={focused === 'email'}
              error={errors.email}
            />

            <FormField
              label="Password"
              icon={Lock}
              name="password"
              type={show ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={e => updateField('password', e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => { setFocused(''); setCapsOn(false); }}
              onKeyUp={handlePasswordKeyUp}
              focused={focused === 'password'}
              error={errors.password}
              rightSlot={
                <button type="button" className="lt-eye" onClick={() => setShow(!show)} aria-label="Toggle password visibility">
                  {show ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                </button>
              }
            />

            {capsOn && (
              <p className="lt-caps-warning"><AlertTriangle size={12} /> Caps Lock is on</p>
            )}

            <div className="lt-options-row">
              <RememberMeCheckbox checked={remember} onChange={setRemember} />
              <a href="#" className="lt-forgot">Forgot Password?</a>
            </div>

            <button type="submit" disabled={loading} className="lt-submit">
              {loading ? 'Logging in...' : (<>Log In <ArrowRight size={16} /></>)}
            </button>

            <button type="button" className="lt-guest" onClick={continueAsGuest}>
              Continue browsing as guest
            </button>
          </form>

          <div className="lt-divider"><span>or continue with</span></div>

          <div className="lt-social-row">
            <SocialButton label="Continue with Google" onClick={() => social('Google')}>
              <svg width="17" height="17" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.4 0-13.7 4.2-17 10.7z" />
                <path fill="#4CAF50" d="M24 45c5.5 0 10.4-2.1 14.2-5.5l-6.6-5.4c-2 1.5-4.6 2.4-7.6 2.4-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.7 40.6 16.3 45 24 45z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C40.9 36.5 45 30.9 45 24c0-1.4-.1-2.7-.4-3.5z" />
              </svg>
            </SocialButton>
            <SocialButton label="Continue with Facebook" onClick={() => social('Facebook')}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99h-2.54V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z" /></svg>
            </SocialButton>
            <SocialButton label="Continue with Apple" onClick={() => social('Apple')}>
              <svg width="15" height="17" viewBox="0 0 384 512" fill="#0f172a"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-57.7-90-57.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
            </SocialButton>
            <SocialButton label="Continue with mobile OTP" onClick={() => social('Mobile OTP')}>
              <Smartphone size={16} color="#0f172a" />
            </SocialButton>
          </div>

          <p className="lt-signup">Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
}