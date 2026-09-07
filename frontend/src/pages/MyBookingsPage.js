import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { Bus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = { confirmed:'#22c55e', pending:'#fbbf24', cancelled:'#ef4444', completed:'#3b82f6' };

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pnr, setPnr] = useState('');

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.myBookings(filter ? { status: filter } : {});
      setBookings(data.bookings);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const { data } = await bookingAPI.cancel(id, { reason: 'User requested' });
      toast.success(`Cancelled! Refund: ₹${data.refundAmount}`);
      fetchBookings();
    } catch(err) { toast.error(err.response?.data?.message || 'Cancellation failed'); }
  };

  const searchByPNR = async () => {
    if (!pnr.trim()) return;
    try {
      const { data } = await bookingAPI.byPNR(pnr.trim());
      setBookings([data.booking]);
    } catch { toast.error('PNR not found'); }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',paddingTop:'80px'}}>
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'32px 40px'}}>
        <h1 style={{fontFamily:'Syne',fontSize:'28px',fontWeight:800,marginBottom:'6px'}}>My Bookings</h1>
        <p style={{color:'#94a3b8',marginBottom:'24px'}}>Track and manage all your bus reservations</p>

        <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:'4px',background:'#1e2d50',borderRadius:'10px',padding:'4px'}}>
            {[['','All'],['confirmed','Confirmed'],['pending','Pending'],['cancelled','Cancelled'],['completed','Completed']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{padding:'7px 14px',borderRadius:'7px',border:'none',fontSize:'13px',fontWeight:600,cursor:'pointer',background:filter===v?'#f97316':'transparent',color:filter===v?'#fff':'#94a3b8'}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <input placeholder="Search by PNR..." value={pnr} onChange={e=>setPnr(e.target.value)}
              style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'8px',padding:'8px 14px',color:'#f1f5f9',fontSize:'14px',outline:'none',width:'200px'}}/>
            <button onClick={searchByPNR} style={{background:'#f97316',color:'#fff',border:'none',borderRadius:'8px',padding:'8px 14px',cursor:'pointer'}}>
              <Search size={16}/>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}>Loading...</div>
        ) : bookings.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px',background:'#1e2d50',borderRadius:'16px',border:'1px solid rgba(148,163,184,0.1)'}}>
            <Bus size={48} color="#64748b" style={{marginBottom:'12px'}}/>
            <h3 style={{fontFamily:'Syne',fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>No Bookings Found</h3>
            <p style={{color:'#94a3b8',marginBottom:'18px'}}>Book your first trip today!</p>
            <button onClick={()=>navigate('/search')} style={{background:'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'11px 24px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'Syne'}}>
              Search Buses
            </button>
          </div>
        ) : bookings.map(b=>(
          <div key={b._id} style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'14px',padding:'20px',marginBottom:'14px',transition:'border-color .2s'}}
            onMouseOver={e=>e.currentTarget.style.borderColor='rgba(249,115,22,0.3)'}
            onMouseOut={e=>e.currentTarget.style.borderColor='rgba(148,163,184,0.1)'}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',flexWrap:'wrap'}}>
                  <span style={{fontFamily:'Syne',fontSize:'17px',fontWeight:700}}>{b.route?.from} → {b.route?.to}</span>
                  <span style={{background:`${statusColors[b.status]}20`,color:statusColors[b.status],padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:700,textTransform:'uppercase'}}>{b.status}</span>
                </div>
                <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
                  {[['📅',new Date(b.travelDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})],['🎫',b.bookingId],['🔑',b.pnr],['💺',b.passengers?.map(p=>p.seatNumber).join(', ')],['👥',`${b.passengers?.length} Pax`]].map(([icon,val])=>(
                    <span key={val} style={{fontSize:'13px',color:'#94a3b8'}}>{icon} {val}</span>
                  ))}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'Syne',fontSize:'20px',fontWeight:800,color:'#f97316'}}>₹{b.finalAmount}</div>
                <div style={{fontSize:'12px',color:statusColors[b.paymentStatus]||'#94a3b8',fontWeight:600,marginBottom:'10px'}}>{b.paymentStatus?.toUpperCase()}</div>
                {b.status === 'confirmed' && (
                  <button onClick={()=>handleCancel(b._id)} style={{display:'flex',alignItems:'center',gap:'5px',background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'7px',padding:'6px 12px',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                    <X size={13}/> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}