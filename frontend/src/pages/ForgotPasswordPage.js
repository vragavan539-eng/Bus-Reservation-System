import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bus, Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { api } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error('Enter the OTP sent to your email');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email: email.trim(), otp: otp.trim(), password });
      localStorage.setItem('busgo_token', data.token);
      toast.success('Password reset! You\'re logged in.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const inputWrap = { position: 'relative', display: 'flex', alignItems: 'center' };
  const inputStyle = {
    width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 12, padding: '12px 14px 12px 42px', fontSize: 14, color: '#0f172a', outline: 'none',
    fontFamily: "'Inter',sans-serif",
  };
  const iconStyle = { position: 'absolute', left: 14, color: '#94a3b8', pointerEvents: 'none' };
  const label = { fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 7, display: 'block' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 20% 20%, #fff7ed 0%, #f8fafc 45%)', padding: 24, fontFamily: "'Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, boxShadow: '0 30px 80px -20px rgba(15,23,42,0.18)', padding: '40px 36px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bus size={19} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, color: '#0f172a' }}>Bus<span style={{ color: '#f97316' }}>Go</span></span>
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#0f172a', textAlign: 'center', margin: '0 0 6px' }}>
          {step === 1 ? 'Forgot your password?' : 'Enter OTP & new password'}
        </h1>
        <p style={{ fontSize: 13.5, color: '#94a3b8', textAlign: 'center', margin: '0 0 26px' }}>
          {step === 1 ? "We'll send a one-time code to your email" : `A 6-digit code was sent to ${email}`}
        </p>

        {step === 1 ? (
          <form onSubmit={requestOtp}>
            <div style={{ marginBottom: 18 }}>
              <label style={label}>Email Address</label>
              <div style={inputWrap}>
                <Mail size={16} style={iconStyle} />
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} autoFocus />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: '13.5px', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14.5,
              opacity: loading ? 0.6 : 1, boxShadow: '0 14px 28px -10px rgba(234,88,12,0.5)',
            }}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>OTP Code</label>
              <div style={inputWrap}>
                <KeyRound size={16} style={iconStyle} />
                <input type="text" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)} style={inputStyle} maxLength={6} autoFocus />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>New Password</label>
              <div style={inputWrap}>
                <Lock size={16} style={iconStyle} />
                <input type={show ? 'text' : 'password'} placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {show ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Confirm New Password</label>
              <div style={inputWrap}>
                <Lock size={16} style={iconStyle} />
                <input type={show ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', border: 'none', borderRadius: 12, padding: '13.5px', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14.5,
              opacity: loading ? 0.6 : 1, boxShadow: '0 14px 28px -10px rgba(234,88,12,0.5)',
            }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', fontSize: 12.5, marginTop: 14, cursor: 'pointer' }}>
              Wrong email? Go back
            </button>
          </form>
        )}

        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}