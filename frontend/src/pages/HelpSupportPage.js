import React, { useState } from 'react';
import {
  Headphones, Phone, Mail, MessageCircle, ChevronDown,
  Send, Loader, HelpCircle, Ticket, CreditCard, RefreshCcw, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

/*
  HelpSupportPage.js  —  LIGHT THEME REDESIGN
  ---------------------------------------------------------
  Place in: /frontend/src/pages/HelpSupportPage.js
  Route:    <Route path="/help" element={<WithLayout><HelpSupportPage/></WithLayout>}/>

  Live Chat button dispatches the same 'open-busgo-chat' custom
  event your LiveChatWidget already listens for.
*/

const FAQ_CATEGORIES = [
  {
    key: 'booking', label: 'Booking', icon: Ticket,
    faqs: [
      { q: 'How do I book a bus ticket?', a: 'Search your route on the Search page, pick a bus, select your seats, fill passenger details, and pay via Razorpay. Your e-ticket is generated instantly.' },
      { q: 'Can I book for someone else?', a: 'Yes — just enter their name, age, and gender in the passenger details step. The ticket and confirmation will still go to your account.' },
      { q: 'How many seats can I book at once?', a: 'Up to 6 seats in a single booking. For larger groups, make a second booking or use the Group Travel discount if available.' },
    ],
  },
  {
    key: 'payment', label: 'Payment', icon: CreditCard,
    faqs: [
      { q: 'What payment methods are supported?', a: 'Cards, UPI, Net Banking, and wallets — all processed securely through Razorpay.' },
      { q: 'My payment was deducted but booking failed. What now?', a: 'This is rare, but if it happens the amount is auto-refunded within 5–7 working days. Contact support with your transaction ID if it takes longer.' },
      { q: 'Can I apply a coupon code?', a: 'Yes — enter it at checkout before payment. Check the Offers page for currently active codes.' },
    ],
  },
  {
    key: 'cancellation', label: 'Cancellation', icon: RefreshCcw,
    faqs: [
      { q: 'How do I cancel my ticket?', a: 'Go to My Bookings → select your booking → Cancel. Refund is processed in 5–7 working days.' },
      { q: 'Is there a cancellation fee?', a: 'A small percentage may be deducted depending on how close to departure you cancel. The exact refund amount is shown before you confirm.' },
      { q: 'Can I reschedule instead of cancelling?', a: 'Rescheduling isn\u2019t automatic yet — cancel and rebook for a different date, subject to the cancellation policy above.' },
    ],
  },
  {
    key: 'tracking', label: 'Live Tracking', icon: MapPin,
    faqs: [
      { q: 'Can I track my bus live?', a: 'Yes — use the Track Bus page and enter your PNR to see real-time GPS location, ETA, and route progress.' },
      { q: 'Why isn\u2019t my bus showing on the map?', a: 'Live tracking activates closer to departure time. If it\u2019s still not showing within an hour of departure, contact support.' },
    ],
  },
];

export default function HelpSupportPage() {
  const [activeCat, setActiveCat] = useState('booking');
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const openLiveChat = () => {
    document.dispatchEvent(new CustomEvent('open-busgo-chat'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in name, email and message');
      return;
    }
    setSending(true);
    try {
      await new Promise((res) => setTimeout(res, 900));
      toast.success('Message sent! We\u2019ll get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const activeFaqs = FAQ_CATEGORIES.find(c => c.key === activeCat)?.faqs || [];

  const inp = {
    width: '100%',
    background: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '12px 15px',
    color: '#0f172a',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Inter',sans-serif",
    transition: 'border-color .2s, box-shadow .2s',
  };

  const contactCards = [
    { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with our support team right now', action: openLiveChat, color: '#8b5cf6', bg: '#f5f3ff', cta: 'Start Chat' },
    { icon: Phone, title: 'Call Us', desc: '1800-BUS-GO · 24/7 toll-free', action: () => window.open('tel:1800287646'), color: '#16a34a', bg: '#f0fdf4', cta: 'Call Now' },
    { icon: Mail, title: 'Email Us', desc: 'support@busgo.com', action: () => window.open('mailto:support@busgo.com'), color: '#2563eb', bg: '#eff6ff', cta: 'Send Email' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 320px, #ffffff 100%)',
      paddingTop: 90, paddingBottom: 90,
      color: '#0f172a',
      fontFamily: "'Inter',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes helpSpin { to { transform: rotate(360deg); } }
        @keyframes helpFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

        .hs-inp:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 4px rgba(249,115,22,0.12) !important;
        }
        .hs-card {
          transition: transform .28s cubic-bezier(.4,0,.2,1), box-shadow .28s;
        }
        .hs-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -12px rgba(15,23,42,0.15);
        }
        .hs-faq-item {
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .hs-faq-item:hover {
          border-color: #fdba74 !important;
          box-shadow: 0 4px 16px -6px rgba(249,115,22,0.2);
        }
        .hs-tab {
          transition: all .2s ease;
        }
        .hs-tab:hover {
          transform: translateY(-2px);
        }
        .hs-submit {
          transition: transform .2s, box-shadow .2s, background .2s;
        }
        .hs-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -8px rgba(249,115,22,0.5);
          background: #ea580c !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '0 24px 52px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fff7ed', border: '1px solid #fed7aa',
          color: '#ea580c', padding: '7px 18px', borderRadius: 50,
          fontSize: 11.5, fontWeight: 700, letterSpacing: '1.5px',
          marginBottom: 22, boxShadow: '0 2px 12px -4px rgba(249,115,22,0.25)',
        }}>
          <Headphones size={13} /> WE'RE HERE TO HELP
        </div>
        <h1 style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 'clamp(30px,4vw,46px)',
          fontWeight: 800, marginBottom: 14,
          color: '#0f172a', letterSpacing: '-0.5px',
        }}>
          Help & <span style={{
            background: 'linear-gradient(135deg, #f97316, #fb923c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Support</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 15.5, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
          Browse common questions below, or reach our team directly — we usually reply within a few hours.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>

        {/* Quick contact cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginBottom: 64 }}>
          {contactCards.map(({ icon: Icon, title, desc, action, color, bg, cta }) => (
            <div key={title} onClick={action}
              className="hs-card"
              style={{
                background: '#ffffff',
                border: '1.5px solid #f1f5f9',
                borderRadius: 18,
                padding: '26px 22px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px -4px rgba(15,23,42,0.06)',
              }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 7, color: '#0f172a' }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.55 }}>{desc}</p>
              <span style={{ fontSize: 12.5, fontWeight: 700, color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {cta} <span style={{ fontSize: 14 }}>→</span>
              </span>
            </div>
          ))}
        </div>

        {/* FAQ section */}
        <div style={{ marginBottom: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: '#fff7ed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HelpCircle size={19} color="#f97316" />
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 23, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Frequently Asked Questions
            </h2>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {FAQ_CATEGORIES.map(c => {
              const Icon = c.icon;
              const active = activeCat === c.key;
              return (
                <button key={c.key}
                  className="hs-tab"
                  onClick={() => { setActiveCat(c.key); setOpenFaq(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 11,
                    border: `1.5px solid ${active ? '#f97316' : '#e2e8f0'}`,
                    background: active ? 'linear-gradient(135deg, #f97316, #fb923c)' : '#ffffff',
                    color: active ? '#ffffff' : '#475569',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    boxShadow: active ? '0 6px 16px -6px rgba(249,115,22,0.5)' : '0 1px 3px rgba(15,23,42,0.04)',
                  }}>
                  <Icon size={14} /> {c.label}
                </button>
              );
            })}
          </div>

          {/* FAQ list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeFaqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i}
                  className="hs-faq-item"
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${open ? '#fdba74' : '#f1f5f9'}`,
                    borderRadius: 14, overflow: 'hidden',
                    boxShadow: open ? '0 8px 24px -10px rgba(249,115,22,0.25)' : '0 1px 3px rgba(15,23,42,0.04)',
                  }}>
                  <button onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14,
                    }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: '#0f172a', textAlign: 'left' }}>{f.q}</span>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                      background: open ? '#f97316' : '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .25s',
                    }}>
                      <ChevronDown size={15} color={open ? '#fff' : '#f97316'}
                        style={{ transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'none' }} />
                    </div>
                  </button>
                  {open && (
                    <div style={{
                      padding: '0 22px 20px', color: '#64748b', fontSize: 13.5, lineHeight: 1.8,
                      animation: 'helpFadeIn .25s ease',
                    }}>
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact form */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #f1f5f9',
          borderRadius: 22,
          padding: '38px 32px',
          boxShadow: '0 20px 50px -20px rgba(15,23,42,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative gradient blob */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Still need help?
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Send us a message and our support team will respond within 24 hours.
          </p>

          <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Name *</label>
                <input className="hs-inp" style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Email *</label>
                <input className="hs-inp" style={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Subject</label>
              <input className="hs-inp" style={inp} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Message *</label>
              <textarea className="hs-inp" style={{ ...inp, resize: 'vertical', minHeight: 120, fontFamily: "'Inter',sans-serif" }}
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us what's going on..." />
            </div>
            <button type="submit" disabled={sending}
              className="hs-submit"
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: sending ? '#94a3b8' : 'linear-gradient(135deg, #f97316, #fb923c)',
                color: '#fff', border: 'none',
                borderRadius: 11, padding: '13px 30px',
                fontSize: 14, fontWeight: 700,
                cursor: sending ? 'not-allowed' : 'pointer',
                fontFamily: "'Syne',sans-serif",
                boxShadow: sending ? 'none' : '0 8px 20px -8px rgba(249,115,22,0.6)',
              }}>
              {sending
                ? <><Loader size={15} style={{ animation: 'helpSpin 1s linear infinite' }} /> Sending...</>
                : <><Send size={15} /> Send Message</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}