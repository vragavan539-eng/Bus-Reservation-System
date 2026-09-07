import React, { useState } from 'react';
import { MapPin, Bus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackBusPage() {
  const [pnr, setPnr] = useState('');
  const [tracking, setTracking] = useState(null);

  const handleTrack = () => {
    if (!pnr.trim()) { toast.error('Enter PNR number'); return; }
    setTracking({
      busName:'Chennai Express', operator:'TNSTC', from:'Chennai', to:'Coimbatore',
      currentLocation:'Salem Bypass', speed:'72 km/h', eta:'05:45 AM', delay:'15 mins', progress:60,
      stops:[
        { name:'Chennai', time:'22:00', status:'departed' },
        { name:'Vellore', time:'23:30', status:'departed' },
        { name:'Salem', time:'01:30', status:'current' },
        { name:'Coimbatore', time:'06:00', status:'upcoming' },
      ]
    });
  };

  const statusColor = { departed:'#22c55e', current:'#f97316', upcoming:'#64748b' };

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',paddingTop:'80px'}}>
      <div style={{maxWidth:'700px',margin:'0 auto',padding:'40px'}}>
        <h1 style={{fontFamily:'Syne',fontSize:'32px',fontWeight:800,marginBottom:'6px'}}>Live Bus Tracking</h1>
        <p style={{color:'#94a3b8',marginBottom:'28px'}}>Enter your PNR to track your bus in real-time</p>

        <div style={{display:'flex',gap:'10px',marginBottom:'28px'}}>
          <input placeholder="Enter PNR number (e.g. PNRXYZ123)" value={pnr} onChange={e=>setPnr(e.target.value)}
            style={{flex:1,background:'#1e2d50',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'10px',padding:'14px 18px',color:'#f1f5f9',fontSize:'15px',outline:'none'}}/>
          <button onClick={handleTrack} style={{background:'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'14px 24px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'Syne'}}>
            Track 📍
          </button>
        </div>

        {tracking && (
          <div>
            <div style={{background:'#1e2d50',border:'1px solid rgba(249,115,22,0.25)',borderRadius:'16px',padding:'24px',marginBottom:'20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px',flexWrap:'wrap',gap:'12px'}}>
                <div>
                  <h2 style={{fontFamily:'Syne',fontSize:'20px',fontWeight:700,marginBottom:'4px'}}>{tracking.busName}</h2>
                  <div style={{color:'#94a3b8',fontSize:'13px'}}>{tracking.operator} • {tracking.from} → {tracking.to}</div>
                </div>
                <div style={{background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'20px',padding:'6px 14px',fontSize:'13px',color:'#22c55e',fontWeight:600}}>
                  🟢 Live
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
                {[['📍 Location',tracking.currentLocation],['🚀 Speed',tracking.speed],['🕐 ETA',tracking.eta]].map(([l,v])=>(
                  <div key={l} style={{background:'rgba(10,15,30,0.5)',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                    <div style={{fontSize:'11px',color:'#64748b',marginBottom:'4px'}}>{l}</div>
                    <div style={{fontSize:'14px',fontWeight:600,color:'#f1f5f9'}}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{marginBottom:'8px',display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:'12px',color:'#94a3b8'}}>Journey Progress</span>
                <span style={{fontSize:'12px',color:'#f97316',fontWeight:600}}>{tracking.progress}%</span>
              </div>
              <div style={{height:'8px',background:'rgba(148,163,184,0.15)',borderRadius:'4px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${tracking.progress}%`,background:'linear-gradient(90deg,#f97316,#fb923c)',borderRadius:'4px',transition:'width 1s'}}/>
              </div>
            </div>

            <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'16px',padding:'24px'}}>
              <h3 style={{fontFamily:'Syne',fontSize:'16px',fontWeight:700,marginBottom:'20px'}}>Route Stops</h3>
              {tracking.stops.map((stop, i)=>(
                <div key={stop.name} style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:i<tracking.stops.length-1?'0':'0'}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0'}}>
                    <div style={{width:'16px',height:'16px',borderRadius:'50%',background:statusColor[stop.status],border:'3px solid rgba(30,45,80,1)',flexShrink:0}}/>
                    {i < tracking.stops.length-1 && <div style={{width:'2px',height:'40px',background:`linear-gradient(${statusColor[stop.status]},${statusColor[tracking.stops[i+1].status]})`}}/>}
                  </div>
                  <div style={{flex:1,paddingBottom:i<tracking.stops.length-1?'24px':'0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:'15px',fontWeight:stop.status==='current'?700:500,color:stop.status==='current'?'#f97316':'#f1f5f9'}}>{stop.name}</div>
                      {stop.status === 'current' && <div style={{fontSize:'12px',color:'#f97316',fontWeight:600}}>📍 Bus is here now</div>}
                    </div>
                    <div style={{fontSize:'13px',color:'#94a3b8'}}>{stop.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}