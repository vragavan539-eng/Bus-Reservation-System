import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { busAPI } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyBus = { busNumber:'', busName:'', operator:'', busType:'AC', totalSeats:40, amenities:'', features:{ wifi:false, ac:true, charging:false, gps:false, ccCamera:false }, images:'' };

export default function AdminBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyBus);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchBuses(); }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try { const { data } = await busAPI.getAll(); setBuses(data.buses); }
    catch { toast.error('Failed to load buses'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(emptyBus); setEditing(null); setModal(true); };
  const openEdit = (bus) => {
    setForm({ ...bus, amenities: bus.amenities?.join(', ')||'', images: bus.images?.join(', ')||'' });
    setEditing(bus._id); setModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = { ...form, amenities: form.amenities.split(',').map(s=>s.trim()).filter(Boolean), images: form.images.split(',').map(s=>s.trim()).filter(Boolean) };
    try {
      if (editing) { await busAPI.update(editing, payload); toast.success('Bus updated!'); }
      else { await busAPI.create(payload); toast.success('Bus added!'); }
      setModal(false); fetchBuses();
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this bus?')) return;
    try { await busAPI.delete(id); toast.success('Bus deleted'); fetchBuses(); }
    catch { toast.error('Delete failed'); }
  };

  const inp = { width:'100%',background:'rgba(10,15,30,0.7)',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'8px',padding:'10px 12px',color:'#f1f5f9',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'12px' };

  return (
    <AdminLayout title="Manage Buses">
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'20px'}}>
        <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:'8px',background:'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'11px 22px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'Syne'}}>
          <Plus size={16}/> Add Bus
        </button>
      </div>

      {loading ? <div style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}>Loading...</div> : (
        <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'14px',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'rgba(10,15,30,0.5)',borderBottom:'1px solid rgba(148,163,184,0.1)'}}>
                {['Bus Name','Number','Operator','Type','Seats','Rating','Status','Actions'].map(h=>(
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'12px',fontWeight:700,color:'#64748b',letterSpacing:'1px',textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buses.map(bus=>(
                <tr key={bus._id} style={{borderBottom:'1px solid rgba(148,163,184,0.07)',transition:'background .2s'}}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(249,115,22,0.04)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',fontSize:'14px',fontWeight:600,color:'#f1f5f9'}}>{bus.busName}</td>
                  <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{bus.busNumber}</td>
                  <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{bus.operator}</td>
                  <td style={{padding:'12px 16px'}}><span style={{background:'rgba(249,115,22,0.12)',color:'#f97316',padding:'2px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600}}>{bus.busType}</span></td>
                  <td style={{padding:'12px 16px',fontSize:'13px',color:'#f1f5f9'}}>{bus.totalSeats}</td>
                  <td style={{padding:'12px 16px',fontSize:'13px',color:'#fbbf24'}}>★ {bus.rating?.toFixed(1)}</td>
                  <td style={{padding:'12px 16px'}}><span style={{color:bus.isActive?'#22c55e':'#ef4444',fontSize:'13px',fontWeight:600}}>{bus.isActive?'Active':'Inactive'}</span></td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button onClick={()=>openEdit(bus)} style={{background:'rgba(59,130,246,0.12)',color:'#3b82f6',border:'none',borderRadius:'7px',padding:'6px 10px',cursor:'pointer'}}><Edit size={14}/></button>
                      <button onClick={()=>handleDelete(bus._id)} style={{background:'rgba(239,68,68,0.12)',color:'#ef4444',border:'none',borderRadius:'7px',padding:'6px 10px',cursor:'pointer'}}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}>
          <div style={{background:'#1e2d50',border:'1px solid rgba(249,115,22,0.25)',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'520px',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{fontFamily:'Syne',fontSize:'18px',fontWeight:700}}>{editing?'Edit Bus':'Add New Bus'}</h2>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8'}}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              {[['busName','Bus Name','text'],['busNumber','Bus Number','text'],['operator','Operator','text']].map(([k,l,t])=>(
                <div key={k}>
                  <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>{l}</label>
                  <input style={inp} type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required/>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                <div>
                  <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Bus Type</label>
                  <select style={inp} value={form.busType} onChange={e=>setForm({...form,busType:e.target.value})}>
                    {['AC','Non-AC','Sleeper','Semi-Sleeper','Luxury','Volvo'].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Total Seats</label>
                  <input style={inp} type="number" value={form.totalSeats} onChange={e=>setForm({...form,totalSeats:e.target.value})} required/>
                </div>
              </div>
              <div>
                <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Amenities (comma separated)</label>
                <input style={inp} value={form.amenities} onChange={e=>setForm({...form,amenities:e.target.value})} placeholder="WiFi, AC, USB Charging"/>
              </div>
              <div>
                <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'8px'}}>Features</label>
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}}>
                  {['wifi','ac','charging','gps','ccCamera'].map(feat=>(
                    <label key={feat} style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',fontSize:'13px',color:'#e2e8f0'}}>
                      <input type="checkbox" checked={form.features[feat]} onChange={e=>setForm({...form,features:{...form.features,[feat]:e.target.checked}})} style={{accentColor:'#f97316'}}/>
                      {feat.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Image URLs (comma separated)</label>
                <input style={inp} value={form.images} onChange={e=>setForm({...form,images:e.target.value})} placeholder="https://..."/>
              </div>
              <button type="submit" style={{width:'100%',background:'#f97316',color:'#fff',border:'none',borderRadius:'9px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'Syne',marginTop:'4px'}}>
                {editing ? 'Update Bus' : 'Add Bus'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}