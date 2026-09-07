import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { adminAPI } from '../services/api';
import { Shield, ShieldOff, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (s='') => {
    setLoading(true);
    try {
      const { data } = await adminAPI.users(s ? { search: s } : {});
      setUsers(data.users); setTotal(data.total);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleBlock = async (id, isBlocked) => {
    try {
      if (isBlocked) { await adminAPI.unblock(id); toast.success('User unblocked'); }
      else { await adminAPI.block(id); toast.success('User blocked'); }
      fetchUsers(search);
    } catch { toast.error('Action failed'); }
  };

  return (
    <AdminLayout title="Manage Users">
      <div style={{display:'flex',gap:'12px',marginBottom:'20px',alignItems:'center'}}>
        <div style={{display:'flex',gap:'8px',flex:1,maxWidth:'360px'}}>
          <input placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchUsers(search)}
            style={{flex:1,background:'#1e2d50',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'8px',padding:'9px 14px',color:'#f1f5f9',fontSize:'14px',outline:'none'}}/>
          <button onClick={()=>fetchUsers(search)} style={{background:'#f97316',color:'#fff',border:'none',borderRadius:'8px',padding:'9px 14px',cursor:'pointer'}}><Search size={16}/></button>
        </div>
        <span style={{color:'#94a3b8',fontSize:'13px'}}>Total: {total} users</span>
      </div>

      {loading ? <div style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}>Loading...</div> : (
        <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'14px',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'rgba(10,15,30,0.5)',borderBottom:'1px solid rgba(148,163,184,0.1)'}}>
                {['Name','Email','Phone','Role','Status','Joined','Actions'].map(h=>(
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'#64748b',letterSpacing:'1px',textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u._id} style={{borderBottom:'1px solid rgba(148,163,184,0.07)',transition:'background .2s'}}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(249,115,22,0.04)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',fontSize:'14px',fontWeight:600,color:'#f1f5f9'}}>{u.name}</td>
                  <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{u.email}</td>
                  <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{u.phone}</td>
                  <td style={{padding:'12px 16px'}}><span style={{background:u.role==='admin'?'rgba(251,191,36,0.15)':'rgba(59,130,246,0.12)',color:u.role==='admin'?'#fbbf24':'#3b82f6',padding:'2px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600,textTransform:'capitalize'}}>{u.role}</span></td>
                  <td style={{padding:'12px 16px'}}><span style={{color:u.isBlocked?'#ef4444':'#22c55e',fontSize:'13px',fontWeight:600}}>{u.isBlocked?'Blocked':'Active'}</span></td>
                  <td style={{padding:'12px 16px',fontSize:'13px',color:'#94a3b8'}}>{new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td style={{padding:'12px 16px'}}>
                    {u.role !== 'admin' && (
                      <button onClick={()=>handleBlock(u._id, u.isBlocked)} style={{display:'flex',alignItems:'center',gap:'5px',background:u.isBlocked?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)',color:u.isBlocked?'#22c55e':'#ef4444',border:'none',borderRadius:'7px',padding:'6px 12px',cursor:'pointer',fontSize:'12px',fontWeight:600}}>
                        {u.isBlocked ? <><Shield size={13}/> Unblock</> : <><ShieldOff size={13}/> Block</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}