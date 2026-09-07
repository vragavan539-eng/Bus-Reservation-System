import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bus, Eye, EyeOff, Mail, Lock, Sofa, ShieldCheck,
  Ticket, Headphones, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['LIVE TRACKING', 'ON TIME', 'NOW BOARDING'];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStatusIdx(i => (i + 1) % STATUSES.length), 2600);
    return () => clearInterval(t);
  }, []);

  const particles = useMemo(() => (
    Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: Math.round(Math.random() * 100),
      delay: (Math.random() * 6).toFixed(2),
      duration: (5 + Math.random() * 5).toFixed(2),
      size: (2 + Math.random() * 2.5).toFixed(1),
    }))
  ), []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const social = provider => toast(`${provider} login coming soon`, { icon: '🚧' });

  return (
    <div className="bg-split-auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .bg-split-auth-root {
          --ink: #0f172a;
          --orange: #f97316;
          --orange-deep: #ea580c;
          --muted: #94a3b8;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef1f6;
          padding: 24px;
          font-family: 'Manrope', sans-serif;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(28px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 6px 16px -4px rgba(249,115,22,0.5); }
          50% { box-shadow: 0 6px 26px -2px rgba(249,115,22,0.85); }
        }
        @keyframes roadDash {
          from { background-position: 0 0; }
          to { background-position: -80px 0; }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-260px) scale(0.4); opacity: 0; }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-120%) skewX(-15deg); }
          100% { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes flipDown {
          0% { opacity: 0; transform: rotateX(-90deg) translateY(-4px); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: rotateX(0) translateY(0); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52,211,153,0.6); }
          50% { opacity: 0.4; box-shadow: 0 0 0 5px rgba(52,211,153,0); }
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .split-card {
          width: 100%;
          max-width: 980px;
          min-height: 620px;
          display: flex;
          background: #fff;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 40px 90px -30px rgba(15,23,42,0.35);
          opacity: 0;
          animation: cardRise 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .left {
          flex: 1;
          min-width: 0;
          padding: 44px 48px 0;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .anim-item { opacity: 0; animation: fadeSlideUp 0.55s ease forwards; }

        .logo-row { display: flex; align-items: center; gap: 10px; animation-delay: 0.12s; }
        .logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, var(--orange), var(--orange-deep));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          animation: pulseGlow 2.6s ease-in-out infinite;
        }
        .logo-text { font-size: 20px; font-weight: 800; color: var(--ink); letter-spacing: -0.2px; }
        .logo-text span { color: var(--orange); }
        .tagline { font-size: 11.5px; color: var(--muted); margin: 2px 0 0 48px; letter-spacing: 0.3px; animation-delay: 0.2s; }

        .headline { font-size: 25px; font-weight: 800; color: var(--ink); margin: 34px 0 4px; animation-delay: 0.28s; }
        .subline { font-size: 13.5px; color: var(--muted); margin-bottom: 26px; animation-delay: 0.34s; }

        .field { margin-bottom: 15px; animation-delay: var(--d, 0.4s); }
        .field label {
          display: block; font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;
        }
        .field-box {
          display: flex; align-items: center;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          transition: border-color .18s, box-shadow .25s, background .18s;
        }
        .field-box.on { border-color: var(--orange); box-shadow: 0 0 0 4px rgba(249,115,22,0.14); background: #fff; }
        .field-box svg { margin-left: 14px; flex-shrink: 0; transition: color .18s; }
        .field-box input {
          flex: 1; border: none; outline: none; background: transparent;
          padding: 12px 14px; font-size: 14px; color: var(--ink); font-family: 'Manrope', sans-serif;
        }
        .field-box button { background: none; border: none; cursor: pointer; padding: 0 14px; display: flex; }

        .row-between { display: flex; justify-content: flex-end; margin-bottom: 20px; animation-delay: 0.5s; }
        .forgot { font-size: 12.5px; color: var(--orange); font-weight: 700; text-decoration: none; }

        .login-btn {
          width: 100%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--orange) 0%, var(--orange-deep) 100%);
          color: #fff; border: none; border-radius: 12px; padding: 13.5px;
          font-size: 14.5px; font-weight: 700; letter-spacing: 0.3px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer;
          box-shadow: 0 12px 24px -8px rgba(249,115,22,0.55);
          transition: transform .15s, box-shadow .15s, opacity .15s;
          animation-delay: 0.56s;
        }
        .login-btn::before {
          content: '';
          position: absolute; top: 0; left: 0; width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.45), transparent);
          transform: translateX(-120%) skewX(-15deg);
        }
        .login-btn:hover:not(:disabled)::before { animation: shimmerSweep 0.9s ease; }
        .login-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; box-shadow: none; }
        .login-btn svg.arrow { transition: transform 0.2s; }
        .login-btn:hover:not(:disabled) svg.arrow { transform: translateX(3px); }

        .divider { display: flex; align-items: center; gap: 12px; margin: 22px 0 16px; animation-delay: 0.62s; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
        .divider span { font-size: 11.5px; color: var(--muted); white-space: nowrap; }

        .social-row { display: flex; gap: 10px; margin-bottom: 8px; animation-delay: 0.68s; }
        .social-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          border: 1.5px solid #e2e8f0; background: #fff; border-radius: 12px;
          padding: 11px; font-size: 13px; font-weight: 600; color: var(--ink);
          cursor: pointer; transition: border-color .15s, background .15s, transform .15s;
        }
        .social-btn:hover { border-color: #cbd5e1; background: #f8fafc; transform: translateY(-1px); }

        .signup-line { text-align: center; font-size: 13px; color: var(--muted); animation-delay: 0.74s; padding-bottom: 14px; }
        .signup-line a { color: var(--orange); font-weight: 700; text-decoration: none; }

        .demo-note {
          background: #fff7ed; border: 1px dashed #fbbf72; border-radius: 10px;
          padding: 9px 12px; margin-bottom: 16px; animation-delay: 0.44s;
        }
        .demo-note p { margin: 0; font-size: 11px; color: #9a5b12; line-height: 1.5; }
        .demo-note b { font-weight: 800; }

        .road-strip {
          height: 20px;
          margin-top: auto;
          background-image: repeating-linear-gradient(90deg, #f97316 0 22px, transparent 22px 40px);
          background-size: 80px 2px;
          background-repeat: repeat-x;
          background-position: center;
          opacity: 0.35;
          animation: roadDash 1.6s linear infinite;
          border-top: 1px solid #f1f5f9;
        }

        .right {
          width: 46%;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(9,15,28,0.35) 0%, rgba(9,15,28,0.55) 55%, rgba(9,15,28,0.92) 100%),
            url('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=70') center/cover;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 28px 26px 26px;
        }

        .particle {
          position: absolute;
          bottom: 0;
          border-radius: 50%;
          background: radial-gradient(circle, #fed7aa 0%, rgba(249,115,22,0) 70%);
          pointer-events: none;
          animation-name: floatParticle;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }

        .right-top-badge {
          position: absolute; top: 22px; left: 22px;
          background: rgba(15,23,42,0.55);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.5px;
          display: flex; align-items: center; gap: 7px;
          perspective: 400px;
        }
        .right-top-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; animation: dotBlink 1.8s ease-in-out infinite; }
        .status-text { display: inline-block; animation: flipDown 0.5s ease; transform-origin: top; }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }
        .feature-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px;
          padding: 10px 6px;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          text-align: center;
          transition: background .2s, transform .2s;
        }
        .feature-card:hover { background: rgba(255,255,255,0.18); transform: translateY(-3px); }
        .feature-card:hover svg { animation: iconBounce 0.6s ease; }
        .feature-card svg { color: #f97316; }
        .feature-card span { font-size: 9.5px; font-weight: 600; color: #e2e8f0; line-height: 1.2; }

        .banner {
          display: flex; align-items: center; gap: 12px;
          background: linear-gradient(135deg, rgba(249,115,22,0.9), rgba(234,88,12,0.9));
          border-radius: 12px; padding: 12px 14px;
          position: relative; z-index: 1;
        }
        .banner-icon {
          width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .banner p { margin: 0; font-size: 11.5px; color: #fff; line-height: 1.4; font-weight: 500; }

        @media (prefers-reduced-motion: reduce) {
          .split-card, .anim-item, .logo-icon, .road-strip, .particle, .status-text { animation: none !important; opacity: 1 !important; transform: none !important; }
        }

        @media (max-width: 800px) {
          .right { display: none; }
          .split-card { max-width: 460px; }
          .left { padding: 36px 28px 0; }
        }
      `}</style>

      <div className="split-card">
        <div className="left">
          <div className="logo-row anim-item">
            <div className="logo-icon"><Bus size={20} color="#fff" /></div>
            <span className="logo-text">Bus<span>Go</span></span>
          </div>
          <p className="tagline anim-item">Your Journey, Our Responsibility</p>

          <h1 className="headline anim-item">Welcome Back!</h1>
          <p className="subline anim-item">Login to continue your journey</p>

          <div className="demo-note anim-item">
            <p><b>Demo:</b> admin@busgo.com / admin123 &nbsp;•&nbsp; user@busgo.com / user123</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field anim-item" style={{ '--d': '0.46s' }}>
              <label>Email or Phone Number</label>
              <div className={`field-box ${focused === 'email' ? 'on' : ''}`}>
                <Mail size={16} color={focused === 'email' ? '#f97316' : '#94a3b8'} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="field anim-item" style={{ '--d': '0.52s' }}>
              <label>Password</label>
              <div className={`field-box ${focused === 'password' ? 'on' : ''}`}>
                <Lock size={16} color={focused === 'password' ? '#f97316' : '#94a3b8'} />
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShow(!show)}>
                  {show ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <div className="row-between anim-item">
              <a href="#" className="forgot">Forgot Password?</a>
            </div>

            <button type="submit" disabled={loading} className="login-btn anim-item">
              {loading ? 'Logging in...' : (<>Login <ArrowRight size={16} className="arrow" /></>)}
            </button>
          </form>

          <div className="divider anim-item"><span>Or continue with</span></div>

          <div className="social-row anim-item">
            <button className="social-btn" onClick={() => social('Google')}>
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.4 0-13.7 4.2-17 10.7z"/>
                <path fill="#4CAF50" d="M24 45c5.5 0 10.4-2.1 14.2-5.5l-6.6-5.4c-2 1.5-4.6 2.4-7.6 2.4-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.7 40.6 16.3 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C40.9 36.5 45 30.9 45 24c0-1.4-.1-2.7-.4-3.5z"/>
              </svg>
              Google
            </button>
            <button className="social-btn" onClick={() => social('Apple')}>
              <svg width="14" height="16" viewBox="0 0 384 512" fill="#0f172a"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-57.7-90-57.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              Apple
            </button>
          </div>

          <p className="signup-line anim-item">Don't have an account? <Link to="/register">Sign Up</Link></p>

          <div className="road-strip" />
        </div>

        <div className="right">
          {particles.map(p => (
            <span
              key={p.id}
              className="particle"
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}

          <div className="right-top-badge">
            <span className="dot" />
            <span key={statusIdx} className="status-text">{STATUSES[statusIdx]}</span>
          </div>

          <div className="feature-grid">
            <div className="feature-card"><Sofa size={16} /><span>Comfortable Seating</span></div>
            <div className="feature-card"><ShieldCheck size={16} /><span>Safe &amp; Secure</span></div>
            <div className="feature-card"><Ticket size={16} /><span>Easy Booking</span></div>
            <div className="feature-card"><Headphones size={16} /><span>24/7 Support</span></div>
          </div>

          <div className="banner">
            <div className="banner-icon"><Mail size={15} color="#fff" /></div>
            <p>Book your tickets easily and travel to your dream destinations with BusGo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}