import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { routeAPI } from '../services/api';
import { Shield, Clock, Star, Headphones, Map as MapIcon, Award, ChevronDown, Wallet as WalletIcon, Tag, Bell, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LiveChatWidget from '../components/LiveChatWidget';

const cities = ['Chennai','Coimbatore','Madurai','Trichy','Salem','Vellore','Pondicherry','Tirunelveli','Erode','Kanyakumari'];

const HERO_SLIDES = [
  { img: '/bus1.jpg', tag: '🚌 Tamil Nadu Express', headline: 'Travel Smarter,', sub: 'Book Faster.', accent: '#f97316' },
  { img: '/bus2.jpg', tag: '⚡ Instant Booking',    headline: 'Comfort Every',   sub: 'Mile.',        accent: '#f97316' },
  { img: '/bus3.jpg', tag: '📍 500+ Routes',        headline: 'Across Tamil',    sub: 'Nadu.',        accent: '#f97316' },
];

function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0); const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let v = 0; const step = target / 80;
      const t = setInterval(() => { v += step; if (v >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(v)); }, 16);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function FeatureCard({ Icon, color, title, desc, delay }) {
  const [vis, setVis] = useState(false); const [hov, setHov] = useState(false); const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => setVis(true), delay); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? `linear-gradient(135deg,${color}10,#fff)` : '#ffffff',
      border: `1.5px solid ${hov ? color + '35' : '#e2e8f0'}`,
      borderRadius: 18, padding: '28px 24px',
      boxShadow: hov ? `0 20px 48px ${color}14, 0 4px 16px rgba(0,0,0,0.05)` : '0 2px 10px rgba(0,0,0,0.05)',
      transform: vis ? (hov ? 'translateY(-7px)' : 'translateY(0)') : 'translateY(30px)',
      opacity: vis ? 1 : 0, transition: 'all .5s cubic-bezier(.34,1.56,.64,1)',
    }}>
      <div style={{ width: 54, height: 54, background: `${color}12`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, transform: hov ? 'scale(1.12) rotate(-5deg)' : 'scale(1)', transition: 'transform .3s' }}>
        <Icon size={24} color={color} />
      </div>
      <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>{title}</h3>
      <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

