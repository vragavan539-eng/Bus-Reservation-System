import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Bus, Map, Ticket, Users, LogOut, Home, BarChart3 } from 'lucide-react';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    ['/admin',           LayoutDashboard, 'Dashboard'],
    ['/admin/analytics', BarChart3,       'Analytics'],
    ['/admin/buses',     Bus,             'Buses'],
    ['/admin/routes',    Map,             'Routes'],
    ['/admin/bookings',  Ticket,          'Bookings'],
    ['/admin/users',     Users,           'Users'],
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* ================= SIDEBAR ================= */}
      <aside style={{
        width: '240px', background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh', zIndex: 100,
        boxShadow: '1px 0 0 rgba(0,0,0,0.02)'
      }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#f97316,#ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bus color="#fff" size={19} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Bus<span style={{ color: '#f97316' }}>Go</span>
            </span>
          </Link>
          <div style={{
            marginTop: '10px', display: 'inline-block',
            fontSize: '11px', color: '#ea580c', fontWeight: 700,
            background: '#fff7ed', padding: '3px 10px', borderRadius: 20,
            letterSpacing: '0.5px'
          }}>ADMIN PANEL</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {links.map(([path, Icon, label]) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '10px',
                  marginBottom: '4px', textDecoration: 'none',
                  background: active ? '#fff7ed' : 'transparent',
                  color: active ? '#ea580c' : '#475569',
                  fontSize: '14px', fontWeight: active ? 700 : 500,
                  transition: 'all .2s'
                }}
                onMouseOver={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseOut={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}>
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', marginBottom: '6px', borderRadius: '10px',
            background: '#f8fafc', border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#f97316,#ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                {(user?.name?.[0] || 'A').toUpperCase()}
              </span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '13px', fontWeight: 600, color: '#0f172a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Administrator</div>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '8px',
              color: '#dc2626', background: '#fef2f2',
              border: 'none', width: '100%', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600, transition: 'all .2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '28px 32px', width: '100%' }}>

        {/* Topbar */}
        <div style={{
          marginBottom: '28px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '20px', borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px', fontWeight: 800,
              color: '#0f172a', margin: 0, letterSpacing: '-0.5px'
            }}>{title}</h1>
          </div>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#475569', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none', padding: '8px 14px',
            borderRadius: 8, border: '1px solid #e5e7eb',
            background: '#fff', transition: 'all .2s'
          }}
            onMouseOver={e => {
              e.currentTarget.style.color = '#ea580c';
              e.currentTarget.style.borderColor = '#fed7aa';
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}>
            <Home size={15} /> View Site
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;