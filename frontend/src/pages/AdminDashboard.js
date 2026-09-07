import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { adminAPI } from '../services/api';
import { Users, Bus, Map, Ticket, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard().then(r => {
      setStats(r.data.stats);
      setRecentBookings(r.data.recentBookings);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label:'Total Users', value:stats.totalUsers, Icon:Users, color:'#3b82f6', bg:'rgba(59,130,246,0.12)' },
    { label:'Total Bookings', value:stats.totalBookings, Icon:Ticket, color:'#f97316', bg:'rgba(249,115,22,0.12)' },
    { label:'Active Buses', value:stats.totalBuses, Icon:Bus, color:'#22c55e', bg:'rgba(34,197,94,0.12)' },
    { label:'Active Routes', value:stats.totalRoutes, Icon:Map, color:'#8b5cf6', bg:'rgba(139,92,246,0.12)' },
    { label:'Total Revenue', value:`₹${stats.totalRevenue?.toLocaleString()}`, Icon:DollarSign, color:'#fbbf24', bg:'rgba(251,191,36,0.12)' },
  ] : [];

  const statusColors = { confirmed:'#22c55e', pending:'#fbbf24', cancelled:'#ef4444', completed:'#3b82f6' };

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}>Loading dashboard...</div>
      ) : (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',marginBottom:'28px'}}>
            {statCards.map(({label,value,Icon,color,bg})=>(
              <div key={label} style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'14px',padding:'22px',transition:'all .3s'}}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(249,115,22,0.3)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(148,163,184,0.1)';e.currentTarget.style.transform='none'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div>
                    <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'6px',letterSpacing:'.5px'}}>{label}</div>
                    <div style={{fontFamily:'Syne',fontSize:'26px',fontWeight:800,color:'#f1f5f9'}}>{value}</div>
                  </div>
                  <div style={{width:'44px',height:'44px',borderRadius:'12px',background:bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon size={20} color={color}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'14px',padding:'22px'}}>
            <h2 style={{fontFamily:'Syne',fontSize:'17px',fontWeight:700,marginBottom:'18px'}}>Recent Bookings</h2>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(148,163,184,0.1)'}}>
                    {['Booking ID','User','Route','Date','Amount','Status'].map(h=>(
                      <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:'12px',fontWeight:700,color:'#64748b',letterSpacing:'1px',textTransform:'uppercase'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b=>(
                    <tr key={b._id} style={{borderBottom:'1px solid rgba(148,163,184,0.07)',transition:'background .2s'}}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(249,115,22,0.04)'}
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 14px',fontSize:'13px',fontWeight:600,color:'#f97316'}}>{b.bookingId}</td>
                      <td style={{padding:'12px 14px',fontSize:'13px',color:'#f1f5f9'}}>{b.user?.name}</td>
                      <td style={{padding:'12px 14px',fontSize:'13px',color:'#94a3b8'}}>{b.route?.from} → {b.route?.to}</td>
                      <td style={{padding:'12px 14px',fontSize:'13px',color:'#94a3b8'}}>{new Date(b.travelDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                      <td style={{padding:'12px 14px',fontSize:'13px',fontWeight:600,color:'#f1f5f9'}}>₹{b.finalAmount}</td>
                      <td style={{padding:'12px 14px'}}>
                        <span style={{background:`${statusColors[b.status]}20`,color:statusColors[b.status],padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600,textTransform:'uppercase'}}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}