import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { CheckCircle, Ticket, Home } from 'lucide-react';

export default function BookingConfirmPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => { bookingAPI.getById(id).then(r=>setBooking(r.data.booking)).catch(()=>{}); }, [id]);

  if (!booking) return <div style={{minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center',paddingTop:'80px',color:'#94a3b8'}}>Loading...</div>;

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',paddingTop:'80px',padding:'100px 20px 40px',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#1e2d50',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'20px',padding:'44px',textAlign:'center',maxWidth:'580px',width:'100%',boxShadow:'0 0 60px rgba(34,197,94,0.1)'}}>
        <CheckCircle size={64} color="#22c55e" style={{marginBottom:'18px'}}/>
        <h1 style={{fontFamily:'Syne',fontSize:'28px',fontWeight:800,marginBottom:'6px'}}>Booking Confirmed! 🎉</h1>
        <p style={{color:'#94a3b8',marginBottom:'28px'}}>Your ticket has been booked successfully</p>
        <div style={{background:'rgba(10,15,30,0.5)',borderRadius:'12px',padding:'22px',textAlign:'left',marginBottom:'22px',border:'1px solid rgba(148,163,184,0.1)'}}>
          {[
            ['Booking ID', booking.bookingId],
            ['PNR Number', booking.pnr],
            ['Route', `${booking.route?.from} → ${booking.route?.to}`],
            ['Travel Date', new Date(booking.travelDate).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})],
            ['Passengers', booking.passengers?.length],
            ['Seats', booking.passengers?.map(p=>p.seatNumber).join(', ')],
            ['Amount Paid', `₹${booking.finalAmount}`],
            ['Status', booking.status?.toUpperCase()],
          ].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(148,163,184,0.08)'}}>
              <span style={{color:'#94a3b8',fontSize:'14px'}}>{k}</span>
              <span style={{color:k==='Status'?'#22c55e':k==='Amount Paid'?'#f97316':'#f1f5f9',fontSize:'14px',fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{background:'rgba(249,115,22,0.07)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'8px',padding:'12px',marginBottom:'20px',fontSize:'13px',color:'#94a3b8'}}>
          📧 Confirmation sent to your email!
        </div>
        <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>navigate('/my-bookings')} style={{display:'flex',alignItems:'center',gap:'8px',background:'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'12px 24px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'Syne'}}>
            <Ticket size={16}/> My Bookings
          </button>
          <button onClick={()=>navigate('/')} style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(148,163,184,0.1)',color:'#94a3b8',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'10px',padding:'12px 24px',fontSize:'14px',cursor:'pointer'}}>
            <Home size={16}/> Home
          </button>
        </div>
      </div>
    </div>
  );
}