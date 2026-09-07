import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { routeAPI, busAPI, bookingAPI } from '../services/api';
import { Bus, User, CreditCard, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

export default function BookingPage() {
  const { routeId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const travelDate = sp.get('date');
  const [route, setRoute] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    routeAPI.getById(routeId).then(r => {
      setRoute(r.data.route);
      const busId = r.data.route.bus?._id || r.data.route.bus;
      return busAPI.getSeats(busId);
    }).then(r => setSeats(r.data.seats)).catch(() => toast.error('Error loading route'));

    return () => { document.body.removeChild(script); };
  }, [routeId]);

  const toggleSeat = seat => {
    if (!seat.isAvailable) return;
    setSelectedSeats(prev => {
      if (prev.includes(seat.seatNumber)) {
        setPassengers(ps => ps.filter(p => p.seatNumber !== seat.seatNumber));
        return prev.filter(s => s !== seat.seatNumber);
      }
      if (prev.length >= 6) { toast.error('Max 6 seats per booking'); return prev; }
      setPassengers(ps => [...ps, { name:'', age:'', gender:'Male', seatNumber:seat.seatNumber }]);
      return [...prev, seat.seatNumber];
    });
  };

  const updP = (seatNum, field, val) =>
    setPassengers(ps => ps.map(p => p.seatNumber === seatNum ? {...p,[field]:val} : p));

  // Step 1 → 2: Create pending booking
  const handleContinueToPayment = async () => {
    if (passengers.some(p => !p.name || !p.age)) { toast.error('Fill all passenger details'); return; }
    setLoading(true);
    try {
      const busId = route.bus?._id || route.bus;
      const { data } = await bookingAPI.create({
        routeId, busId, travelDate, passengers,
        boardingPoint: route.from, droppingPoint: route.to,
        paymentMethod: 'razorpay'
      });
      setBookingId(data.booking._id);
      toast.success('Details saved! Proceed to payment.');
      setStep(3);
    } catch(err) { toast.error(err.response?.data?.message || 'Error creating booking'); }
    finally { setLoading(false); }
  };

  // Step 3: Open Razorpay
  const handleRazorpayPayment = async () => {
    setPayLoading(true);
    try {
      const { data } = await API.post('/payments/create-order', { bookingId });
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'BusGo',
        description: `Bus Ticket - ${route.from} to ${route.to}`,
        image: 'https://img.icons8.com/color/96/bus.png',
        order_id: data.orderId,
        prefill: {
          name: passengers[0]?.name || '',
          email: localStorage.getItem('busgo_user_email') || '',
          contact: ''
        },
        theme: { color: '#f97316' },
        handler: async function(response) {
          try {
            const verifyRes = await API.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId
            });
            if (verifyRes.data.success) {
              toast.success('🎉 Payment Successful! Booking Confirmed!');
              navigate(`/booking/confirm/${bookingId}`);
            }
          } catch { toast.error('Payment verification failed. Contact support.'); }
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
            setPayLoading(false);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response) {
        toast.error(`Payment failed: ${response.error.description}`);
        setPayLoading(false);
      });
      rzp.open();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Payment init failed');
    } finally { setPayLoading(false); }
  };

  const total = route ? route.basePrice * selectedSeats.length : 0;
  const discount = total > 2000 ? Math.round(total * 0.05) : 0;
  const finalTotal = total - discount;

  if (!route) return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center',paddingTop:'80px',color:'#94a3b8'}}>
      <Loader size={32} color="#f97316" style={{animation:'spin 1s linear infinite'}}/> &nbsp; Loading...
    </div>
  );

  const inp = { width:'100%',background:'rgba(10,15,30,0.7)',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'8px',padding:'10px 12px',color:'#f1f5f9',fontSize:'14px',outline:'none',boxSizing:'border-box' };

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',paddingTop:'80px'}}>
      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'28px 40px'}}>

        {/* Header */}
        <div style={{background:'#1e2d50',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'14px',padding:'18px 24px',marginBottom:'20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <h1 style={{fontFamily:'Syne',fontSize:'20px',fontWeight:800}}>{route.from} → {route.to}</h1>
            <div style={{color:'#94a3b8',fontSize:'13px',marginTop:'3px'}}>
              {new Date(travelDate).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})} • {route.departureTime} → {route.arrivalTime}
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:'Syne',fontSize:'22px',fontWeight:800,color:'#f97316'}}>₹{finalTotal}</div>
            <div style={{fontSize:'12px',color:'#94a3b8'}}>{selectedSeats.length} seat(s)</div>
          </div>
        </div>

        {/* Steps */}
        <div style={{display:'flex',marginBottom:'22px',background:'#1e2d50',borderRadius:'12px',padding:'4px',gap:'4px'}}>
          {[{n:1,l:'Select Seats'},{n:2,l:'Passenger Details'},{n:3,l:'Pay via Razorpay'}].map(({n,l})=>(
            <button key={n} onClick={()=>n<step&&setStep(n)}
              style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'12px',borderRadius:'8px',border:'none',
                background:step===n?'rgba(249,115,22,0.15)':'transparent',color:step===n?'#f97316':'#94a3b8',
                fontWeight:step===n?700:400,fontSize:'13px',cursor:n<step?'pointer':'default',transition:'all .2s'}}>
              <span style={{width:'24px',height:'24px',borderRadius:'50%',background:step>n?'#22c55e':step===n?'#f97316':'rgba(148,163,184,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff',flexShrink:0}}>
                {step>n ? '✓' : n}
              </span>
              {l}
            </button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'20px'}}>
          <div>
            {/* STEP 1 - Seat Selection */}
            {step === 1 && (
              <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'16px',padding:'24px'}}>
                <h2 style={{fontFamily:'Syne',fontSize:'17px',fontWeight:700,marginBottom:'18px',display:'flex',alignItems:'center',gap:'8px'}}><Bus size={17} color="#f97316"/>Select Seats</h2>
                <div style={{display:'flex',gap:'14px',marginBottom:'16px',flexWrap:'wrap'}}>
                  {[['#f97316','Selected'],['#1e3a5f','Window'],['#1a2540','Aisle'],['#374151','Booked']].map(([c,l])=>(
                    <div key={l} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'#94a3b8'}}>
                      <div style={{width:'16px',height:'14px',background:c,borderRadius:'3px',border:'1px solid rgba(255,255,255,0.1)'}}/>
                      {l}
                    </div>
                  ))}
                </div>
                <div style={{background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'10px 10px 0 0',padding:'8px',textAlign:'center',fontSize:'12px',color:'#f97316',fontWeight:600}}>
                  🚌 Driver • Front of Bus
                </div>
                <div style={{background:'rgba(10,15,30,0.4)',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'0 0 10px 10px',padding:'20px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(5,48px)',gap:'8px',margin:'0 auto',width:'fit-content'}}>
                    {seats.map(seat=>(
                      <div key={seat.seatNumber} onClick={()=>toggleSeat(seat)}
                        title={seat.isAvailable?`Seat ${seat.seatNumber} - ₹${seat.price}`:'Booked'}
                        style={{height:'40px',borderRadius:'6px 6px 3px 3px',
                          background:selectedSeats.includes(seat.seatNumber)?'#f97316':!seat.isAvailable?'#374151':seat.type==='window'?'#1e3a5f':'#1a2540',
                          border:`2px solid ${selectedSeats.includes(seat.seatNumber)?'#fb923c':seat.isAvailable?'rgba(148,163,184,0.2)':'rgba(55,65,81,0.5)'}`,
                          cursor:seat.isAvailable?'pointer':'not-allowed',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:'9px',fontWeight:600,color:seat.isAvailable?'#e2e8f0':'#4b5563',transition:'all .15s',
                          transform:selectedSeats.includes(seat.seatNumber)?'scale(1.08)':'scale(1)'}}>
                        {seat.seatNumber}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={()=>{if(!selectedSeats.length){toast.error('Select at least 1 seat');return;}setStep(2);}}
                  style={{marginTop:'18px',background:'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'12px 28px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'Syne'}}>
                  Continue → Passenger Details
                </button>
              </div>
            )}

            {/* STEP 2 - Passenger Details */}
            {step === 2 && (
              <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'16px',padding:'24px'}}>
                <h2 style={{fontFamily:'Syne',fontSize:'17px',fontWeight:700,marginBottom:'20px',display:'flex',alignItems:'center',gap:'8px'}}><User size={17} color="#f97316"/>Passenger Details</h2>
                {passengers.map((p,i)=>(
                  <div key={p.seatNumber} style={{background:'rgba(10,15,30,0.4)',borderRadius:'10px',padding:'18px',marginBottom:'14px',border:'1px solid rgba(148,163,184,0.1)'}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#f97316',marginBottom:'14px'}}>Passenger {i+1} — Seat {p.seatNumber}</div>
                    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'10px'}}>
                      <div>
                        <label style={{fontSize:'11px',fontWeight:700,color:'#64748b',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'1px'}}>Full Name *</label>
                        <input style={inp} placeholder="Enter name" value={p.name} onChange={e=>updP(p.seatNumber,'name',e.target.value)} required/>
                      </div>
                      <div>
                        <label style={{fontSize:'11px',fontWeight:700,color:'#64748b',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'1px'}}>Age *</label>
                        <input style={inp} type="number" placeholder="Age" min="1" max="100" value={p.age} onChange={e=>updP(p.seatNumber,'age',e.target.value)} required/>
                      </div>
                      <div>
                        <label style={{fontSize:'11px',fontWeight:700,color:'#64748b',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'1px'}}>Gender *</label>
                        <select style={inp} value={p.gender} onChange={e=>updP(p.seatNumber,'gender',e.target.value)}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
                  <button onClick={()=>setStep(1)} style={{background:'rgba(148,163,184,0.1)',color:'#94a3b8',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'10px',padding:'11px 22px',fontSize:'14px',cursor:'pointer'}}>← Back</button>
                  <button onClick={handleContinueToPayment} disabled={loading}
                    style={{background:loading?'#64748b':'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'11px 24px',fontSize:'14px',fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Syne',display:'flex',alignItems:'center',gap:'8px'}}>
                    {loading ? <><Loader size={15} style={{animation:'spin 1s linear infinite'}}/> Saving...</> : 'Continue → Payment'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 - Razorpay Payment */}
            {step === 3 && (
              <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'16px',padding:'28px'}}>
                <h2 style={{fontFamily:'Syne',fontSize:'17px',fontWeight:700,marginBottom:'24px',display:'flex',alignItems:'center',gap:'8px'}}><CreditCard size={17} color="#f97316"/>Pay with Razorpay</h2>

                {/* Razorpay Banner */}
                <div style={{background:'linear-gradient(135deg,rgba(8,69,149,0.2),rgba(0,143,255,0.1))',border:'1px solid rgba(0,143,255,0.3)',borderRadius:'14px',padding:'24px',marginBottom:'24px',textAlign:'center'}}>
                  <img src="https://razorpay.com/favicon.png" alt="Razorpay" style={{width:'40px',height:'40px',marginBottom:'10px'}}/>
                  <div style={{fontFamily:'Syne',fontSize:'20px',fontWeight:800,color:'#f1f5f9',marginBottom:'6px'}}>₹{finalTotal}</div>
                  <div style={{color:'#94a3b8',fontSize:'14px',marginBottom:'16px'}}>{route.from} → {route.to} • {selectedSeats.length} seat(s)</div>
                  <div style={{display:'flex',justifyContent:'center',gap:'16px',flexWrap:'wrap',marginBottom:'20px'}}>
                    {[['💳','Cards'],['📱','UPI'],['🏦','Net Banking'],['👛','Wallets']].map(([e,l])=>(
                      <div key={l} style={{fontSize:'13px',color:'#94a3b8',display:'flex',alignItems:'center',gap:'5px'}}>{e} {l}</div>
                    ))}
                  </div>
                  <button onClick={handleRazorpayPayment} disabled={payLoading}
                    style={{background:payLoading?'#64748b':'#f97316',color:'#fff',border:'none',borderRadius:'12px',padding:'16px 40px',fontSize:'16px',fontWeight:700,cursor:payLoading?'not-allowed':'pointer',fontFamily:'Syne',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',transition:'all .3s'}}>
                    {payLoading
                      ? <><Loader size={18} style={{animation:'spin 1s linear infinite'}}/> Opening Payment...</>
                      : <>🔒 Pay ₹{finalTotal} via Razorpay</>
                    }
                  </button>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'18px'}}>
                  {[['🔒','100% Secure','256-bit SSL'],['⚡','Instant','Confirmation'],['↩','Easy','Refund']].map(([e,t,s])=>(
                    <div key={t} style={{background:'rgba(10,15,30,0.4)',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                      <div style={{fontSize:'20px',marginBottom:'4px'}}>{e}</div>
                      <div style={{fontSize:'13px',fontWeight:600,color:'#f1f5f9'}}>{t}</div>
                      <div style={{fontSize:'11px',color:'#64748b'}}>{s}</div>
                    </div>
                  ))}
                </div>

                <div style={{background:'rgba(34,197,94,0.07)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'#22c55e',lineHeight:1.7}}>
                  ✓ Your payment is 100% secure &nbsp;•&nbsp; ✓ Instant booking confirmation &nbsp;•&nbsp; ✓ Refund within 5-7 days if cancelled
                </div>

                <button onClick={()=>setStep(2)} style={{marginTop:'16px',background:'rgba(148,163,184,0.1)',color:'#94a3b8',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'10px',padding:'10px 22px',fontSize:'14px',cursor:'pointer'}}>
                  ← Back to Passenger Details
                </button>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div>
            <div style={{background:'#1e2d50',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'14px',padding:'20px',position:'sticky',top:'100px'}}>
              <h3 style={{fontFamily:'Syne',fontSize:'15px',fontWeight:700,color:'#f97316',marginBottom:'16px'}}>Booking Summary</h3>
              <div style={{fontSize:'14px',fontWeight:600,marginBottom:'4px'}}>{route.from} → {route.to}</div>
              <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'2px'}}>{new Date(travelDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
              <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'14px'}}>{route.departureTime} → {route.arrivalTime}</div>

              {selectedSeats.length > 0 && (
                <div style={{marginBottom:'14px'}}>
                  <div style={{fontSize:'11px',color:'#64748b',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Selected Seats</div>
                  <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                    {selectedSeats.map(s=><span key={s} style={{background:'rgba(249,115,22,0.15)',color:'#f97316',padding:'2px 8px',borderRadius:'20px',fontSize:'12px',fontWeight:600}}>{s}</span>)}
                  </div>
                </div>
              )}

              <div style={{borderTop:'1px solid rgba(148,163,184,0.1)',paddingTop:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#94a3b8',marginBottom:'7px'}}>
                  <span>Base Fare × {selectedSeats.length}</span><span>₹{total}</span>
                </div>
                {discount > 0 && (
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#22c55e',marginBottom:'7px'}}>
                    <span>Discount (5%)</span><span>-₹{discount}</span>
                  </div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'16px',fontWeight:700,color:'#f97316',borderTop:'1px solid rgba(148,163,184,0.1)',paddingTop:'10px',marginTop:'4px'}}>
                  <span style={{color:'#f1f5f9'}}>Total</span><span>₹{finalTotal}</span>
                </div>
              </div>

              <div style={{marginTop:'14px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'8px',padding:'10px',fontSize:'12px',color:'#22c55e',lineHeight:1.6}}>
                ✓ Free cancellation 24h before travel<br/>
                ✓ Instant e-ticket on email<br/>
                ✓ Powered by Razorpay
              </div>

              <div style={{marginTop:'12px',textAlign:'center'}}>
                <img src="https://razorpay.com/favicon.png" alt="" style={{width:'20px',height:'20px',verticalAlign:'middle',marginRight:'6px'}}/>
                <span style={{fontSize:'11px',color:'#64748b'}}>Secured by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}