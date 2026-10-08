import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Ticket,
  Headphones,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['SAFE TRAVEL', 'ON TIME', 'NOW BOARDING'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    address: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [agree, setAgree] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUSES.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        delay: (Math.random() * 6).toFixed(2),
        duration: (5 + Math.random() * 5).toFixed(2),
        size: (2 + Math.random() * 2).toFixed(1)
      })),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error('Please enter your full name');
    if (!form.email.trim()) return toast.error('Please enter your email');
    if (!form.phone.trim()) return toast.error('Please enter your phone number');
    if (form.password.length < 6) return toast.error('Password must contain at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!form.gender) return toast.error('Please select your gender');
    if (!form.dob) return toast.error('Please select your date of birth');
    if (!agree) return toast.error('Please accept Terms & Conditions');

    try {
      setLoading(true);
      const user = await register(form);
      toast.success('Account created successfully!');
      navigate(user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const social = (provider) => {
    toast(`${provider} registration coming soon`, { icon: '🚧' });
  };

  return (
    <div className="bus-register-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          height: 100%;
          overflow: hidden;
        }

        .bus-register-root {
          --blue: #1683ff;
          --blue-dark: #0754c9;
          --cyan: #20c7ff;
          --navy: #06172f;
          --text: #0f172a;
          --muted: #64748b;

          height: 100vh;
          width: 100%;
          font-family: 'Manrope', sans-serif;

          background:
            radial-gradient(circle at 15% 20%, rgba(32, 199, 255, 0.10), transparent 28%),
            radial-gradient(circle at 90% 80%, rgba(22, 131, 255, 0.10), transparent 30%),
            #edf4fb;

          color: var(--text);
          overflow: hidden;

          display: flex;
          flex-direction: column;
        }

        /* =========================
           HEADER
        ========================= */
        .bus-header {
          height: 64px;
          width: 100%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4%;
          position: relative;
          z-index: 20;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1683ff, #0754c9);
          color: white;
          box-shadow: 0 8px 20px rgba(22, 131, 255, 0.28);
        }

        .brand-name {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.6px;
          color: #0b1f3a;
        }
        .brand-name span { color: var(--blue); }

        .brand-tagline {
          font-size: 8.5px;
          color: #7c8ca3;
          margin-top: 1px;
          letter-spacing: 0.4px;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-left: 50px;
        }

        .desktop-nav a {
          color: #1e3656;
          text-decoration: none;
          font-size: 12.5px;
          font-weight: 600;
          transition: 0.2s;
        }
        .desktop-nav a:hover { color: var(--blue); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .login-top {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #172b49;
          text-decoration: none;
          font-size: 12.5px;
          font-weight: 700;
        }

        .menu-icon {
          width: 36px;
          height: 36px;
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #172b49;
          cursor: pointer;
        }

        /* =========================
           MAIN STAGE
        ========================= */
        .register-stage {
          flex: 1;
          min-height: 0;
          padding: 20px 4%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .register-shell {
          width: 100%;
          max-width: 1320px;
          height: 100%;
          max-height: 100%;

          display: grid;
          grid-template-columns: 1fr 1fr;

          overflow: hidden;
          position: relative;

          border-radius: 24px;
          background: #06172f;

          box-shadow: 0 30px 70px rgba(15, 23, 42, 0.22);

          animation: shellIn 0.6s ease forwards;
        }

        @keyframes shellIn {
          from { opacity: 0; transform: translateY(14px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* =========================
           LEFT HERO
        ========================= */
        .hero-side {
          min-width: 0;
          position: relative;
          overflow: hidden;

          padding: 36px 44px 32px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          background:
            linear-gradient(
              100deg,
              rgba(3, 15, 34, 0.94) 0%,
              rgba(3, 19, 43, 0.78) 55%,
              rgba(3, 19, 43, 0.50) 100%
            ),
            linear-gradient(
              180deg,
              rgba(2, 13, 31, 0.45) 0%,
              rgba(2, 13, 31, 0.30) 45%,
              rgba(2, 13, 31, 0.82) 100%
            ),
            url('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1800&q=90&auto=format&fit=crop')
            center center / cover no-repeat;
        }

        .hero-side::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 25% 30%, rgba(32, 199, 255, 0.18), transparent 40%),
            radial-gradient(circle at 85% 75%, rgba(22, 131, 255, 0.12), transparent 45%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 520px;
          margin: auto 0;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #d8efff;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 3.5px;
          margin-bottom: 12px;
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 15px var(--cyan);
        }

        .hero-title {
          margin: 0 0 14px;
          font-size: clamp(30px, 2.8vw, 46px);
          line-height: 1.04;
          letter-spacing: -1.6px;
          font-weight: 800;
          color: white;
        }

        .hero-title span {
          display: block;
          background: linear-gradient(90deg, #20c7ff, #55a8ff, #86dfff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-description {
          max-width: 430px;
          margin: 0 0 20px;
          color: #d6e5f5;
          font-size: 13px;
          line-height: 1.65;
        }

        .hero-features {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
          max-width: 430px;
        }

        .hero-feature {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          transition: 0.25s;
        }

        .hero-feature:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(32, 199, 255, 0.5);
        }

        .feature-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(32, 199, 255, 0.15);
          color: #65dfff;
          flex-shrink: 0;
        }

        .feature-text strong {
          display: block;
          color: white;
          font-size: 10.5px;
          margin-bottom: 1px;
        }

        .feature-text span {
          display: block;
          color: #9fb7d0;
          font-size: 9px;
        }

        .hero-bottom {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .journey-text {
          color: white;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.1;
        }

        .journey-text span {
          display: block;
          color: #36cfff;
        }

        .route-line {
          height: 1px;
          flex: 1;
          max-width: 150px;
          margin-bottom: 5px;
          background: linear-gradient(90deg, #2ec9ff, transparent);
        }

        /* =========================
           PARTICLES
        ========================= */
        .particle {
          position: absolute;
          bottom: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(96, 211, 255, 0.8), rgba(96, 211, 255, 0));
          pointer-events: none;
          animation: floatParticle 6s ease-out infinite;
        }

        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-260px) scale(0.2); opacity: 0; }
        }

        /* =========================
           FORM SIDE
        ========================= */
        .form-side {
          background: linear-gradient(135deg, #ffffff, #f8fbff);
          padding: 26px 34px;
          display: flex;
          align-items: center;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .form-side::-webkit-scrollbar { width: 5px; }
        .form-side::-webkit-scrollbar-thumb {
          background: #dce6f0;
          border-radius: 999px;
        }
        .form-side::-webkit-scrollbar-thumb:hover { background: #b9cce2; }

        .form-container {
          width: 100%;
          max-width: 540px;
          margin: auto;
        }

        .form-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
        }

        .form-heading-wrap {
          display: flex;
          gap: 11px;
        }

        .register-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: var(--blue);
          background: linear-gradient(135deg, #e3f3ff, #d4ecff);
        }

        .form-title {
          margin: 0;
          font-size: 22px;
          line-height: 1.15;
          letter-spacing: -0.8px;
          color: #0a2141;
          font-weight: 800;
        }
        .form-title span { color: var(--blue); }

        .form-subtitle {
          margin: 4px 0 0;
          color: #718096;
          font-size: 11px;
        }

        .already {
          color: #8190a5;
          font-size: 10px;
          white-space: nowrap;
          padding-top: 5px;
        }

        .already a {
          color: var(--blue);
          font-weight: 800;
          text-decoration: none;
          margin-left: 4px;
        }

        /* =========================
           FORM GRID
        ========================= */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .field { margin-bottom: 0; }
        .field.full { grid-column: 1 / -1; }

        .field label {
          display: block;
          margin-bottom: 4px;
          color: #53657c;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .required { color: #ef4444; }

        .field-box {
          height: 42px;
          display: flex;
          align-items: center;
          border-radius: 10px;
          background: #f8fbff;
          border: 1.5px solid #dce6f0;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          overflow: hidden;
        }

        .field-box.focused {
          border-color: var(--blue);
          background: white;
          box-shadow: 0 0 0 3px rgba(22, 131, 255, 0.10);
        }

        .field-box > svg {
          margin-left: 11px;
          flex-shrink: 0;
          color: #91a1b5;
        }

        .field-box.focused > svg { color: var(--blue); }

        .field-box input,
        .field-box textarea {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          padding: 0 11px;
          color: #0f172a;
          font-family: inherit;
          font-size: 12px;
        }

        .field-box input::placeholder,
        .field-box textarea::placeholder { color: #9aabc0; }

        .field-box input[type="date"] {
          cursor: pointer;
          padding-right: 8px;
          font-size: 11.5px;
        }

        .field-box input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.6;
        }

        .field-box textarea {
          resize: none;
          padding: 11px;
          height: 100%;
        }

        .field-box.textarea-box {
          height: 52px;
          align-items: flex-start;
        }

        .field-box.textarea-box > svg {
          margin-top: 17px;
        }

        .password-button {
          border: 0;
          background: transparent;
          padding: 0 11px;
          height: 100%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #91a1b5;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .password-button:hover { color: var(--blue); }

        /* =========================
           GENDER
        ========================= */
        .gender-title {
          display: block;
          margin-bottom: 4px;
          color: #53657c;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .gender-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          height: 42px;
        }

        .gender-option {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border-radius: 10px;
          background: #f8fbff;
          border: 1.5px solid #dce6f0;
          color: #50627a;
          cursor: pointer;
          font-size: 10.5px;
          font-weight: 700;
          transition: 0.2s;
          user-select: none;
        }

        .gender-option:hover { border-color: #a9cfff; }

        .gender-option.selected {
          color: var(--blue);
          border-color: var(--blue);
          background: linear-gradient(135deg, #eef8ff, #e5f4ff);
          box-shadow: 0 4px 12px rgba(22, 131, 255, 0.10);
        }

        .gender-option input { display: none; }

        /* =========================
           TERMS
        ========================= */
        .terms {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 12px 0 10px;
          color: #74859a;
          font-size: 10px;
        }

        .terms input {
          width: 15px;
          height: 15px;
          accent-color: var(--blue);
          cursor: pointer;
          flex-shrink: 0;
        }

        .terms a {
          color: var(--blue);
          text-decoration: none;
          font-weight: 700;
        }

        /* =========================
           REGISTER BUTTON
        ========================= */
        .register-button {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 10px;
          color: white;
          background: linear-gradient(135deg, #1683ff 0%, #0754c9 100%);
          box-shadow: 0 10px 22px rgba(22, 131, 255, 0.28);
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 800;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }

        .register-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 45%;
          height: 100%;
          background: linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.38), transparent);
          transform: skewX(-15deg);
        }

        .register-button:hover:not(:disabled)::before {
          animation: shine 0.8s ease;
        }

        @keyframes shine {
          from { left: -100%; }
          to { left: 150%; }
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(22, 131, 255, 0.35);
        }

        .register-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* =========================
           DIVIDER
        ========================= */
        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 12px 0 10px;
          color: #a1afc0;
          font-size: 9.5px;
          font-weight: 600;
        }

        .divider::before,
        .divider::after {
          content: '';
          height: 1px;
          flex: 1;
          background: #e1e8f0;
        }

        /* =========================
           SOCIAL
        ========================= */
        .social-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .social-button {
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 10px;
          border: 1.5px solid #dce6f0;
          background: white;
          color: #273c58;
          font-family: inherit;
          font-size: 10.5px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .social-button:hover {
          background: #f8fbff;
          border-color: #b9cce2;
          transform: translateY(-1px);
        }

        .login-bottom {
          text-align: center;
          margin: 10px 0 0;
          color: #8a99aa;
          font-size: 10px;
        }

        .login-bottom a {
          color: var(--blue);
          text-decoration: none;
          font-weight: 800;
        }

        /* =========================
           RESPONSIVE
        ========================= */
        @media (max-width: 1150px) {
          .hero-side { padding: 32px 32px 28px; }
          .form-side { padding: 22px 26px; }
          .desktop-nav { gap: 18px; margin-left: 16px; }
        }

        @media (max-width: 900px) {
          html, body, #root { overflow: auto; }
          .bus-register-root { height: auto; min-height: 100vh; }
          .register-stage { padding: 16px; overflow: visible; }
          .register-shell {
            grid-template-columns: 1fr;
            max-width: 600px;
            height: auto;
            max-height: none;
          }
          .hero-side {
            min-height: 320px;
            padding: 32px 26px 26px;
          }
          .form-side {
            padding: 24px 22px;
            overflow-y: visible;
          }
          .desktop-nav { display: none; }
        }

        @media (max-width: 600px) {
          .bus-header {
            height: 58px;
            padding: 0 14px;
          }
          .brand-icon { width: 34px; height: 34px; }
          .brand-name { font-size: 16px; }
          .brand-tagline { display: none; }
          .login-top span { display: none; }
          .hero-side { padding: 26px 20px 22px; min-height: 280px; }
          .hero-title { font-size: 28px; letter-spacing: -1.2px; }
          .hero-description { font-size: 12px; }
          .hero-features { grid-template-columns: 1fr 1fr; }
          .feature-text span { display: none; }
          .route-line { display: none; }
          .form-grid { grid-template-columns: 1fr; }
          .field.full { grid-column: auto; }
          .form-top { flex-direction: column; }
          .already { align-self: flex-end; padding-top: 0; }
          .social-row { grid-template-columns: 1fr; }
          .form-title { font-size: 20px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* =========================
          HEADER
      ========================= */}
      <header className="bus-header">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Bus size={22} />
          </div>
          <div>
            <div className="brand-name">Bus<span>Go</span></div>
            <div className="brand-tagline">Safe Journey • Better Tomorrow</div>
          </div>
        </Link>

        <nav className="desktop-nav">
          <Link to="/">Home</Link>
          <Link to="/buses">Bus Tickets</Link>
          <Link to="/routes">Routes</Link>
          <Link to="/offers">Offers</Link>
          <Link to="/help">Help</Link>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="login-top">
            <User size={16} />
            <span>Login</span>
          </Link>
          <button className="menu-icon" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================= */}
      <main className="register-stage">
        <div className="register-shell">

          {/* LEFT HERO */}
          <section className="hero-side">
            {particles.map((particle) => (
              <span
                key={particle.id}
                className="particle"
                style={{
                  left: `${particle.left}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`
                }}
              />
            ))}

            <div className="hero-content">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                EXPLORE • TRAVEL • DISCOVER
              </div>

              <h1 className="hero-title">
                Your Journey
                <span>Our Priority</span>
              </h1>

              <p className="hero-description">
                Book bus tickets online with ease and travel safely
                to your favorite destinations.
              </p>

              <div className="hero-features">
                <div className="hero-feature">
                  <div className="feature-icon"><ShieldCheck size={15} /></div>
                  <div className="feature-text">
                    <strong>Safe & Secure</strong>
                    <span>Your safety is our priority</span>
                  </div>
                </div>

                <div className="hero-feature">
                  <div className="feature-icon"><Ticket size={15} /></div>
                  <div className="feature-text">
                    <strong>Best Prices</strong>
                    <span>Great deals & offers</span>
                  </div>
                </div>

                <div className="hero-feature">
                  <div className="feature-icon"><Headphones size={15} /></div>
                  <div className="feature-text">
                    <strong>24/7 Support</strong>
                    <span>We're always here to help</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-bottom">
              <div className="journey-text">
                Travel More
                <span>Worry Less</span>
              </div>
              <div className="route-line" />
            </div>
          </section>

          {/* FORM SIDE */}
          <section className="form-side">
            <div className="form-container">

              <div className="form-top">
                <div className="form-heading-wrap">
                  <div className="register-icon"><User size={20} /></div>
                  <div>
                    <h2 className="form-title">Create Your <span>Account</span></h2>
                    <p className="form-subtitle">Join BusGo and start your journey today!</p>
                  </div>
                </div>
                <div className="already">
                  Already have an account? <Link to="/login">Login →</Link>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">

                  <div className="field">
                    <label>Full Name <span className="required">*</span></label>
                    <div className={`field-box ${focused === 'name' ? 'focused' : ''}`}>
                      <User size={15} />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused('')}
                        onChange={handleChange}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Email Address <span className="required">*</span></label>
                    <div className={`field-box ${focused === 'email' ? 'focused' : ''}`}>
                      <Mail size={15} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused('')}
                        onChange={handleChange}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Phone Number <span className="required">*</span></label>
                    <div className={`field-box ${focused === 'phone' ? 'focused' : ''}`}>
                      <Phone size={15} />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Enter mobile number"
                        value={form.phone}
                        onFocus={() => setFocused('phone')}
                        onBlur={() => setFocused('')}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Password <span className="required">*</span></label>
                    <div className={`field-box ${focused === 'password' ? 'focused' : ''}`}>
                      <Lock size={15} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create strong password"
                        value={form.password}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused('')}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-button"
                        onClick={() => setShowPassword((p) => !p)}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="field full">
                    <label>Confirm Password <span className="required">*</span></label>
                    <div className={`field-box ${focused === 'confirmPassword' ? 'focused' : ''}`}>
                      <Lock size={15} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={form.confirmPassword}
                        onFocus={() => setFocused('confirmPassword')}
                        onBlur={() => setFocused('')}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <label>Date of Birth <span className="required">*</span></label>
                    <div className={`field-box ${focused === 'dob' ? 'focused' : ''}`}>
                      <CalendarDays size={15} />
                      <input
                        type="date"
                        name="dob"
                        value={form.dob}
                        onFocus={() => setFocused('dob')}
                        onBlur={() => setFocused('')}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <span className="gender-title">Gender <span className="required">*</span></span>
                    <div className="gender-options">
                      <label className={`gender-option ${form.gender === 'Male' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={form.gender === 'Male'}
                          onChange={handleChange}
                        />
                        <span>♂</span> Male
                      </label>

                      <label className={`gender-option ${form.gender === 'Female' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={form.gender === 'Female'}
                          onChange={handleChange}
                        />
                        <span>♀</span> Female
                      </label>

                      <label className={`gender-option ${form.gender === 'Other' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Other"
                          checked={form.gender === 'Other'}
                          onChange={handleChange}
                        />
                        <span>○</span> Other
                      </label>
                    </div>
                  </div>

                  <div className="field full">
                    <label>Address <span style={{ color: '#9aabc0', fontWeight: 600 }}>(Optional)</span></label>
                    <div className={`field-box textarea-box ${focused === 'address' ? 'focused' : ''}`}>
                      <MapPin size={15} />
                      <textarea
                        name="address"
                        placeholder="Enter your address"
                        value={form.address}
                        onFocus={() => setFocused('address')}
                        onBlur={() => setFocused('')}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                </div>

                <label className="terms">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms">Terms & Conditions</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>
                  </span>
                </label>

                <button type="submit" className="register-button" disabled={loading}>
                  {loading ? 'Creating Account...' : (<>Register <ArrowRight size={15} /></>)}
                </button>
              </form>

              <div className="divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <div className="social-row">
                <button type="button" className="social-button" onClick={() => social('Google')}>
                  <svg width="15" height="15" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.4 0-13.7 4.2-17 10.7z" />
                    <path fill="#4CAF50" d="M24 45c5.5 0 10.4-2.1 14.2-5.5l-6.6-5.4c-2 1.5-4.6 2.4-7.6 2.4-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.7 40.6 16.3 45 24 45z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C40.9 36.5 45 30.9 45 24c0-1.4-.1-2.7-.4-3.5z" />
                  </svg>
                  Continue with Google
                </button>

                <button type="button" className="social-button" onClick={() => social('GitHub')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#111827">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17A10.9 10.9 0 0112 7.9c.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.18v3.23c0 .3.21.66.79.55A11.51 11.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                  Continue with GitHub
                </button>
              </div>

              <p className="login-bottom">
                Already have an account? <Link to="/login">Login</Link>
              </p>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}