function RouteCard({ from, to, price, duration, img, onClick, delay }) {
  const [vis, setVis] = useState(false); const [hov, setHov] = useState(false); const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => setVis(true), delay); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      borderRadius: 18, overflow: 'hidden', cursor: 'pointer', background: '#fff',
      border: `1.5px solid ${hov ? '#f97316' : '#e2e8f0'}`,
      boxShadow: hov ? '0 24px 56px rgba(249,115,22,0.15)' : '0 2px 10px rgba(0,0,0,0.05)',
      transform: vis ? (hov ? 'translateY(-8px) scale(1.02)' : 'translateY(0)') : 'translateY(36px) scale(.97)',
      opacity: vis ? 1 : 0, transition: 'all .5s cubic-bezier(.34,1.56,.64,1)',
    }}>
      <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        <img src={img} alt={`${from} to ${to}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .6s', transform: hov ? 'scale(1.08)' : 'scale(1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: hov ? 'linear-gradient(to top,rgba(249,115,22,0.38),transparent)' : 'linear-gradient(to top,rgba(0,0,0,0.42),transparent)', transition: '.3s' }} />
        {hov && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#f97316', color: '#fff', borderRadius: 50, padding: '10px 26px', fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif", boxShadow: '0 8px 24px rgba(249,115,22,0.4)' }}>Book Now →</div>
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#16a34a' }}>✓ Available</div>
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#fff' }}>⏱ {duration}</div>
      </div>
      <div style={{ padding: '16px 20px', background: '#fff' }}>
        <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>{from} → {to}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>AC / Sleeper / Volvo</span>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700, color: '#f97316' }}>₹{price}</span>
        </div>
      </div>
    </div>
  );
}

function CustomSelect({ value, onChange, options, label }) {
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
    if (!open) return;
    const close = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (listRef.current?.contains(e.target)) return;
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
      <button ref={btnRef} type="button" onClick={() => (open ? setOpen(false) : openDropdown())} style={{
        width: '100%', height: 44, padding: '0 34px 0 14px', boxSizing: 'border-box',
        background: '#fff', border: `1.5px solid ${open ? '#f97316' : '#e2e8f0'}`, borderRadius: 10,
        color: '#1e293b', fontSize: 14, fontFamily: "'Inter',sans-serif", textAlign: 'left',
        cursor: 'pointer', position: 'relative', display: 'block',
        boxShadow: open ? '0 0 0 3px rgba(249,115,22,0.14)' : 'none', transition: 'all .2s',
      }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        <ChevronDown size={16} color="#94a3b8" style={{
          position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: 'transform .2s',
        }} />
      </button>
      {open && createPortal(
        <div ref={listRef} style={{
          position: 'fixed', top: coords.top, left: coords.left, width: coords.width,
          maxHeight: 260, overflowY: 'auto', zIndex: 9999,
          background: '#fff', borderRadius: 12, border: '1.5px solid #fed7aa',
          boxShadow: '0 20px 50px rgba(15,23,42,0.25)', padding: 6,
        }}>
          {options.map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{
              padding: '9px 12px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
              background: opt === value ? '#fff7ed' : 'transparent',
              color: opt === value ? '#f97316' : '#1e293b', fontWeight: opt === value ? 600 : 400,
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = opt === value ? '#fff7ed' : '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = opt === value ? '#fff7ed' : 'transparent'}>
              {opt}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

function BusScene({ accent }) {
  const color = accent || '#f97316';
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
      <style>{`
        @keyframes busRoll   { 0%{transform:translateX(110vw)} 100%{transform:translateX(-380px)} }
        @keyframes busRoll2  { 0%{transform:translateX(110vw)} 100%{transform:translateX(-250px)} }
        @keyframes cloudDrift{ 0%{transform:translateX(110vw)} 100%{transform:translateX(-250px)} }
        @keyframes dashMove  { 0%{transform:translateX(0)}     100%{transform:translateX(-200px)} }
        @keyframes twinkle   { 0%,100%{opacity:.2} 50%{opacity:.9} }
        @keyframes glowPulse { 0%,100%{opacity:.25} 50%{opacity:.45} }
        .bus1 { animation: busRoll  14s linear infinite; }
        .bus2 { animation: busRoll2 20s linear infinite 7s; }
        .cld  { animation: cloudDrift 30s linear infinite; }
        .dash { animation: dashMove 1.2s linear infinite; }
      `}</style>

      {/* Stars */}
      {[...Array(35)].map((_,i)=>(
        <div key={i} style={{
          position:'absolute', borderRadius:'50%', background:'#fff',
          width: i%5===0?3:2, height: i%5===0?3:2,
          top:`${(Math.sin(i*2.4)*35)+20}%`,
          left:`${(i*71.3)%100}%`,
          animation:`twinkle ${2.5+i%4}s ease-in-out ${i*0.25}s infinite`
        }}/>
      ))}

      {/* Glow orb */}
      <div style={{
        position:'absolute', top:'8%', right:'15%',
        width:100, height:100, borderRadius:'50%',
        background:color, filter:'blur(2px)',
        boxShadow:`0 0 80px 40px ${color}`,
        animation:'glowPulse 4s ease-in-out infinite', opacity:.3
      }}/>

      {/* Mountain silhouettes */}
      <svg style={{position:'absolute',bottom:'16%',width:'100%',left:0}} height="180" viewBox="0 0 1440 180" preserveAspectRatio="none">
        <polygon points="0,180 200,30 400,180"   fill="rgba(255,255,255,0.05)"/>
        <polygon points="150,180 400,10  650,180" fill="rgba(255,255,255,0.07)"/>
        <polygon points="450,180 680,40  900,180" fill="rgba(255,255,255,0.05)"/>
        <polygon points="720,180 960,20 1200,180" fill="rgba(255,255,255,0.06)"/>
        <polygon points="980,180 1210,50 1440,180" fill="rgba(255,255,255,0.05)"/>
      </svg>

      {/* Road */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'16%'}}>
        <div style={{
          position:'absolute',bottom:0,left:0,right:0,height:'75%',
          background:'#12141f',
          borderTop:`2px solid ${color}55`
        }}>
          {/* Dashes */}
          <div className="dash" style={{
            position:'absolute', top:'42%', left:0,
            display:'flex', gap:36, whiteSpace:'nowrap'
          }}>
            {[...Array(25)].map((_,i)=>(
              <div key={i} style={{width:80,height:5,borderRadius:3,background:'rgba(255,200,0,0.55)',flexShrink:0}}/>
            ))}
          </div>
        </div>
      </div>

      {/* Cloud */}
      <div className="cld" style={{position:'absolute',top:'12%',right:0,opacity:.12}}>
        <svg width="220" height="75" viewBox="0 0 220 75">
          <ellipse cx="110" cy="55" rx="100" ry="28" fill="white"/>
          <ellipse cx="75"  cy="42" rx="60"  ry="30" fill="white"/>
          <ellipse cx="145" cy="40" rx="55"  ry="28" fill="white"/>
          <ellipse cx="110" cy="32" rx="48"  ry="26" fill="white"/>
        </svg>
      </div>

      {/* Main Bus */}
      <div className="bus1" style={{position:'absolute', bottom:'13%', left:0}}>
        <svg width="340" height="115" viewBox="0 0 340 115">
          {/* Shadow */}
          <ellipse cx="170" cy="112" rx="155" ry="8" fill="rgba(0,0,0,0.4)"/>
          {/* Body */}
          <rect x="8" y="12" width="310" height="74" rx="14" fill="#1a2d4a"/>
          {/* Top shine */}
          <rect x="8" y="12" width="310" height="20" rx="14" fill="rgba(255,255,255,0.06)"/>
          {/* Color stripe */}
          <rect x="8" y="47" width="310" height="11" fill={color}/>
          {/* Windows row */}
          {[35,85,135,185,235].map((x,i)=>(
            <g key={i}>
              <rect x={x} y="18" width="42" height="24" rx="5" fill="rgba(147,210,255,0.75)"/>
              <rect x={x+3} y="21" width="12" height="9" rx="2" fill="rgba(255,255,255,0.4)"/>
            </g>
          ))}
          {/* Driver cab */}
          <rect x="278" y="16" width="34" height="28" rx="5" fill="rgba(147,210,255,0.85)"/>
          <rect x="281" y="19" width="10" height="8" rx="2" fill="rgba(255,255,255,0.5)"/>
          {/* Headlight glow */}
          <rect x="310" y="22" width="12" height="9" rx="3" fill="#fbbf24"/>
          <ellipse cx="316" cy="26" rx="10" ry="7" fill="#fbbf24" opacity=".3" style={{filter:'blur(4px)'}}/>
          {/* Tail light */}
          <rect x="4"   y="28" width="9" height="12" rx="3" fill="#ef4444"/>
          {/* Front bumper */}
          <rect x="308" y="76" width="14" height="8" rx="3" fill={color}/>
          {/* Wheels */}
          {[62,260].map((cx,i)=>(
            <g key={i}>
              <circle cx={cx} cy="95" r="19" fill="#0d1117"/>
              <circle cx={cx} cy="95" r="19" stroke={color} strokeWidth="3.5" fill="none"/>
              <circle cx={cx} cy="95" r="9"  fill="#1f2937"/>
              <circle cx={cx} cy="95" r="4"  fill={color}/>
              {[0,72,144,216,288].map(deg=>(
                <line key={deg}
                  x1={cx} y1={95}
                  x2={cx+Math.cos(deg*Math.PI/180)*14}
                  y2={95+Math.sin(deg*Math.PI/180)*14}
                  stroke={color} strokeWidth="1.5" opacity=".5"/>
              ))}
            </g>
          ))}
          {/* Number plate */}
          <rect x="110" y="83" width="80" height="16" rx="4" fill="#fbbf24"/>
          <text x="150" y="95" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#000">TN 01 AB 1234</text>
          {/* Destination board */}
          <rect x="14" y="13" width="90" height="13" rx="3" fill="rgba(0,0,0,0.55)"/>
          <text x="59" y="23" textAnchor="middle" fontSize="7.5" fill={color} fontWeight="bold">CHENNAI EXPRESS</text>
        </svg>
      </div>

      {/* BG Small Bus */}
      <div className="bus2" style={{position:'absolute', bottom:'14.5%', left:0, opacity:.35}}>
        <svg width="200" height="72" viewBox="0 0 200 72">
          <rect x="5" y="8" width="185" height="44" rx="9" fill="#0f2234"/>
          <rect x="5" y="28" width="185" height="7" fill={color} opacity=".8"/>
          {[20,60,100,140].map((x,i)=>(
            <rect key={i} x={x} y="13" width="26" height="14" rx="3" fill="rgba(147,210,255,0.6)"/>
          ))}
          <circle cx="38"  cy="59" r="12" fill="#0d1117" stroke={color} strokeWidth="2.5"/>
          <circle cx="155" cy="59" r="12" fill="#0d1117" stroke={color} strokeWidth="2.5"/>
          <circle cx="38"  cy="59" r="5"  fill={color}/>
          <circle cx="155" cy="59" r="5"  fill={color}/>
        </svg>
      </div>
    </div>
  );
}

function CityCard({ d, navigate }) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const [hov, setHov] = React.useState(false);

  return (
    <div onClick={() => navigate('/search')}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        position: 'relative', height: 220, transition: 'all .35s',
        background: d.grad,
        boxShadow: hov ? '0 28px 60px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.15)',
        transform: hov ? 'translateY(-8px) scale(1.02)' : 'none',
      }}>
      {!imgError && (
        <img
          src={d.img}
          alt={d.city}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', transition: 'transform .5s, opacity .4s',
            transform: hov ? 'scale(1.08)' : 'scale(1)',
            opacity: imgLoaded ? 1 : 0,
          }}
        />
      )}
      {(imgError || !imgLoaded) && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: d.pattern }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 52, lineHeight: 1 }}>{d.icon}</div>
        </>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 2, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>{d.city}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>{d.detail}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>{d.tag}</span>
          <span style={{ fontSize: 11, background: '#f97316', color: '#fff', borderRadius: 20, padding: '3px 10px', fontWeight: 700 }}>{d.routes} routes</span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: 'Chennai', to: 'Coimbatore', date: new Date().toISOString().split('T')[0] });
  const [busType, setBusType] = useState('');
  const [popular, setPopular] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [heroVis, setHeroVis] = useState(false);
  const [slide, setSlide] = useState(0);
  const [slideFade, setSlideFade] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setTimeout(() => setHeroVis(true), 100);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    routeAPI.popular().then(r => setPopular(r.data.routes)).catch(() => {});
    const timer = setInterval(() => {
      setSlideFade(false);
      setTimeout(() => { setSlide(s => (s + 1) % HERO_SLIDES.length); setSlideFade(true); }, 650);
    }, 5000);
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(timer); };
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (form.from === form.to) { toast.error('Source and destination cannot be same!'); return; }
    navigate(`/search?from=${form.from}&to=${form.to}&date=${form.date}&busType=${busType}`);
  };
  const swap = () => setForm(f => ({ ...f, from: f.to, to: f.from }));

  const mockRoutes = [
    { from: 'Chennai',    to: 'Coimbatore', price: 450, duration: '8h',   img: 'https://media.licdn.com/dms/image/v2/C4E12AQGmIluMk0G6GA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520238944692?e=2147483647&v=beta&t=pYZiKqRVUWP0vq0UDPY_-kRGwRbYQUYK1sgBoBjVib4S' },
    { from: 'Chennai',    to: 'Madurai',    price: 650, duration: '8.5h', img: 'https://static.vecteezy.com/system/resources/thumbnails/071/533/789/small/a-white-passenger-bus-traveling-on-a-highway-at-sunset-with-trees-in-the-background-on-a-clear-day-free-photo.jpeg' },
    { from: 'Chennai',    to: 'Trichy',     price: 550, duration: '6h',   img: 'https://static.vecteezy.com/system/resources/thumbnails/071/533/789/small/a-white-passenger-bus-traveling-on-a-highway-at-sunset-with-trees-in-the-background-on-a-clear-day-free-photo.jpeg' },
    { from: 'Madurai',    to: 'Chennai',    price: 700, duration: '8.5h', img: 'https://static.vecteezy.com/system/resources/thumbnails/071/533/789/small/a-white-passenger-bus-traveling-on-a-highway-at-sunset-with-trees-in-the-background-on-a-clear-day-free-photo.jpeg' },
    { from: 'Coimbatore', to: 'Chennai',    price: 500, duration: '8h',   img: 'https://static.vecteezy.com/system/resources/thumbnails/071/533/789/small/a-white-passenger-bus-traveling-on-a-highway-at-sunset-with-trees-in-the-background-on-a-clear-day-free-photo.jpeg' },
    { from: 'Chennai',    to: 'Salem',      price: 350, duration: '5h',   img: 'https://static.vecteezy.com/system/resources/thumbnails/071/533/789/small/a-white-passenger-bus-traveling-on-a-highway-at-sunset-with-trees-in-the-background-on-a-clear-day-free-photo.jpeg' },
  ];

  const displayRoutes = popular.length > 0
    ? popular.map(r => ({ from: r.from, to: r.to, price: r.basePrice, duration: r.duration, img: r.bus?.images?.[0] || mockRoutes[0].img }))
    : mockRoutes;

  const faqs = [
    { q: 'How do I cancel my ticket?', a: 'Go to My Bookings → select booking → Cancel. Refund processed in 5–7 working days.' },
    { q: 'Is there a luggage limit?',  a: 'Most operators allow 15–20 kg. Excess may attract extra charges.' },
    { q: 'Are the buses AC?',          a: 'We offer AC, Non-AC, Sleeper, Volvo and Luxury. Filter by type when searching.' },
    { q: 'Can I track my bus live?',   a: 'Yes! Use Track Bus feature. Get live GPS location 1 hour before departure.' },
  ];

  const cur = HERO_SLIDES[slide];

  const sInp = {
    width: '100%', height: 44, padding: '0 14px', boxSizing: 'border-box',
    background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10,
    color: '#1e293b', fontSize: 14, fontFamily: "'Inter',sans-serif",
    outline: 'none', transition: 'border-color .2s, box-shadow .2s',
    cursor: 'pointer',
  };
  const selectInp = {
    ...sInp,
    appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
    paddingRight: 34,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: 16,
  };

  const moduleCards = [
    { Icon: WalletIcon,     color: '#f97316', title: 'Wallet & Refunds', desc: 'Top up balance, pay instantly, get refunds credited automatically.', action: () => navigate('/wallet') },
    { Icon: Tag,            color: '#22c55e', title: 'Coupons & Offers', desc: 'Apply promo codes at checkout and stack up your savings.',            action: () => navigate('/search') },
    { Icon: Star,           color: '#f59e0b', title: 'Reviews & Ratings', desc: 'Read real traveller reviews before you book, leave your own after.', action: () => navigate('/search') },
    { Icon: Bell,           color: '#3b82f6', title: 'Smart Notifications', desc: 'Get instant alerts for bookings, delays, payments and refunds.',   action: () => navigate('/notifications') },
    { Icon: MessageCircle,  color: '#8b5cf6', title: 'Live Chat Support', desc: 'Chat with our support team in real time — tap the bubble anytime.',  action: () => document.dispatchEvent(new CustomEvent('open-busgo-chat')) },
  ];

  return (
    <div style={{ overflowX: 'hidden', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:none} }
        @keyframes fadeLeft { from{opacity:0;transform:translateX(-36px)} to{opacity:1;transform:none} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.25;transform:scale(2)} }
        @keyframes shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(220%)} }
        @keyframes gradS    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes zoomIn   { from{transform:scale(1.05)} to{transform:scale(1)} }
        @keyframes barSlide { from{width:0} to{width:100%} }
        .s-inp:focus { border-color:#f97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.14) !important; }
        .shim-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent); animation:shimmer 2.5s infinite; }
        select option { background:#fff; color:#1e293b; }
        .search-grid {
          display: grid;
          grid-template-columns: minmax(0,1fr) auto minmax(0,1fr) minmax(90px,110px) minmax(90px,110px) auto;
          gap: 8px;
          align-items: flex-end;
          min-width: 0;
        }
        .search-grid > div { min-width: 0; }
      `}</style>


      {/* ═══════════ HERO ═══════════ */}
      <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', paddingTop: 80, overflow: 'hidden' }}>

        <div key={slide} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${cur.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          opacity: slideFade ? 1 : 0,
          transition: 'opacity .7s ease',
          transform: `scale(1.04) translateY(${scrollY * 0.02}px)`,
        }} />

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(8,12,22,0.92) 0%, rgba(8,12,22,0.75) 40%, rgba(8,12,22,0.35) 70%, rgba(8,12,22,0.15) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,22,1) 0%, transparent 30%)' }} />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)', zIndex: 10 }}>
          <div key={`b${slide}`} style={{ height: '100%', background: 'linear-gradient(90deg,#f97316,#fbbf24)', animation: 'barSlide 5s linear forwards' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 32, right: 48, display: 'flex', gap: 8, zIndex: 10 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => { setSlideFade(false); setTimeout(() => { setSlide(i); setSlideFade(true); }, 650); }}
              style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === slide ? '#f97316' : 'rgba(255,255,255,0.28)', transition: 'all .4s', padding: 0 }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 5, maxWidth: 1240, margin: '0 auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: 680, width: '100%', boxSizing: 'border-box' }}>

            <div style={{ animation: heroVis ? 'fadeUp .7s ease both' : 'none', opacity: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.14)', border: '1px solid rgba(249,115,22,0.38)', color: '#fdba74', padding: '7px 18px', borderRadius: 50, fontSize: 13, fontWeight: 500, marginBottom: 24, backdropFilter: 'blur(8px)' }}>
                <span style={{ width: 7, height: 7, background: '#f97316', borderRadius: '50%', animation: 'pulse 1.8s infinite' }} />
                {cur.tag}
              </div>
            </div>

            <div style={{ animation: heroVis ? 'fadeLeft .8s .1s ease both' : 'none', opacity: 0 }}>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(38px,5vw,68px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: 6, color: '#f8fafc' }}>
                {cur.headline}<br />
                <span style={{ background: 'linear-gradient(120deg,#f97316,#fbbf24)', backgroundSize: '200%', animation: 'gradS 3s ease infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {cur.sub}
                </span>
              </h1>
              <div style={{ width: 60, height: 4, background: 'linear-gradient(90deg,#f97316,#fbbf24)', borderRadius: 2, marginBottom: 20, marginTop: 6 }} />
            </div>

            <div style={{ animation: heroVis ? 'fadeLeft .8s .2s ease both' : 'none', opacity: 0 }}>
              <p style={{ fontSize: 17, color: 'rgba(248,250,252,0.68)', maxWidth: 460, lineHeight: 1.78, marginBottom: 32, fontWeight: 400 }}>
                Discover 500+ routes across Tamil Nadu. Comfortable buses, guaranteed seats, real-time tracking — all in one place.
              </p>
            </div>

            {/* ── WHITE SEARCH CARD (border fixed) ── */}
            <div style={{ animation: heroVis ? 'fadeUp .8s .3s ease both' : 'none', opacity: 0 }}>
              <div style={{ background: '#ffffff', borderRadius: 20, padding: '22px 24px', boxShadow: '0 20px 50px rgba(15,23,42,0.22)', border: '1px solid rgba(15,23,42,0.06)', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

                <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                  {['One Way', 'Round Trip', 'Multi City'].map((t, i) => (
                    <button key={t} onClick={() => setActiveTab(i)}
                      style={{ padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif", background: activeTab === i ? 'linear-gradient(135deg,#f97316,#ea6c0a)' : 'transparent', color: activeTab === i ? '#fff' : '#94a3b8', transition: 'all .2s', boxShadow: activeTab === i ? '0 4px 12px rgba(249,115,22,0.32)' : 'none' }}>
                      {t}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearch}>
                  <div className="search-grid">

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>From</label>
                      <CustomSelect value={form.from} onChange={v => setForm({ ...form, from: v })} options={cities} />
                    </div>

                    <div style={{ alignSelf: 'flex-end' }}>
                      <button type="button" onClick={swap}
                        style={{ width: 44, height: 44, background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '50%', color: '#f97316', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s', flexShrink: 0 }}
                        onMouseOver={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'rotate(180deg)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.color = '#f97316'; e.currentTarget.style.transform = 'none'; }}>
                        ⇄
                      </button>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>To</label>
                      <CustomSelect value={form.to} onChange={v => setForm({ ...form, to: v })} options={cities} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>Date</label>
                      <input type="date" className="s-inp" style={sInp} value={form.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>Type</label>
                      <CustomSelect value={busType || 'All Types'} onChange={v => setBusType(v === 'All Types' ? '' : v)} options={['All Types', 'AC', 'Non-AC', 'Sleeper', 'Volvo', 'Luxury']} />
                    </div>

                    <div style={{ alignSelf: 'flex-end' }}>
                      <button type="submit" className="shim-btn"
                        style={{ background: 'linear-gradient(135deg,#f97316,#ea6c0a)', color: '#fff', border: 'none', borderRadius: 12, height: 44, padding: '0 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', position: 'relative', overflow: 'hidden', transition: 'all .3s', boxShadow: '0 6px 20px rgba(249,115,22,0.42)', width: '100%' }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(249,115,22,0.55)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.42)'; }}>
                        Search 🔍
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                    {['✓ Free Cancellation', '✓ Instant Confirmation', '✓ 24/7 Support', '✓ Best Price'].map(b => (
                      <span key={b} style={{ fontSize: 12, color: '#94a3b8' }}>{b}</span>
                    ))}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.3)', fontSize: 10, zIndex: 10, letterSpacing: '1.5px', animation: 'float 2.5s ease-in-out infinite' }}>
          <span>SCROLL</span><ChevronDown size={14} color="#f97316" />
        </div>
      </section>

      {/* ═══════════ TICKER ═══════════ */}
      <div style={{ background: '#fff7ed', borderTop: '1px solid #fed7aa', borderBottom: '1px solid #fed7aa', padding: '11px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 52, whiteSpace: 'nowrap', animation: 'ticker 22s linear infinite' }}>
          {[...Array(2)].map((_, ri) => (
            <React.Fragment key={ri}>
              {['🚌 500+ Routes', '⚡ Instant Booking', '✓ GPS Tracked', '💺 Guaranteed Seats', '🌟 4.8★ Rating', '🔒 Secure Payment', '📱 Easy Reschedule', '🎫 E-Ticket'].map(item => (
                <span key={item + ri} style={{ fontSize: 13, fontWeight: 500, color: '#c2410c', letterSpacing: '.3px' }}>{item}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ═══════════ STATS — Orange gradient ═══════════ */}
      <section style={{ background: 'linear-gradient(135deg,#ea580c 0%,#f97316 40%,#fb923c 70%,#f59e0b 100%)', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -50, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 40, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {[
            { val: '5M+',   label: 'Monthly Passengers', target: null },
            { val: null,    label: 'Bus Routes',          target: 500  },
            { val: '99%',   label: 'On-Time Performance', target: null },
            { val: '4.8★',  label: 'User Rating',         target: null },
          ].map((item) => (
            <div key={item.label} style={{ padding: '10px 0' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-2px', textShadow: '0 2px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
                {item.target ? <Counter target={item.target} suffix="+" /> : item.val}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 12, fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section style={{ padding: '96px 48px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Why BusGo?</span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 10, color: '#0f172a' }}>Travel with Confidence</h2>
            <p style={{ color: '#94a3b8', maxWidth: 380, margin: '10px auto 0', fontSize: 15, lineHeight: 1.7 }}>Everything you need for a perfect journey</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 18 }}>
            {[
              { Icon: Shield,     color: '#f97316', title: 'Safe & Verified',      desc: 'GPS tracked, CCTV monitored, operator-verified buses on every route.', delay: 0 },
              { Icon: Clock,      color: '#3b82f6', title: 'On-Time Guarantee',    desc: '95% on-time rate. Real-time delay alerts sent to your phone instantly.', delay: 80 },
              { Icon: Star,       color: '#f59e0b', title: 'Top-Rated Operators',  desc: 'Only 4★+ operators. Vetted by 5M+ real traveller reviews.', delay: 160 },
              { Icon: Headphones, color: '#22c55e', title: '24/7 Support',         desc: 'Chat, call, or email — our team is always ready to help you.', delay: 240 },
              { Icon: MapIcon,     color: '#8b5cf6', title: 'Live Bus Tracking',    desc: 'Real-time GPS tracking. Share your bus location with family.', delay: 320 },
              { Icon: Award,      color: '#ec4899', title: 'Best Price Guarantee', desc: 'Compare fares, apply coupons, save up to 20% on every booking.', delay: 400 },
            ].map(props => <FeatureCard key={props.title} {...props} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ POPULAR ROUTES ═══════════ */}
      <section style={{ padding: '90px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Trending Now</span>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 8, color: '#0f172a' }}>Popular Routes</h2>
            </div>
            <button onClick={() => navigate('/search')}
              style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#f97316', padding: '10px 22px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
              onMouseOver={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#f97316'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.color = '#f97316'; e.currentTarget.style.borderColor = '#fed7aa'; }}>
              View All Routes →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 22 }}>
            {displayRoutes.map((r, i) => <RouteCard key={i} {...r} delay={i * 80} onClick={() => navigate(`/search?from=${r.from}&to=${r.to}&date=${form.date}`)} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ NEW: MORE WAYS TO BUSGO ═══════════ */}
      <section style={{ padding: '90px 48px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>New</span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 10, color: '#0f172a' }}>More Ways to BusGo</h2>
            <p style={{ color: '#94a3b8', maxWidth: 420, margin: '10px auto 0', fontSize: 15, lineHeight: 1.7 }}>Wallet payments, coupons, reviews, alerts and live support — all built in.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
            {moduleCards.map(({ Icon, color, title, desc, action }) => (
              <div key={title} onClick={action} style={{
                background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18, padding: '26px 22px', cursor: 'pointer', transition: 'all .3s',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.boxShadow = `0 16px 40px ${color}18`; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: 46, height: 46, background: `${color}12`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section style={{ padding: '96px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 940, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Simple Process</span>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1px', margin: '10px 0 52px', color: '#0f172a' }}>Book in 3 Easy Steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 37, left: 'calc(33% + 20px)', right: 'calc(33% + 20px)', height: 2, background: 'linear-gradient(90deg,#f97316,#fbbf24)' }} />
            {[{ n: '01', icon: '🔍', title: 'Search Buses',   desc: 'Enter source, destination & date to see available buses' },
              { n: '02', icon: '💺', title: 'Pick Your Seat', desc: 'Choose from the live interactive seat map layout' },
              { n: '03', icon: '💳', title: 'Pay & Travel',   desc: 'Instant e-ticket via UPI, Card or Net Banking' },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 74, height: 74, background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, position: 'relative', zIndex: 1, boxShadow: '0 4px 18px rgba(249,115,22,0.12)' }}>
                  {icon}
                  <span style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, background: '#f97316', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{n}</span>
                </div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section style={{ padding: '96px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>What Travellers Say</span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 10, color: '#0f172a' }}>Loved by Millions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              { name: 'Priya S.',    route: 'Chennai → Coimbatore', text: 'Super easy booking! Bus was on time and AC was perfect. Will use BusGo every time!', avatar: 'P', color: '#f97316' },
              { name: 'Karthik M.', route: 'Madurai → Chennai',     text: 'Best bus booking app in Tamil Nadu. Live tracking helped my family know when I arrived.', avatar: 'K', color: '#3b82f6' },
              { name: 'Anitha R.',  route: 'Chennai → Pondicherry', text: 'Booked a Volvo sleeper in 2 minutes. Smooth ride, clean bus, amazing experience!', avatar: 'A', color: '#22c55e' },
            ].map((t, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 18, padding: '26px 24px', transition: 'all .3s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#fed7aa'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.08)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>{[...Array(5)].map((_, si) => <span key={si} style={{ color: '#f59e0b', fontSize: 15 }}>★</span>)}</div>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${t.color}18`, border: `2px solid ${t.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: t.color }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.route}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section style={{ padding: '96px 48px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>FAQ</span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 10, color: '#0f172a' }}>Got Questions?</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ background: '#fff', border: `1.5px solid ${activeFaq === i ? '#fed7aa' : '#e2e8f0'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s', boxShadow: activeFaq === i ? '0 4px 18px rgba(249,115,22,0.08)' : 'none' }}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  style={{ width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1e293b', textAlign: 'left' }}>{f.q}</span>
                  <span style={{ color: '#f97316', fontSize: 22, flexShrink: 0, transition: 'transform .25s', transform: activeFaq === i ? 'rotate(45deg)' : 'rotate(0)', fontWeight: 300 }}>+</span>
                </button>
                {activeFaq === i && (
                  <div style={{ padding: '0 22px 18px', paddingTop: 14, color: '#64748b', fontSize: 14, lineHeight: 1.8, borderTop: '1px solid #f1f5f9' }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section style={{ padding: '96px 48px', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 220, background: 'radial-gradient(ellipse,rgba(249,115,22,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '60px 48px', backdropFilter: 'blur(16px)' }}>
            <div style={{ fontSize: 50, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🚌</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12, color: '#f8fafc' }}>
              Ready to{' '}
              <span style={{ background: 'linear-gradient(120deg,#f97316,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Travel?</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.8, maxWidth: 420, margin: '0 auto 30px' }}>
              Join 5 million+ happy travellers. Book in under 2 minutes.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="shim-btn" onClick={() => navigate('/search')}
                style={{ background: 'linear-gradient(135deg,#f97316,#dc6309)', color: '#fff', border: 'none', borderRadius: 50, padding: '15px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 28px rgba(249,115,22,0.4)', position: 'relative', overflow: 'hidden', transition: 'all .3s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 44px rgba(249,115,22,0.55)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(249,115,22,0.4)'; }}>
                Search Buses Now 🚌
              </button>
              <button onClick={() => navigate('/register')}
                style={{ background: 'transparent', color: '#f97316', border: '1.5px solid rgba(249,115,22,0.38)', borderRadius: 50, padding: '15px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .3s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.38)'; e.currentTarget.style.background = 'transparent'; }}>
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FESTIVAL BANNER ═══════════ */}
      <section style={{ padding: '80px 48px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(120deg,#7c3aed 0%,#6d28d9 50%,#f97316 100%)', borderRadius: 24, padding: '48px 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(124,58,237,0.2)' }}>
            <div style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 50, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 14 }}>🎊 Limited Time</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8 }}>Festival Season Special 🎉</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6, maxWidth: 480 }}>Book now and get <strong style={{ color: '#fbbf24' }}>up to 30% off</strong> on all routes for Deepavali, Pongal & Christmas travel.</p>
            </div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px dashed rgba(255,255,255,0.4)', borderRadius: 12, padding: '10px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Use Code</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#fbbf24', letterSpacing: '3px' }}>FESTIVAL30</div>
              </div>
              <button onClick={() => navigate('/search')} style={{ background: '#fff', color: '#7c3aed', border: 'none', borderRadius: 50, padding: '12px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%', transition: 'all .2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}>Book Now & Save →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ POPULAR DESTINATIONS ═══════════ */}
      <section style={{ padding: '96px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Explore Tamil Nadu</span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 10, color: '#0f172a' }}>Popular Destinations</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { city: 'Chennai',     tag: 'Capital City',    routes: 48,
                img: 'https://media.licdn.com/dms/image/v2/C4E12AQGmIluMk0G6GA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520238944692?e=2147483647&v=beta&t=pYZiKqRVUWP0vq0UDPY_-kRGwRbYQUYK1sgBoBjVib4',
                grad: 'linear-gradient(160deg,#c2410c,#f97316)',
                pattern: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 50%)',
                icon: '🛕', detail: 'Marina Beach • Kapaleeshwarar' },
              { city: 'Coimbatore', tag: 'Manchester of TN', routes: 32,
                img: 'https://touristplace.in/wp-content/uploads/2023/02/061362631Isha.jpeg',
                grad: 'linear-gradient(160deg,#0c4a6e,#0ea5e9)',
                pattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                icon: '🏭', detail: 'Textile Hub • Kovai' },
              { city: 'Madurai',    tag: 'Temple City',      routes: 26,
                img: 'https://www.clubmahindra.com/blog/media/section_images/placestovi-4bc8914dee0ace7.webp',
                grad: 'linear-gradient(160deg,#581c87,#7c3aed)',
                pattern: 'radial-gradient(circle at 50% 20%, rgba(255,220,100,0.2) 0%, transparent 50%)',
                icon: '🕌', detail: 'Meenakshi Temple • Athisayam' },
              { city: 'Trichy',     tag: 'Rock Fort City',   routes: 18,
                img: 'https://toursinindia.in/images/tourist-places/trichy/01.webp',
                grad: 'linear-gradient(160deg,#7f1d1d,#ef4444)',
                pattern: 'radial-gradient(ellipse at 50% 80%, rgba(139,69,19,0.4) 0%, transparent 60%)',
                icon: '🏯', detail: 'Rock Fort • Sri Ranganathar' },
              { city: 'Pondicherry',tag: 'French Riviera',   routes: 14,
                img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa51NiR2_ycX23Ty1kfWKFhe39HuBn1pFuxmM7nDBuHAXzs0k1rO6gmpNx&s=10',
                grad: 'linear-gradient(160deg,#064e3b,#10b981)',
                pattern: 'radial-gradient(ellipse at 50% 100%, rgba(0,100,200,0.4) 0%, transparent 50%)',
                icon: '🏖️', detail: 'Promenade Beach • Auroville' },
              { city: 'Ooty',       tag: 'Queen of Hills',   routes: 10,
                img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNSkPS3FxcG0Zl1sl3Git-ZOsNKBJqbDak3e--3lk75pXklCEgY22UchU&s=10',
                grad: 'linear-gradient(160deg,#14532d,#22c55e)',
                pattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                icon: '🌿', detail: 'Nilgiri Hills • Botanical Garden' },
                  { city: 'Rameswaram',       tag: 'Pamban Bridge',   routes: 18,
                img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/The_New_Pamban_Bridge.jpg/1280px-The_New_Pamban_Bridge.jpg',
                grad: 'linear-gradient(160deg,#14532d,#22c55e)',
                pattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                icon: '🌿', detail: 'Pamban Bridge • Boat Jetty' },
                 { city: 'Nagapattinam',       tag: 'velankanni ',   routes: 20,
                img: 'https://toim.b-cdn.net/pictures/travel_guide/thmb/nagapattinam-tour-848.jpeg',
                grad: 'linear-gradient(160deg,#14532d,#22c55e)',
                pattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                icon: '🌿', detail: 'velankanni •  Beautiful Place ' },
              ].map((d) => (
              <CityCard key={d.city} d={d} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ LAST MINUTE DEALS ═══════════ */}
      <section style={{ padding: '0 48px 96px', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', letterSpacing: '2.5px', textTransform: 'uppercase' }}>⚡ Limited Seats</span>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, letterSpacing: '-0.5px', marginTop: 8, color: '#0f172a' }}>Last Minute Deals</h2>
            </div>
            <button onClick={() => navigate('/search')} style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#f97316', padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View All →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {[
              { from: 'Chennai',  to: 'Madurai',     departs: 'Today 10:30 PM',    seats: 3, orig: 750, disc: 499, type: 'AC Sleeper' },
              { from: 'Trichy',   to: 'Chennai',     departs: 'Today 11:00 PM',    seats: 5, orig: 600, disc: 420, type: 'Volvo AC'   },
              { from: 'Salem',    to: 'Coimbatore',  departs: 'Tomorrow 6:00 AM',  seats: 2, orig: 350, disc: 249, type: 'Non-AC'     },
              { from: 'Chennai',  to: 'Pondicherry', departs: 'Tomorrow 7:30 AM',  seats: 4, orig: 280, disc: 199, type: 'AC Seater'  },
            ].map((d, i) => (
              <div key={i} onClick={() => navigate('/search')} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '18px 20px', cursor: 'pointer', transition: 'all .3s', position: 'relative' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(249,115,22,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ position: 'absolute', top: 14, right: 14, background: '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', border: '1px solid #fecaca' }}>⚡ {d.seats} left</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{d.from} → {d.to}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>{d.type} • {d.departs}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#f97316' }}>₹{d.disc}</span>
                  <span style={{ fontSize: 13, color: '#cbd5e1', textDecoration: 'line-through' }}>₹{d.orig}</span>
                  <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 8px', marginLeft: 'auto' }}>{Math.round((1-d.disc/d.orig)*100)}% OFF</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SPECIAL OFFERS ═══════════ */}
      <section style={{ padding: '96px 48px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Save More</span>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 10, color: '#0f172a' }}>Special Offers & Coupons</h2>
            </div>
            <button onClick={() => navigate('/admin/coupons')}
              style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#f97316', padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Manage Coupons (Admin) →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 18 }}>
            {[
              { code: 'FIRST50', title: 'First Booking Offer', desc: '50% off on your very first bus booking', discount: '50% OFF', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', valid: 'Valid till 31 Dec 2025' },
              { code: 'BUSPASS', title: 'BusPass Members',     desc: 'Flat ₹100 off for registered members',  discount: '₹100 OFF', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', valid: 'Valid till 31 Jan 2026' },
              { code: 'WEEKEND', title: 'Weekend Saver',       desc: '25% off on Saturday & Sunday bookings', discount: '25% OFF', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', valid: 'Every Weekend'         },
              { code: 'STUDENT', title: 'Student Discount',    desc: 'Extra 15% off with valid student ID',   discount: '15% OFF', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', valid: 'Year Round'           },
            ].map((o, i) => (
              <div key={i} style={{ background: '#fff', border: `1.5px solid ${o.border}`, borderRadius: 16, padding: '22px 20px', transition: 'all .3s', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = `0 16px 40px ${o.color}18`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{o.title}</div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{o.desc}</div>
                  </div>
                  <div style={{ background: o.bg, color: o.color, fontSize: 13, fontWeight: 800, borderRadius: 10, padding: '6px 10px', whiteSpace: 'nowrap', fontFamily: "'Syne',sans-serif", flexShrink: 0, marginLeft: 10 }}>{o.discount}</div>
                </div>
                <div style={{ background: o.bg, border: `1.5px dashed ${o.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: o.color, letterSpacing: '2px' }}>{o.code}</span>
                  <button onClick={() => navigator.clipboard.writeText(o.code)} style={{ background: o.color, color: '#fff', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Copy</button>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>🗓 {o.valid}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BUS OPERATORS ═══════════ */}
      <section style={{ padding: '80px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Trusted Partners</span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, letterSpacing: '-0.5px', marginTop: 10, color: '#0f172a' }}>Our Bus Operators</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14 }}>
            {[
              { name: 'TNSTC',           rating: 4.5, routes: 120, color: '#f97316', icon: '🚌' },
              { name: 'SETC',            rating: 4.3, routes: 80,  color: '#3b82f6', icon: '🚍' },
              { name: 'Parveen Travels', rating: 4.7, routes: 45,  color: '#22c55e', icon: '🚎' },
              { name: 'KPN Travels',     rating: 4.6, routes: 60,  color: '#8b5cf6', icon: '🚌' },
              { name: 'SRS Travels',     rating: 4.4, routes: 38,  color: '#ec4899', icon: '🚍' },
              { name: 'Kallada Tours',   rating: 4.8, routes: 52,  color: '#f59e0b', icon: '🚎' },
            ].map((op) => (
              <div key={op.name} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '20px 16px', textAlign: 'center', transition: 'all .3s', cursor: 'pointer' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = op.color; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = `0 12px 32px ${op.color}15`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{op.icon}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{op.name}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 4 }}>
                  {[...Array(5)].map((_,si) => <span key={si} style={{ color: si < Math.floor(op.rating) ? '#f59e0b' : '#e2e8f0', fontSize: 12 }}>★</span>)}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{op.routes} routes</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ APP DOWNLOAD ═══════════ */}
      <section style={{ padding: '96px 48px', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(249,115,22,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(249,115,22,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Mobile App</span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 10, marginBottom: 14, color: '#f8fafc' }}>
              Book On The Go with<br/>
              <span style={{ background: 'linear-gradient(120deg,#f97316,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BusGo App</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginBottom: 32, maxWidth: 400 }}>Download our app and enjoy seamless booking, live tracking, e-tickets and exclusive app-only discounts — anytime, anywhere.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              {[{ store: 'App Store', icon: '🍎', sub: 'Download on the' }, { store: 'Google Play', icon: '▶', sub: 'Get it on' }].map(s => (
                <button key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 20px', cursor: 'pointer', transition: 'all .3s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'none'; }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '.5px' }}>{s.sub}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff' }}>{s.store}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {[['50K+','App Downloads'],['4.8★','App Rating'],['99%','Uptime']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: '#f97316' }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 240, height: 460, background: 'linear-gradient(145deg,#1e293b,#0f172a)', borderRadius: 36, border: '2px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px', gap: 12, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3 }} />
              <div style={{ width: '100%', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🚌</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: '#f97316' }}>BusGo</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Book your bus</div>
              </div>
              {[['Chennai → CBE','8:30 PM • 3 seats','#22c55e'],['Madurai → MAS','10:00 PM • 5 seats','#f59e0b'],['Trichy → Salem','7:00 AM • 2 seats','#ef4444']].map(([r,d,c],i) => (
                <div key={i} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{r}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{d}</div>
                  </div>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                </div>
              ))}
              <button style={{ width: '100%', background: 'linear-gradient(135deg,#f97316,#ea6c0a)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Search Buses 🔍</button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ background: '#0f172a', padding: '64px 48px 0', color: '#64748b' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#f97316,#ea6c0a)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚌</div>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff' }}>Bus<span style={{ color: '#f97316' }}>Go</span></span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#475569', maxWidth: 280, marginBottom: 24 }}>Tamil Nadu's most trusted bus booking platform. 500+ routes, guaranteed seats, real-time tracking for 5M+ travellers.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[['📘','#1d4ed8'],['🐦','#0ea5e9'],['📸','#ec4899'],['▶️','#ef4444']].map(([icon,color],i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15, transition: 'all .2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Quick Links', links: ['Home','Search Buses','Track Bus','My Bookings','Profile'] },
              { title: 'Account',     links: ['My Wallet','Notifications','Coupons & Offers','Live Chat Support','My Reviews'] },
              { title: 'Support',     links: ['Help Center','Contact Us','Cancellation Policy','Refund Policy','FAQs'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16, letterSpacing: '.3px' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(link => (
                    <li key={link}><a href="#" style={{ color: '#475569', fontSize: 13, textDecoration: 'none', transition: 'color .2s' }}
                      onMouseOver={e => e.currentTarget.style.color = '#f97316'}
                      onMouseOut={e => e.currentTarget.style.color = '#475569'}>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)', borderRadius: 14, padding: '22px 26px', marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Get exclusive deals in your inbox</div>
              <div style={{ fontSize: 13, color: '#475569' }}>Subscribe for special offers, travel tips & route updates</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Enter your email" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: "'Inter',sans-serif", minWidth: 200 }} />
              <button style={{ background: 'linear-gradient(135deg,#f97316,#ea6c0a)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>Subscribe</button>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#334155' }}>© 2025 BusGo. All rights reserved. Made with ❤️ for Tamil Nadu travellers.</div>
            <div style={{ display: 'flex', gap: 18 }}>
              {['Privacy Policy','Terms of Service','Cookie Policy'].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: '#334155', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#f97316'}
                  onMouseOut={e => e.currentTarget.style.color = '#334155'}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Live Chat Support widget — floats on top of every section */}
      <LiveChatWidget />
    </div>
  );
} 