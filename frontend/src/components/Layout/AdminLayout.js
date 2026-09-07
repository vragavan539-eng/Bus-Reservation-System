import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Bus, Map, Ticket, Users, LogOut, Home } from 'lucide-react';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    ['/admin', LayoutDashboard, 'Dashboard'],
    ['/admin/buses', Bus, 'Buses'],
    ['/admin/routes', Map, 'Routes'],
    ['/admin/bookings', Ticket, 'Bookings'],
    ['/admin/users', Users, 'Users'],
  ];

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#0a0f1e'}}>
      <aside style={{width:'240px',background:'#0d1630',borderRight:'1px solid rgba(249,115,22,0.15)',display:'flex',flexDirection:'column',position:'fixed',height:'100vh',zIndex:100}}>
        <div style={{padding:'24px 20px',borderBottom:'1px solid rgba(249,115,22,0.15)'}}>
          <Link to="/" style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <Bus color="#f97316" size={22}/>
            <span style={{fontFamily:'Syne',fontSize:'20px',fontWeight:800,color:'#f97316'}}>Bus<span style={{color:'#f1f5f9'}}>Go</span></span>
          </Link>
          <div style={{marginTop:'12px',fontSize:'12px',color:'#94a3b8'}}>Admin Panel</div>
        </div>
        <nav style={{flex:1,padding:'16px 12px'}}>
          {links.map(([path, Icon, label]) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ display:'flex',alignItems:'center',gap:'12px',padding:'11px 14px',borderRadius:'10px',marginBottom:'4px',
                background:active?'rgba(249,115,22,0.15)':'transparent',color:active?'#f97316':'#94a3b8',fontSize:'14px',fontWeight:active?600:400,transition:'all .2s' }}
                onMouseOver={e=>{if(!active){e.currentTarget.style.background='rgba(249,115,22,0.07)';e.currentTarget.style.color='#f1f5f9'}}}
                onMouseOut={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94a3b8'}}}>
                <Icon size={17}/>{label}
              </Link>
            );
          })}
        </nav>
        <div style={{padding:'16px 12px',borderTop:'1px solid rgba(148,163,184,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',marginBottom:'4px',borderRadius:'8px',background:'rgba(30,45,80,0.5)'}}>
            <div style={{width:'32px',height:'32px',background:'rgba(249,115,22,0.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:'13px',fontWeight:700,color:'#f97316'}}>{user?.name[0]}</span>
            </div>
            <div>
              <div style={{fontSize:'13px',fontWeight:600,color:'#f1f5f9'}}>{user?.name}</div>
              <div style={{fontSize:'11px',color:'#94a3b8'}}>Administrator</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'8px',
            color:'#ef4444',background:'transparent',border:'none',width:'100%',cursor:'pointer',fontSize:'14px' }}>
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>
      <main style={{marginLeft:'240px',flex:1,padding:'32px 36px'}}>
        <div style={{marginBottom:'28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h1 style={{fontFamily:'Syne',fontSize:'24px',fontWeight:800}}>{title}</h1>
          <Link to="/" style={{display:'flex',alignItems:'center',gap:'6px',color:'#94a3b8',fontSize:'13px'}}>
            <Home size={15}/> View Site
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
};
export default AdminLayout;