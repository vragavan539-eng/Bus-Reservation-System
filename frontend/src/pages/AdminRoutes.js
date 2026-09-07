import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { routeAPI, busAPI } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyRoute = { from:'', to:'', bus:'', departureTime:'', arrivalTime:'', duration:'', distance:'', basePrice:'', availableDays:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] };

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyRoute);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    routeAPI.getAll().then(r=>setRoutes(r.data.routes)).catch(()=>{});
    busAPI.getAll().then(r=>setBuses(r.data.buses)).catch(()=>{});
  }, []);

  const fetchRoutes = () => routeAPI.getAll().then(r=>setRoutes(r.data.routes)).catch(()=>{});

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) { await routeAPI.update(editing, form); toast.success('Route updated!'); }
      else { await routeAPI.create(form); toast.success('Route added!'); }
      setModal(false); fetchRoutes();
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this route?')) return;
    try { await routeAPI.delete(id); toast.success('Deleted'); fetchRoutes(); }
    catch { toast.error('Delete failed'); }
  };

  const inp = { width:'100%',background:'rgba(10,15,30,0.7)',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'8px',padding:'10px 12px',color:'#f1f5f9',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'12px' };

  return (
    <AdminLayout title="Manage Routes">
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'20px'}}>
        <button onClick={()=>{setForm(emptyRoute);setEditing(null);setModal(true);}} style={{display:'flex',alignItems:'center',gap:'8px',background:'#f97316',color:'#fff',border:'none',borderRadius:'10px',padding:'11px 22px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'Syne'}}>
          <Plus size={16}/> Add Route
        </button>
      </div>

      <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'14px',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'rgba(10,15,30,0.5)',borderBottom:'1px solid rgba(148,163,184,0.1)'}}>
              {['Route','Bus','Departure','Arrival','Duration','Base Price','Actions'].map(h=>(
                <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'12px',fontWeight:700,color:'#64748b',letterSpacing:'1px',textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map(r=>(
              <tr key={r._id} style={{borderBottom:'1px solid rgba(148,163,184,0.07)',transition:'background .2s'}}
                onMouseOver={e=>e.currentTarget.style.background='rgba(249,115,22,0.04)'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'12px 16px',fontSize:'14px',fontWeight:600,color:'#f1f5f9'}}>{r.from} → {r.to}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{r.bus?.busName}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{r.departureTime}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{r.arrivalTime}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{r.duration}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',fontWeight:600,color:'#f97316'}}>₹{r.basePrice}</td>
                <td style={{padding:'12px 16px'}}>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={()=>{setForm({...r,bus:r.bus?._id||r.bus});setEditing(r._id);setModal(true);}} style={{background:'rgba(59,130,246,0.12)',color:'#3b82f6',border:'none',borderRadius:'7px',padding:'6px 10px',cursor:'pointer'}}><Edit size={14}/></button>
                    <button onClick={()=>handleDelete(r._id)} style={{background:'rgba(239,68,68,0.12)',color:'#ef4444',border:'none',borderRadius:'7px',padding:'6px 10px',cursor:'pointer'}}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}>
          <div style={{background:'#1e2d50',border:'1px solid rgba(249,115,22,0.25)',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'480px',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{fontFamily:'Syne',fontSize:'18px',fontWeight:700}}>{editing?'Edit Route':'Add Route'}</h2>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8'}}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                {[['from','From'],['to','To']].map(([k,l])=>(
                  <div key={k}>
                    <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'1px'}}>{l}</label>
                    <input style={inp} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required/>
                  </div>
                ))}
              </div>
              <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'1px'}}>Bus</label>
              <select style={inp} value={form.bus} onChange={e=>setForm({...form,bus:e.target.value})} required>
                <option value="">Select Bus</option>
                {buses.map(b=><option key={b._id} value={b._id}>{b.busName} ({b.busType})</option>)}
              </select>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                {[['departureTime','Departure'],['arrivalTime','Arrival'],['duration','Duration'],['distance','Distance (km)'],['basePrice','Base Price (₹)']].map(([k,l])=>(
                  <div key={k}>
                    <label style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'1px'}}>{l}</label>
                    <input style={inp} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required/>
                  </div>
                ))}
              </div>
              <button type="submit" style={{width:'100%',background:'#f97316',color:'#fff',border:'none',borderRadius:'9px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'Syne'}}>
                {editing ? 'Update Route' : 'Add Route'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}