import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
  Bus, Eye, EyeOff, AlertTriangle, ArrowRight, Mail, Lock,
  Shield, ShieldCheck, Headphones, Armchair, Clock, LogIn,
  CheckCircle2, User
} from 'lucide-react';
import toast from 'react-hot-toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const runValidation = (form) => {
  const errs = {};
  const emailVal = form.email.trim();
  if (!emailVal) errs.email = 'Email or phone is required';
  else if (!EMAIL_RE.test(emailVal) && !PHONE_RE.test(emailVal))
    errs.email = 'Enter a valid email or 10-digit phone';
  if (!form.password) errs.password = 'Password is required';
  else if (form.password.length < 6)
    errs.password = 'Password must be 6+ characters';
  return errs;
};

export default function LoginPage() {
  if (!GOOGLE_CLIENT_ID) return <LoginPageInner />;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginPageInner />
    </GoogleOAuthProvider>
  );
}

/* ==================== MAIN ==================== */
function LoginPageInner() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [capsLock, setCapsLock] = useState(false);
  const submitAttempted = useRef(false);

  useEffect(() => {
    if (submitAttempted.current) setErrors(runValidation(form));
  }, [form]);

  const updateField = useCallback((name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const handleKeyEvent = useCallback((e) => {
    if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    submitAttempted.current = true;
    const errs = runValidation(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes lgSpin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes sunrisePulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes shimmerX {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes decorDrift {
          0%, 100% { transform: rotate(20deg) translate(0, 0); }
          50% { transform: rotate(20deg) translate(-6px, -10px); }
        }

        .anim-up-1 { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .anim-up-2 { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .anim-up-3 { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .anim-up-4 { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
        .anim-up-5 { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) 0.45s both; }
        .anim-up-6 { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
        .anim-in { animation: fadeIn 1s ease both; }

        .pulse-glow { animation: glowPulse 8s ease-in-out infinite; }
        .sunrise-pulse { animation: sunrisePulse 5s ease-in-out infinite; }
        .decor-drift { animation: decorDrift 12s ease-in-out infinite; }

        .submit-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: -60%;
          width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmerX 3.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 26px 52px -14px rgba(234,88,12,0.7),
            0 8px 20px -8px rgba(234,88,12,0.5) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .social-btn { transition: all 0.22s cubic-bezier(0.4,0,0.2,1); }
        .social-btn:hover {
          border-color: #d6d1c5 !important;
          background: #fbfaf6 !important;
          transform: translateY(-1px);
          box-shadow: 0 10px 22px -10px rgba(15,23,42,0.12) !important;
        }

        .forgot-link, .signup-link {
          transition: color 0.2s;
        }
        .forgot-link:hover, .signup-link:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .lg-input::placeholder { color: #a8a29e; font-weight: 500; }
        .lg-input:focus { outline: none; }

        .eye-btn { transition: background 0.2s; }
        .eye-btn:hover { background: rgba(249,115,22,0.08) !important; }

        @media (max-width: 1080px) {
          .split-card { grid-template-columns: 1fr !important; gap: 0 !important; }
          .hero-side { display: none !important; }
          .form-shell {
            border-radius: 24px !important;
            padding: 40px 28px !important;
          }
          .mobile-brand { display: flex !important; }
        }
        @media (max-width: 540px) {
          .form-shell { padding: 32px 20px !important; }
          .form-title { font-size: 26px !important; }
          .social-row-mobile { flex-direction: column !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-up-1, .anim-up-2, .anim-up-3, .anim-up-4, .anim-up-5, .anim-up-6,
          .anim-in, .pulse-glow, .sunrise-pulse, .decor-drift, .submit-btn::before {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Background layers */}
      <div style={S.bgBaseGradient} />
      <div style={S.bgGlowTop} className="pulse-glow" />
      <div style={S.bgGlowBottom} className="pulse-glow" />
      <div style={S.bgNoise} />

      {/* Tilted orange decorative panels (top-right + bottom-right) */}
      <div style={S.decorOrangeTop} className="decor-drift" />
      <div style={S.decorOrangeBottom} />
      <div style={S.decorCreamPanel} />

      {/* Main grid card */}
      <div style={S.card} className="split-card">
        {/* ============ LEFT — CINEMATIC HERO ============ */}
        <aside style={S.hero} className="hero-side">
          {/* Cinematic sunset bus image */}
          <div
            style={{
              ...S.heroImage,
              backgroundImage:
                "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&auto=format&fit=crop&q=90')",
            }}
          />
          {/* Overlays */}
          <div style={S.heroOverlaySide} />
          <div style={S.heroOverlayTop} />
          <div style={S.heroOverlayBottom} />
          {/* Sunrise glow */}
          <div style={S.heroSunrise} className="sunrise-pulse" />
          {/* Vignette */}
          <div style={S.heroVignette} />

          {/* Content */}
          <div style={S.heroContent}>
            {/* Brand */}
            <div style={S.brand} className="anim-up-1">
              <div style={S.brandIconWrap}>
                <Bus size={24} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={S.brandName}>
                  Bus<span style={{ color: '#fb923c' }}>Go</span>
                </div>
                <div style={S.brandTag}>Your Journey · Our Priority</div>
              </div>
            </div>

            {/* Headline block */}
            <div style={S.heroText}>
              <h1 style={S.heroHeadline} className="anim-up-2">
                Book Your
                <br />
                <span style={S.heroAccent}>Next Journey</span>
                <br />
                with Ease
              </h1>
              <p style={S.heroSub} className="anim-up-3">
                Comfortable rides, trusted bus operators, and a seamless
                booking experience — all in one place.
              </p>
            </div>

            {/* Feature strip */}
            <div style={S.features} className="anim-up-4">
              {[
                { icon: ShieldCheck, label: 'Safe & Secure', sub: 'Bookings' },
                { icon: Armchair, label: 'Comfortable', sub: 'Travel' },
                { icon: Clock, label: 'On-Time', sub: 'Schedules' },
                { icon: Headphones, label: '24/7', sub: 'Support' },
              ].map((f, i) => (
                <React.Fragment key={i}>
                  <div style={S.featureItem}>
                    <div style={S.featureIconRing}>
                      <div style={S.featureIcon}>
                        <f.icon size={17} color="#fff" strokeWidth={2.2} />
                      </div>
                    </div>
                    <div style={S.featureLabel}>
                      {f.label}
                      <span style={S.featureLabelSub}>{f.sub}</span>
                    </div>
                  </div>
                  {i < 3 && <div style={S.featureDivider} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </aside>

        {/* ============ RIGHT — FORM SHELL ============ */}
        <main style={S.formSide} className="form-side">
          <div style={S.formShell} className="form-shell">
            <div style={S.formWrap}>
              {/* Mobile brand */}
              <div style={S.mobileBrand} className="mobile-brand">
                <div style={S.mobileBrandIcon}>
                  <Bus size={20} color="#fff" strokeWidth={2.5} />
                </div>
                <div style={S.mobileBrandName}>
                  Bus<span style={{ color: '#ea580c' }}>Go</span>
                </div>
              </div>

              {/* Top-right signup */}
              <div style={S.topSignup} className="anim-up-1">
                <span style={S.topSignupMuted}>New here?</span>
                <Link to="/register" className="signup-link" style={S.topSignupLink}>
                  Create an account
                  <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Heading */}
              <div className="anim-up-2">
                <h1 style={S.formTitle} className="form-title">
                  Welcome Back
                </h1>
                <p style={S.formSub}>
                  Login to your account and continue your journey
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div style={S.fieldGroup} className="anim-up-3">
                  <label htmlFor="login-email" style={S.fieldLabel}>
                    Email or Mobile Number
                  </label>
                  <div
                    style={{
                      ...S.fieldWrap,
                      borderColor: errors.email
                        ? '#ef4444'
                        : focused === 'email'
                        ? '#f97316'
                        : '#e7e2d6',
                      boxShadow:
                        focused === 'email' && !errors.email
                          ? '0 0 0 4px rgba(249,115,22,0.10)'
                          : 'none',
                    }}
                  >
                    <User
                      size={18}
                      style={{
                        ...S.fieldIcon,
                        color: focused === 'email' ? '#ea580c' : '#a8a29e',
                      }}
                    />
                    <input
                      id="login-email"
                      type="text"
                      placeholder="Enter your email or mobile number"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused('')}
                      autoComplete="username"
                      className="lg-input"
                      style={S.input}
                    />
                  </div>
                  {errors.email && (
                    <p style={S.errMsg}>
                      <AlertTriangle size={11} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div style={S.fieldGroup} className="anim-up-4">
                  <label htmlFor="login-password" style={S.fieldLabel}>
                    Password
                  </label>
                  <div
                    style={{
                      ...S.fieldWrap,
                      borderColor: errors.password
                        ? '#ef4444'
                        : focused === 'password'
                        ? '#f97316'
                        : '#e7e2d6',
                      boxShadow:
                        focused === 'password' && !errors.password
                          ? '0 0 0 4px rgba(249,115,22,0.10)'
                          : 'none',
                    }}
                  >
                    <Lock
                      size={18}
                      style={{
                        ...S.fieldIcon,
                        color: focused === 'password' ? '#ea580c' : '#a8a29e',
                      }}
                    />
                    <input
                      id="login-password"
                      type={show ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      onFocus={() => setFocused('password')}
                      onBlur={() => {
                        setFocused('');
                        setCapsLock(false);
                      }}
                      onKeyDown={handleKeyEvent}
                      onKeyUp={handleKeyEvent}
                      autoComplete="current-password"
                      className="lg-input"
                      style={{ ...S.input, paddingRight: '54px' }}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      style={S.eyeBtn}
                      onClick={() => setShow((s) => !s)}
                      aria-label="Toggle password visibility"
                    >
                      {show ? (
                        <EyeOff size={18} color="#78716c" />
                      ) : (
                        <Eye size={18} color="#78716c" />
                      )}
                    </button>
                  </div>
                  {capsLock && focused === 'password' && (
                    <p style={S.capsWarn}>
                      <AlertTriangle size={11} /> Caps Lock is on
                    </p>
                  )}
                  {errors.password && (
                    <p style={S.errMsg}>
                      <AlertTriangle size={11} /> {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot */}
                <div style={S.forgotRow} className="anim-up-5">
                  <Link
                    to="/forgot-password"
                    className="forgot-link"
                    style={S.forgot}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn anim-up-5"
                  style={{
                    ...S.submit,
                    opacity: loading ? 0.85 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          border: '2.5px solid rgba(255,255,255,0.35)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'lgSpin 0.7s linear infinite',
                          position: 'relative',
                          zIndex: 2,
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 2 }}>
                        Logging in…
                      </span>
                    </>
                  ) : (
                    <>
                      <LogIn
                        size={19}
                        strokeWidth={2.5}
                        style={{ position: 'relative', zIndex: 2 }}
                      />
                      <span style={{ position: 'relative', zIndex: 2 }}>
                        Login
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={S.divider} className="anim-up-6">
                <div style={S.dividerLine} />
                <span style={S.dividerText}>OR</span>
                <div style={S.dividerLine} />
              </div>

              {/* Social */}
              <div style={S.socialRow} className="anim-up-6 social-row-mobile">
                {GOOGLE_CLIENT_ID ? (
                  <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google sign-in failed')}
                      width="100%"
                      text="continue_with"
                      shape="rectangular"
                      theme="outline"
                      size="large"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="social-btn"
                    style={S.socialBtn}
                    onClick={() =>
                      toast.error('Google sign-in not configured')
                    }
                  >
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </button>
                )}

                <button
                  type="button"
                  className="social-btn"
                  style={S.socialBtn}
                  onClick={() => toast.error('Apple sign-in coming soon')}
                >
                  <AppleIcon />
                  <span>Continue with Apple</span>
                </button>
              </div>

              {/* Trust footer */}
              <div style={S.trustFooter} className="anim-up-6">
                <Shield size={14} color="#94a3b8" strokeWidth={2.2} />
                <span style={S.trustText}>Your data is safe with us</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ==================== ICONS ==================== */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#0f172a" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

/* ==================== STYLES ==================== */
const S = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0e9de',
    fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    padding: '32px',
    position: 'relative',
    overflow: 'hidden',
  },

  /* Backgrounds */
  bgBaseGradient: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse at 20% 0%, rgba(251,146,60,0.20), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(234,88,12,0.16), transparent 55%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgGlowTop: {
    position: 'absolute',
    top: '-25%',
    right: '-10%',
    width: '55%',
    height: '80%',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(251,146,60,0.38), transparent 70%)',
    filter: 'blur(110px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: '-25%',
    left: '-15%',
    width: '55%',
    height: '75%',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(234,88,12,0.24), transparent 70%)',
    filter: 'blur(110px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgNoise: {
    position: 'absolute',
    inset: 0,
    opacity: 0.35,
    backgroundImage:
      'radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)',
    backgroundSize: '26px 26px',
    maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* Decor tilted orange panels */
  decorOrangeTop: {
    position: 'absolute',
    top: '-32%',
    right: '-10%',
    width: '52%',
    height: '88%',
    background:
      'linear-gradient(135deg, #fdba74 0%, #fb923c 45%, #ea580c 100%)',
    transform: 'rotate(20deg)',
    boxShadow: '0 80px 140px -50px rgba(234,88,12,0.45)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  decorOrangeBottom: {
    position: 'absolute',
    bottom: '-32%',
    right: '-12%',
    width: '55%',
    height: '72%',
    background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
    transform: 'rotate(20deg)',
    opacity: 0.4,
    pointerEvents: 'none',
    zIndex: 0,
  },
  decorCreamPanel: {
    position: 'absolute',
    top: '20%',
    right: '-15%',
    width: '50%',
    height: '60%',
    background: '#f3ebdc',
    transform: 'rotate(20deg)',
    opacity: 0.6,
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* Card */
  card: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '1300px',
    minHeight: '760px',
    display: 'grid',
    gridTemplateColumns: '1.02fr 1fr',
    background: 'transparent',
    gap: '24px',
  },

  /* ============ HERO ============ */
  hero: {
    position: 'relative',
    overflow: 'hidden',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    padding: '48px 52px',
    minHeight: '760px',
    boxShadow:
      '0 60px 120px -40px rgba(15,23,42,0.55), 0 20px 40px -20px rgba(15,23,42,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset',
  },
  heroImage: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 60%',
    backgroundRepeat: 'no-repeat',
    transform: 'scale(1.05)',
  },
  heroOverlaySide: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, rgba(8,6,18,0.88) 0%, rgba(8,6,18,0.55) 45%, rgba(8,6,18,0.15) 100%)',
  },
  heroOverlayTop: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(8,6,18,0.75) 0%, transparent 28%)',
  },
  heroOverlayBottom: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(0deg, rgba(8,6,18,0.92) 0%, rgba(8,6,18,0.35) 30%, transparent 55%)',
  },
  heroSunrise: {
    position: 'absolute',
    left: '30%',
    bottom: '8%',
    width: '55%',
    height: '55%',
    background:
      'radial-gradient(circle, rgba(251,146,60,0.62), rgba(234,88,12,0.22) 45%, transparent 75%)',
    filter: 'blur(55px)',
    pointerEvents: 'none',
  },
  heroVignette: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse at center, transparent 40%, rgba(8,6,18,0.4) 100%)',
    pointerEvents: 'none',
  },

  heroContent: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '28px',
  },

  /* Brand */
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  brandIconWrap: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    background:
      'linear-gradient(135deg, rgba(251,146,60,0.28), rgba(234,88,12,0.18))',
    border: '1.5px solid rgba(251,146,60,0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow:
      '0 16px 36px -12px rgba(251,146,60,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset',
  },
  brandName: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 800,
    fontSize: '28px',
    letterSpacing: '-0.03em',
    color: '#fff',
    lineHeight: 1,
  },
  brandTag: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.72)',
    fontWeight: 500,
    letterSpacing: '0.4px',
    marginTop: '8px',
  },

  /* Hero text */
  heroText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingTop: '24px',
    maxWidth: '560px',
  },
  heroHeadline: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 800,
    fontSize: '52px',
    lineHeight: 1.06,
    letterSpacing: '-0.045em',
    margin: 0,
    color: '#fff',
    textShadow: '0 8px 50px rgba(0,0,0,0.6)',
  },
  heroAccent: {
    background:
      'linear-gradient(135deg, #fde68a 0%, #fbbf24 35%, #f97316 70%, #ea580c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 6px 26px rgba(251,146,60,0.5))',
  },
  heroSub: {
    marginTop: '22px',
    fontSize: '15.5px',
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 1.75,
    maxWidth: '440px',
    fontWeight: 400,
  },

  /* Features */
  features: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '4px',
    padding: '26px 0 6px',
    borderTop: '1px solid rgba(255,255,255,0.18)',
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  featureIconRing: {
    width: '62px',
    height: '62px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 50% 50%, rgba(251,146,60,0.18), rgba(20,15,10,0.30))',
    border: '1.5px solid rgba(251,146,60,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow:
      '0 14px 32px -14px rgba(251,146,60,0.6), 0 0 0 4px rgba(251,146,60,0.08)',
  },
  featureIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background:
      'linear-gradient(135deg, rgba(20,15,10,0.75), rgba(20,15,10,0.55))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.1px',
    lineHeight: 1.35,
  },
  featureLabelSub: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.68)',
  },
  featureDivider: {
    width: '1px',
    height: '44px',
    background:
      'linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)',
    flexShrink: 0,
    alignSelf: 'center',
    marginTop: '8px',
  },

  /* ============ FORM ============ */
  formSide: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formShell: {
    width: '100%',
    background: '#faf6ee',
    borderRadius: '24px',
    padding: '56px 52px 46px',
    boxShadow:
      '0 60px 120px -40px rgba(15,23,42,0.30), 0 24px 60px -30px rgba(234,88,12,0.20), 0 0 0 1px rgba(255,255,255,0.7) inset',
    border: '1px solid #efe6d6',
  },
  formWrap: {
    maxWidth: '440px',
    width: '100%',
    margin: '0 auto',
  },
  mobileBrand: {
    display: 'none',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '22px',
  },
  mobileBrandIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #fb923c, #ea580c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px -8px rgba(234,88,12,0.55)',
  },
  mobileBrandName: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 800,
    fontSize: '21px',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },

  topSignup: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '34px',
  },
  topSignupMuted: { color: '#64748b' },
  topSignupLink: {
    color: '#ea580c',
    fontWeight: 700,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },

  formTitle: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 800,
    fontSize: '36px',
    color: '#0f172a',
    letterSpacing: '-0.035em',
    lineHeight: 1.1,
    margin: 0,
  },
  formSub: {
    marginTop: '10px',
    marginBottom: '32px',
    color: '#64748b',
    fontSize: '14.5px',
    lineHeight: 1.6,
    fontWeight: 400,
  },

  fieldGroup: { marginBottom: '20px' },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 10px',
    display: 'block',
    letterSpacing: '-0.005em',
  },
  fieldWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    border: '1.5px solid #e7e2d6',
    borderRadius: '12px',
    transition: 'border-color 0.22s, box-shadow 0.22s',
  },
  fieldIcon: {
    position: 'absolute',
    left: '17px',
    pointerEvents: 'none',
    transition: 'color 0.22s',
    zIndex: 1,
  },
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 17px 16px 52px',
    fontSize: '14.5px',
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
  errMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11.5px',
    color: '#ef4444',
    margin: '8px 0 0',
    fontWeight: 600,
  },
  capsWarn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11.5px',
    color: '#f59e0b',
    margin: '8px 0 0',
    fontWeight: 600,
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    padding: '7px',
    borderRadius: '8px',
    zIndex: 1,
  },

  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '6px',
    marginBottom: '22px',
  },
  forgot: {
    fontSize: '13.5px',
    color: '#ea580c',
    fontWeight: 700,
    textDecoration: 'none',
  },

  submit: {
    width: '100%',
    border: 'none',
    borderRadius: '12px',
    padding: '17px',
    background:
      'linear-gradient(135deg, #fb923c 0%, #f97316 45%, #ea580c 100%)',
    color: '#fff',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '15.5px',
    letterSpacing: '0.2px',
    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow:
      '0 16px 36px -14px rgba(234,88,12,0.6), 0 6px 16px -6px rgba(234,88,12,0.4)',
    cursor: 'pointer',
    position: 'relative',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    margin: '26px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background:
      'linear-gradient(90deg, transparent, #d6d1c5 20%, #d6d1c5 80%, transparent)',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '1.8px',
  },

  socialRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '26px',
  },
  socialBtn: {
    flex: 1,
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    padding: '14px 16px',
    background: '#ffffff',
    border: '1.5px solid #e7e2d6',
    borderRadius: '12px',
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#0f172a',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px -6px rgba(15,23,42,0.08)',
  },

  trustFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    paddingTop: '20px',
    borderTop: '1px solid #efe6d6',
  },
  trustText: {
    fontSize: '12.5px',
    color: '#94a3b8',
    fontWeight: 600,
  },
};