import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag, Percent, Copy, Check, Sparkles, Users, Calendar,
  GraduationCap, Gift, ArrowRight, Clock, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

/*
  OffersPage.js
  ---------------------------------------------------------
  Place in: /frontend/src/pages/OffersPage.js
  Route:    <Route path="/offers" element={<WithLayout><OffersPage/></WithLayout>}/>

  Navbar: add a link next to Home / Search / Track Bus:
    <NavLink to="/offers">Offers</NavLink>

  Pulls the same coupon set shown on HomePage's "Special Offers"
  section, expanded into a full browsable page with category
  filters. If you later move coupons to the backend (an
  AdminCoupons-driven API), swap the OFFERS constant below for a
  fetch call — the rest of the page works unchanged.
*/

const CATEGORIES = [
  { key: 'all',       label: 'All Offers',  icon: Sparkles },
  { key: 'new-user',  label: 'New User',    icon: Gift },
  { key: 'weekend',   label: 'Weekend',     icon: Calendar },
  { key: 'student',   label: 'Student',     icon: GraduationCap },
  { key: 'member',    label: 'Members',     icon: Users },
];

const OFFERS = [
  {
    code: 'FIRST50', category: 'new-user',
    title: 'First Booking Offer',
    desc: '50% off on your very first bus booking with BusGo.',
    discount: '50% OFF', maxDiscount: 'Up to ₹300',
    color: '#f97316', bg: '#fff7ed', border: '#fed7aa',
    valid: 'Valid till 31 Dec 2026',
    terms: ['Applicable only on first booking per account', 'Minimum fare ₹200'],
  },
  {
    code: 'BUSPASS', category: 'member',
    title: 'BusPass Members',
    desc: 'Flat ₹100 off for registered BusPass members on any route.',
    discount: '₹100 OFF', maxDiscount: null,
    color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe',
    valid: 'Valid till 31 Jan 2027',
    terms: ['Requires active BusPass membership', 'One use per booking'],
  },
  {
    code: 'WEEKEND', category: 'weekend',
    title: 'Weekend Saver',
    desc: '25% off on all Saturday & Sunday bookings across Tamil Nadu.',
    discount: '25% OFF', maxDiscount: 'Up to ₹200',
    color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0',
    valid: 'Every Weekend',
    terms: ['Travel date must fall on Sat or Sun', 'Not combinable with other offers'],
  },
  {
    code: 'STUDENT', category: 'student',
    title: 'Student Discount',
    desc: 'Extra 15% off with a valid student ID uploaded at checkout.',
    discount: '15% OFF', maxDiscount: 'Up to ₹150',
    color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
    valid: 'Year Round',
    terms: ['Valid student ID required', 'Applicable on AC & Non-AC routes'],
  },
  {
    code: 'FESTIVAL30', category: 'new-user',
    title: 'Festival Season Special',
    desc: 'Up to 30% off for Deepavali, Pongal & Christmas travel.',
    discount: '30% OFF', maxDiscount: 'Up to ₹350',
    color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8',
    valid: 'Seasonal — check dates',
    terms: ['Applies to festival travel windows only', 'Limited seats per route'],
  },
  {
    code: 'GROUP5', category: 'member',
    title: 'Group Travel Discount',
    desc: '10% off when booking 5 or more seats in a single transaction.',
    discount: '10% OFF', maxDiscount: null,
    color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
    valid: 'Year Round',
    terms: ['Minimum 5 passengers in one booking', 'All seats must be on the same bus'],
  },
];

