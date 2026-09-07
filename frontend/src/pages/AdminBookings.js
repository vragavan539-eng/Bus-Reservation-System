import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

const statusColors = { confirmed:'#22c55e', pending:'#fbbf24', cancelled:'#ef4444', completed:'#3b82f6' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchBookings(); }, [filter, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.allBookings(filter ? { status:filter, page, limit:15 } : { page, limit:15 });
      setBookings(data.bookings); setTotal(data.total);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout title="All Bookings">
      <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:'4px',background:'#1e2d50',borderRadius:'10px',padding:'4px'}}>
          {[['','All'],['confirmed','Confirmed'],['pending','Pending'],['cancelled','Cancelled'],['completed','Completed']].map(([v,l])=>(
            <button key={v} onClick={()=>{setFilter(v);setPage(1);}} style={{padding:'7px 14px',borderRadius:'7px',border:'none',fontSize:'13px',fontWeight:600,cursor:'pointer',background:filter===v?'#f97316':'transparent',color:filter===v?'#fff':'#94a3b8'}}>
              {l}
            </button>
          ))}
        </div>
        <span style={{color:'#94a3b8',fontSize:'13px',marginLeft:'8px'}}>Total: {total} bookings</span>
      </div>

      {loading ? <div style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}>Loading...</div> : (
        <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'14px',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'rgba(10,15,30,0.5)',borderBottom:'1px solid rgba(148,163,184,0.1)'}}>
                {['Booking ID','User','Route','Date','Passengers','Amount','Payment','Status'].map(h=>(
                  <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'#64748b',letterSpacing:'1px',textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b=>(
                <tr key={b._id} style={{borderBottom:'1px solid rgba(148,163,184,0.07)',transition:'background .2s'}}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(249,115,22,0.04)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'11px 14px',fontSize:'12px',fontWeight:600,color:'#f97316'}}>{b.bookingId}</td>
                  <td style={{padding:'11px 14px',fontSize:'13px',color:'#f1f5f9'}}>{b.user?.name}</td>
                  <td style={{padding:'11px 14px',fontSize:'13px',color:'#94a3b8'}}>{b.route?.from} → {b.route?.to}</td>
                  <td style={{padding:'11px 14px',fontSize:'13px',color:'#94a3b8'}}>{new Date(b.travelDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                  <td style={{padding:'11px 14px',fontSize:'13px',color:'#94a3b8'}}>{b.passengers?.length}</td>
                  <td style={{padding:'11px 14px',fontSize:'13px',fontWeight:600,color:'#f1f5f9'}}>₹{b.finalAmount}</td>
                  <td style={{padding:'11px 14px'}}><span style={{color:b.paymentStatus==='paid'?'#22c55e':'#fbbf24',fontSize:'12px',fontWeight:600,textTransform:'uppercase'}}>{b.paymentStatus}</span></td>
                  <td style={{padding:'11px 14px'}}><span style={{background:`${statusColors[b.status]}20`,color:statusColors[b.status],padding:'2px 9px',borderRadius:'20px',fontSize:'11px',fontWeight:600,textTransform:'uppercase'}}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}