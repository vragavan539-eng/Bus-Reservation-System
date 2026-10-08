import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { adminAPI } from '../services/api';
import {
  Shield, ShieldOff, Search, RefreshCw, Loader2,
  Users as UsersIcon, Mail, Phone, X, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [acting, setActing] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (s = '') => {
    setLoading(true);
    try {
      const { data } = await adminAPI.users(s ? { search: s } : {});
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!confirmTarget) return;
    const { _id, isBlocked, name } = confirmTarget;
    setActing(true);
    try {
      if (isBlocked) {
        await adminAPI.unblock(_id);
        toast.success(`${name} unblocked`);
      } else {
        await adminAPI.block(_id);
        toast.success(`${name} blocked`);
      }
      setConfirmTarget(null);
      fetchUsers(search);
    } catch {
      toast.error('Action failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <AdminLayout title="Manage Users">

      {/* ============ HEADER ============ */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12,
        justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 400 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#94a3b8'
            }} />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUsers(search)}
              style={{
                width: '100%', padding: '10px 14px 10px 36px',
                border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, outline: 'none',
                color: '#0f172a', background: '#fff',
                boxSizing: 'border-box', transition: 'all .2s'
              }}
              onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <button onClick={() => fetchUsers(search)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f97316', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '10px 16px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer'
          }}>
            <Search size={15} /> Search
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            background: '#fff7ed', color: '#ea580c',
            padding: '8px 16px', borderRadius: 20,
            fontSize: 13, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 6
          }}>
            <UsersIcon size={14} />
            Total: {total} users
          </span>
          <button onClick={() => fetchUsers(search)} title="Refresh" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', color: '#334155',
            border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '10px 14px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer'
          }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ============ TABLE ============ */}
      {loading ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: 80, color: '#64748b'
        }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#f97316' }} />
          <p style={{ marginTop: 12, fontWeight: 500 }}>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 14, padding: 60, textAlign: 'center',
          color: '#64748b'
        }}>
          <UsersIcon size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>No users found</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            {search ? 'Try a different search' : 'Users will appear here'}
          </p>
        </div>
      ) : (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Name', 'Contact', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: 12, fontWeight: 700, color: '#64748b',
                      letterSpacing: '.6px', textTransform: 'uppercase',
                      borderBottom: '1px solid #e5e7eb'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>

                    {/* Name + Avatar */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: u.role === 'admin'
                            ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                            : 'linear-gradient(135deg,#f97316,#ea580c)',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0
                        }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                            {(u.name?.[0] || 'U').toUpperCase()}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: 14, fontWeight: 600, color: '#0f172a',
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis', maxWidth: 180
                          }}>{u.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 13, color: '#475569', marginBottom: 3
                      }}>
                        <Mail size={12} color="#94a3b8" />
                        <span style={{
                          whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis', maxWidth: 200
                        }}>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: 12, color: '#94a3b8'
                        }}>
                          <Phone size={11} color="#cbd5e1" /> {u.phone}
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: u.role === 'admin' ? '#fefce8' : '#eff6ff',
                        color: u.role === 'admin' ? '#ca8a04' : '#2563eb',
                        padding: '4px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '.5px'
                      }}>{u.role}</span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: u.isBlocked ? '#fef2f2' : '#ecfdf5',
                        color: u.isBlocked ? '#dc2626' : '#059669',
                        padding: '4px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '.5px'
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: u.isBlocked ? '#dc2626' : '#10b981'
                        }} />
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    {/* Joined */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => setConfirmTarget(u)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: u.isBlocked ? '#ecfdf5' : '#fef2f2',
                            color: u.isBlocked ? '#059669' : '#dc2626',
                            border: 'none', borderRadius: 8,
                            padding: '7px 14px', cursor: 'pointer',
                            fontSize: 12, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '.4px',
                            transition: 'all .2s'
                          }}>
                          {u.isBlocked
                            ? <><Shield size={13} /> Unblock</>
                            : <><ShieldOff size={13} /> Block</>}
                        </button>
                      ) : (
                        <span style={{
                          fontSize: 12, color: '#94a3b8',
                          fontStyle: 'italic', fontWeight: 500
                        }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ CONFIRM MODAL ============ */}
      {confirmTarget && (
        <div
          onClick={() => !acting && setConfirmTarget(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)'
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16,
              padding: 28, width: '100%', maxWidth: 420,
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              animation: 'popIn .25s ease'
            }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: confirmTarget.isBlocked ? '#ecfdf5' : '#fef2f2',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 16
            }}>
              {confirmTarget.isBlocked
                ? <Shield size={22} color="#059669" />
                : <AlertTriangle size={22} color="#dc2626" />}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              {confirmTarget.isBlocked ? 'Unblock this user?' : 'Block this user?'}
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 22px', lineHeight: 1.5 }}>
              <b style={{ color: '#f97316' }}>{confirmTarget.name}</b> ({confirmTarget.email}) will be{' '}
              {confirmTarget.isBlocked
                ? 'restored and can login again.'
                : 'blocked and will not be able to login.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={acting}
                style={{
                  padding: '10px 18px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#334155', fontSize: 14, fontWeight: 600,
                  cursor: acting ? 'wait' : 'pointer'
                }}>Cancel</button>
              <button
                onClick={handleBlock}
                disabled={acting}
                style={{
                  padding: '10px 18px', borderRadius: 8,
                  border: 'none',
                  background: confirmTarget.isBlocked ? '#059669' : '#dc2626',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: acting ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                {acting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                {confirmTarget.isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global keyframes */}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes popIn { from { transform: scale(.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </AdminLayout>
  );
}