export default function OffersPage() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  const filtered = useMemo(
    () => activeCat === 'all' ? OFFERS : OFFERS.filter(o => o.category === activeCat),
    [activeCat]
  );

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`${code} copied!`);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter',sans-serif", paddingTop: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes offersFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg,#ea580c 0%,#f97316 45%,#fb923c 75%,#f59e0b 100%)',
        padding: '64px 24px 72px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -50, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '7px 18px', borderRadius: 50,
            fontSize: 12.5, fontWeight: 700, letterSpacing: '1.5px', marginBottom: 20,
          }}>
            <Percent size={13} /> SAVE ON EVERY TRIP
          </div>
          <h1 style={{
            fontFamily: "'Syne',sans-serif", fontSize: 'clamp(32px,4.5vw,48px)', fontWeight: 800,
            color: '#fff', letterSpacing: '-1.2px', marginBottom: 14, lineHeight: 1.1,
          }}>
            Offers & Coupons
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Apply these codes at checkout and stack up your savings on every BusGo booking.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 0' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIES.map(c => {
            const Icon = c.icon;
            const active = activeCat === c.key;
            return (
              <button key={c.key} onClick={() => setActiveCat(c.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '10px 18px', borderRadius: 50,
                  border: `1.5px solid ${active ? '#f97316' : '#e5e7eb'}`,
                  background: active ? '#f97316' : '#fff',
                  color: active ? '#fff' : '#64748b',
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                  transition: 'all .2s', fontFamily: "'Inter',sans-serif",
                }}>
                <Icon size={14} /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Offers grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            No offers in this category right now.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 20 }}>
            {filtered.map((o, i) => (
              <div key={o.code}
                style={{
                  background: '#fff', border: `1.5px solid ${o.border}`, borderRadius: 20,
                  padding: '26px 24px', boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
                  transition: 'all .3s', animation: `offersFadeUp .5s ease ${i * 0.06}s both`,
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = `0 20px 48px ${o.color}20`; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,23,42,0.04)'; e.currentTarget.style.transform = 'none'; }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16.5, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                      {o.title}
                    </div>
                    <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>{o.desc}</div>
                  </div>
                  <div style={{
                    background: o.bg, color: o.color, fontSize: 13, fontWeight: 800,
                    borderRadius: 10, padding: '7px 11px', whiteSpace: 'nowrap',
                    fontFamily: "'Syne',sans-serif", flexShrink: 0, marginLeft: 10,
                  }}>
                    {o.discount}
                  </div>
                </div>

                {o.maxDiscount && (
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 12, fontWeight: 500 }}>
                    {o.maxDiscount}
                  </div>
                )}

                <div style={{
                  background: o.bg, border: `1.5px dashed ${o.border}`, borderRadius: 12,
                  padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 14,
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: o.color, letterSpacing: '2px' }}>
                    {o.code}
                  </span>
                  <button onClick={() => copyCode(o.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: copiedCode === o.code ? '#22c55e' : o.color,
                      color: '#fff', border: 'none', borderRadius: 8,
                      padding: '6px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      transition: 'background .2s',
                    }}>
                    {copiedCode === o.code ? <Check size={12} /> : <Copy size={12} />}
                    {copiedCode === o.code ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#94a3b8', marginBottom: 12 }}>
                  <Clock size={12} /> {o.valid}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  {o.terms.map((t, ti) => (
                    <div key={ti} style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', gap: 6, marginBottom: 4 }}>
                      <span>•</span><span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to use */}
      <section style={{ background: '#f8fafc', padding: '70px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316', letterSpacing: '2px', textTransform: 'uppercase' }}>
            How It Works
          </span>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '10px 0 44px' }}>
            Redeem a Code in 3 Steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
            {[
              { icon: Tag, title: 'Copy a Code', desc: 'Pick an offer above and copy the coupon code.' },
              { icon: Zap, title: 'Search & Select', desc: 'Find your bus and proceed to checkout as usual.' },
              { icon: Percent, title: 'Apply & Save', desc: 'Paste the code at payment and watch the discount apply.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 60, height: 60, background: '#fff7ed', border: '2px solid #fed7aa',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={24} color="#f97316" />
                </div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15.5, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
                <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.6, maxWidth: 220 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '70px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
          Ready to save on your next trip?
        </h2>
        <button onClick={() => navigate('/search')}
          style={{
            background: 'linear-gradient(135deg,#f97316,#ea6c0a)', color: '#fff', border: 'none',
            borderRadius: 50, padding: '15px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 26px rgba(249,115,22,0.35)',
          }}>
          Search Buses Now <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}