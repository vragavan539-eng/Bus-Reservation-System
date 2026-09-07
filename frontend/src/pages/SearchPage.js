import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { routeAPI } from '../services/api';
import { Filter, Bus, Star, Wifi, Wind, Zap, ChevronRight } from 'lucide-react';

const cities = ['Chennai','Coimbatore','Madurai','Trichy','Salem','Vellore','Pondicherry','Tirunelveli'];
const typeColors = { AC:'#3b82f6','Non-AC':'#94a3b8',Sleeper:'#8b5cf6',Volvo:'#f97316',Luxury:'#fbbf24','Semi-Sleeper':'#22c55e' };

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ busType:'', maxPrice:'2000', sortBy:'price' });
  const [sf, setSf] = useState({ from:params.get('from')||'', to:params.get('to')||'', date:params.get('date')||new Date().toISOString().split('T')[0] });

  useEffect(() => { fetchRoutes(); }, [params.toString()]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data } = await routeAPI.search({ from:params.get('from'), to:params.get('to'), date:params.get('date'), busType:filters.busType, maxPrice:filters.maxPrice, sortBy:filters.sortBy });
      setRoutes(data.routes);
    } catch { setRoutes([]); } finally { setLoading(false); }
  };

  const handleSearch = e => {
    e.preventDefault();
    navigate(`/search?from=${sf.from}&to=${sf.to}&date=${sf.date}`);
  };

  const sInp = { background:'#1e2d50',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'8px',padding:'10px 14px',color:'#f1f5f9',fontSize:'14px',outline:'none' };
  const lbl = { fontSize:'11px',fontWeight:700,color:'#64748b',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'5px' };

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',paddingTop:'80px'}}>
      {/* Top bar */}
      <div style={{background:'#0d1630',borderBottom:'1px solid rgba(148,163,184,0.1)',padding:'18px 40px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <form onSubmit={handleSearch} style={{display:'flex',gap:'12px',alignItems:'flex-end',flexWrap:'wrap'}}>
            {[['From','from'],['To','to']].map(([label,key])=>(
              <div key={key}>
                <label style={lbl}>{label}</label>
                <select style={sInp} value={sf[key]} onChange={e=>setSf({...sf,[key]:e.target.value})}>
                  {cities.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={lbl}>Date</label>
              <input type="date" style={sInp} value={sf.date} onChange={e=>setSf({...sf,date:e.target.value})}/>
            </div>
            <button type="submit" style={{background:'#f97316',color:'#fff',border:'none',borderRadius:'8px',padding:'10px 24px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'Syne'}}>
              Search
            </button>
          </form>
        </div>
      </div>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'28px 40px',display:'grid',gridTemplateColumns:'250px 1fr',gap:'24px'}}>
        {/* Filters */}
        <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'16px',padding:'22px',height:'fit-content',position:'sticky',top:'100px'}}>
          <h3 style={{fontFamily:'Syne',fontSize:'15px',fontWeight:700,marginBottom:'18px',display:'flex',alignItems:'center',gap:'8px'}}><Filter size={15} color="#f97316"/>Filters</h3>

          <div style={{marginBottom:'20px'}}>
            <label style={{...lbl,fontSize:'11px'}}>Bus Type</label>
            {['AC','Non-AC','Sleeper','Volvo','Luxury'].map(type=>(
              <label key={type} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',cursor:'pointer'}}>
                <input type="radio" name="bt" value={type} checked={filters.busType===type} onChange={e=>setFilters({...filters,busType:e.target.value})} style={{accentColor:'#f97316'}}/>
                <span style={{fontSize:'14px'}}>{type}</span>
              </label>
            ))}
            {filters.busType && <button onClick={()=>setFilters({...filters,busType:''})} style={{fontSize:'12px',color:'#f97316',background:'none',border:'none',cursor:'pointer'}}>Clear</button>}
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{...lbl,fontSize:'11px'}}>Max Price: ₹{filters.maxPrice}</label>
            <input type="range" min={200} max={2000} step={100} value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})} style={{width:'100%',accentColor:'#f97316'}}/>
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{...lbl,fontSize:'11px'}}>Sort By</label>
            {[['price','Lowest Price'],['rating','Highest Rated'],['duration','Fastest']].map(([v,l])=>(
              <label key={v} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',cursor:'pointer'}}>
                <input type="radio" name="sort" value={v} checked={filters.sortBy===v} onChange={e=>setFilters({...filters,sortBy:e.target.value})} style={{accentColor:'#f97316'}}/>
                <span style={{fontSize:'14px'}}>{l}</span>
              </label>
            ))}
          </div>

          <button onClick={fetchRoutes} style={{width:'100%',background:'#f97316',color:'#fff',border:'none',borderRadius:'8px',padding:'11px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'Syne'}}>
            Apply Filters
          </button>
        </div>

        {/* Results */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px'}}>
            <h2 style={{fontFamily:'Syne',fontSize:'18px',fontWeight:700}}>
              {params.get('from')} → {params.get('to')}
              <span style={{color:'#94a3b8',fontSize:'14px',fontWeight:400,marginLeft:'10px'}}>{routes.length} buses found</span>
            </h2>
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'80px',color:'#94a3b8'}}>
              <Bus size={40} color="#f97316" style={{marginBottom:'12px'}}/>
              <p>Searching buses...</p>
            </div>
          ) : routes.length === 0 ? (
            <div style={{textAlign:'center',padding:'80px',background:'#1e2d50',borderRadius:'16px',border:'1px solid rgba(148,163,184,0.1)'}}>
              <Bus size={48} color="#64748b" style={{marginBottom:'12px'}}/>
              <h3 style={{fontFamily:'Syne',fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>No Buses Found</h3>
              <p style={{color:'#94a3b8'}}>Try different dates or routes</p>
            </div>
          ) : routes.map(route=>(
            <div key={route._id} style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'16px',padding:'22px',marginBottom:'14px',transition:'all .3s'}}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(249,115,22,0.35)';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.3)'}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(148,163,184,0.1)';e.currentTarget.style.boxShadow='none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'20px',flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px',flexWrap:'wrap'}}>
                    <span style={{fontFamily:'Syne',fontSize:'16px',fontWeight:700}}>{route.bus?.busName}</span>
                    <span style={{background:`${typeColors[route.bus?.busType]||'#94a3b8'}20`,color:typeColors[route.bus?.busType]||'#94a3b8',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600}}>{route.bus?.busType}</span>
                    <span style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'13px',color:'#fbbf24',fontWeight:600}}>
                      <Star size={13} fill="#fbbf24"/>{route.bus?.rating?.toFixed(1)} ({route.bus?.totalReviews})
                    </span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'14px'}}>
                    <div>
                      <div style={{fontFamily:'Syne',fontSize:'22px',fontWeight:800}}>{route.departureTime}</div>
                      <div style={{fontSize:'12px',color:'#94a3b8'}}>{route.from}</div>
                    </div>
                    <div style={{flex:1,textAlign:'center'}}>
                      <div style={{height:'1px',background:'rgba(148,163,184,0.2)',position:'relative',margin:'12px 0'}}>
                        <span style={{position:'absolute',top:'-10px',left:'50%',transform:'translateX(-50%)',background:'#1e2d50',padding:'0 8px',fontSize:'12px',color:'#94a3b8',whiteSpace:'nowrap'}}>⏱ {route.duration}</span>
                      </div>
                      {route.stops?.length > 0 && <div style={{fontSize:'11px',color:'#64748b'}}>{route.stops.length} stop(s)</div>}
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:'Syne',fontSize:'22px',fontWeight:800}}>{route.arrivalTime}</div>
                      <div style={{fontSize:'12px',color:'#94a3b8'}}>{route.to}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'14px',flexWrap:'wrap'}}>
                    {route.bus?.features?.wifi && <span style={{fontSize:'12px',color:'#94a3b8',display:'flex',alignItems:'center',gap:'4px'}}><Wifi size={12} color="#3b82f6"/>WiFi</span>}
                    {route.bus?.features?.ac && <span style={{fontSize:'12px',color:'#94a3b8',display:'flex',alignItems:'center',gap:'4px'}}><Wind size={12} color="#22c55e"/>AC</span>}
                    {route.bus?.features?.charging && <span style={{fontSize:'12px',color:'#94a3b8',display:'flex',alignItems:'center',gap:'4px'}}><Zap size={12} color="#fbbf24"/>Charging</span>}
                    <span style={{fontSize:'12px',color:'#22c55e',fontWeight:600}}>✓ {route.bus?.totalSeats} seats</span>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'12px',color:'#94a3b8'}}>Starting from</div>
                  <div style={{fontFamily:'Syne',fontSize:'26px',fontWeight:800,color:'#f97316'}}>₹{route.basePrice}</div>
                  <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'14px'}}>per person</div>
                  <button onClick={()=>navigate(`/booking/${route._id}?date=${params.get('date')}`)} style={{background:'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'10px 22px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'Syne',display:'flex',alignItems:'center',gap:'6px'}}>
                    Book Now <ChevronRight size={15}/>
                  </button>
                  <div style={{fontSize:'11px',color:'#22c55e',marginTop:'8px',fontWeight:600}}>✓ Instant Confirmation</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}