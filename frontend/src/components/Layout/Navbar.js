import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bus, User, LogOut, Ticket, Settings, ChevronDown, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const isActive = p => location.pathname === p;

  return (
    <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:1000,padding:'14px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',
      background:scrolled?'rgba(10,15,30,0.98)':'rgba(10,15,30,0.75)',backdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(249,115,22,0.2)',transition:'all .3s' }}>
      <Link to="/" style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <Bus color="#f97316" size={26}/>
        <span style={{fontFamily:'Syne',fontSize:'22px',fontWeight:800,color:'#f97316'}}>Bus<span style={{color:'#f1f5f9'}}>Go</span></span>
      </Link>

      <div style={{display:'flex',gap:'28px',alignItems:'center'}}>
        {[['/', 'Home'],['/search','Search'],['/track','Track Bus']].map(([path,label]) => (
          <Link key={path} to={path} style={{ color:isActive(path)?'#f97316':'#94a3b8', fontSize:'14px', fontWeight:500, transition:'color .2s' }}
            onMouseOver={e=>e.target.style.color='#f97316'} onMouseOut={e=>e.target.style.color=isActive(path)?'#f97316':'#94a3b8'}>
            {label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link to="/admin" style={{color:'#fbbf24',fontSize:'14px',fontWeight:700}}>⚙ Admin</Link>
        )}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
        {user ? (
          <div style={{position:'relative'}}>
            <button onClick={() => setDropOpen(!dropOpen)} style={{ display:'flex',alignItems:'center',gap:'8px',background:'rgba(30,45,80,0.9)',
              border:'1px solid rgba(249,115,22,0.3)',borderRadius:'50px',padding:'8px 16px',color:'#f1f5f9',cursor:'pointer',fontSize:'14px' }}>
              <User size={15} color="#f97316"/>
              <span>{user.name.split(' ')[0]}</span>
              <ChevronDown size={13} color="#64748b"/>
            </button>
            {dropOpen && (
              <div onClick={() => setDropOpen(false)} style={{ position:'absolute',top:'calc(100%+8px)',right:0,marginTop:'8px',
                background:'#1e2d50',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'12px',padding:'8px',minWidth:'190px',
                boxShadow:'0 20px 60px rgba(0,0,0,0.5)',zIndex:10 }}>
                {[
                  ['/my-bookings','My Bookings','Ticket'],
                  ['/profile','Profile','Settings'],
                ].map(([path,label,Icon]) => (
                  <Link key={path} to={path} style={{ display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'8px',color:'#e2e8f0',fontSize:'14px' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(249,115,22,0.1)'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    {Icon === 'Ticket' ? <Ticket size={15} color="#f97316"/> : <Settings size={15} color="#f97316"/>}
                    {label}
                  </Link>
                ))}
                <hr style={{border:'none',borderTop:'1px solid rgba(148,163,184,0.1)',margin:'4px 0'}}/>
                <button onClick={() => { logout(); navigate('/'); }} style={{ display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',
                  borderRadius:'8px',color:'#ef4444',fontSize:'14px',background:'transparent',border:'none',width:'100%',cursor:'pointer' }}>
                  <LogOut size={15}/> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" style={{color:'#94a3b8',fontSize:'14px',fontWeight:500}}>Login</Link>
            <Link to="/register" style={{background:'#f97316',color:'#fff',padding:'9px 22px',borderRadius:'50px',fontSize:'14px',fontWeight:600}}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;