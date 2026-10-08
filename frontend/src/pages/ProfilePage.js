import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import SavedPassengersManager from '../components/SavedPassengers/SavedPassengersManager';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name:user?.name||'', phone:user?.phone||'' });
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [loading, setLoading] = useState(false);

  const inp = { width:'100%',background:'rgba(10,15,30,0.7)',border:'1px solid rgba(148,163,184,0.2)',borderRadius:'9px',padding:'11px 14px',color:'#f1f5f9',fontSize:'14px',outline:'none',marginBottom:'14px',boxSizing:'border-box' };
  const lbl = { fontSize:'11px',fontWeight:700,color:'#94a3b8',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'5px' };

  const handleUpdate = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await authAPI.update(form);
      updateUser(data.user); toast.success('Profile updated!');
    } catch(err) { toast.error(err.response?.data?.message||'Update failed'); }
    finally { setLoading(false); }
  };

  const handlePw = async e => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword:pw.currentPassword, newPassword:pw.newPassword });
      toast.success('Password changed!'); setPw({ currentPassword:'',newPassword:'',confirm:'' });
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',paddingTop:'80px'}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'32px 40px'}}>
        <h1 style={{fontFamily:'Syne',fontSize:'28px',fontWeight:800,marginBottom:'24px'}}>My Profile</h1>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'16px',padding:'24px'}}>
            <div style={{textAlign:'center',marginBottom:'22px'}}>
              <div style={{width:'72px',height:'72px',background:'rgba(249,115,22,0.15)',border:'2px solid rgba(249,115,22,0.3)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>
                <User size={32} color="#f97316"/>
              </div>
              <div style={{fontFamily:'Syne',fontSize:'18px',fontWeight:700}}>{user?.name}</div>
              <div style={{color:'#94a3b8',fontSize:'13px'}}>{user?.email}</div>
              <span style={{background:'rgba(249,115,22,0.12)',color:'#f97316',padding:'3px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:600,marginTop:'6px',display:'inline-block',textTransform:'capitalize'}}>{user?.role}</span>
            </div>
            <form onSubmit={handleUpdate}>
              <label style={lbl}>Full Name</label>
              <input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              <label style={lbl}>Phone</label>
              <input style={inp} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
              <label style={lbl}>Email</label>
              <input style={{...inp,opacity:.5,cursor:'not-allowed'}} value={user?.email} readOnly/>
              <button type="submit" disabled={loading} style={{width:'100%',background:'#f97316',color:'#fff',border:'none',borderRadius:'9px',padding:'12px',fontSize:'14px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'7px',fontFamily:'Syne'}}>
                <Save size={15}/>{loading?'Saving...':'Save Changes'}
              </button>
            </form>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{background:'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(251,146,60,0.07))',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'16px',padding:'24px',textAlign:'center'}}>
              <div style={{fontSize:'13px',color:'#94a3b8',marginBottom:'6px'}}>Wallet Balance</div>
              <div style={{fontFamily:'Syne',fontSize:'34px',fontWeight:800,color:'#f97316'}}>₹{user?.wallet||0}</div>
              <button style={{marginTop:'14px',background:'#f97316',color:'#fff',border:'none',borderRadius:'8px',padding:'9px 22px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>Add Money</button>
            </div>
            <div style={{background:'#1e2d50',border:'1px solid rgba(148,163,184,0.1)',borderRadius:'16px',padding:'22px',flex:1}}>
              <h3 style={{fontFamily:'Syne',fontSize:'15px',fontWeight:700,marginBottom:'16px',display:'flex',alignItems:'center',gap:'8px'}}><Lock size={15} color="#f97316"/>Change Password</h3>
              <form onSubmit={handlePw}>
                {[['currentPassword','Current Password'],['newPassword','New Password'],['confirm','Confirm']].map(([k,l])=>(
                  <div key={k}><label style={{...lbl,fontSize:'11px'}}>{l}</label><input type="password" style={inp} value={pw[k]} onChange={e=>setPw({...pw,[k]:e.target.value})} required/></div>
                ))}
                <button type="submit" style={{width:'100%',background:'#1a2540',color:'#f97316',border:'1px solid rgba(249,115,22,0.35)',borderRadius:'9px',padding:'11px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Saved Passengers — full width, below the profile/wallet grid */}
        <div style={{ marginTop: '20px' }}>
          <SavedPassengersManager />
        </div>
      </div>
    </div>
  );
}