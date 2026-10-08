import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { routeAPI, busAPI } from '../services/api';
import {
  Plus, Edit, Trash2, X, Search, RefreshCw,
  Loader2, Map as MapIcon, Clock, IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';

const emptyRoute = {
  from: '', to: '', bus: '', departureTime: '', arrivalTime: '',
  duration: '', distance: '', basePrice: '',
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
};

/* ---------- Reusable styles ---------- */
const inputStyle = {
  width: '100%',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '10px 12px',
  color: '#0f172a',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '12px',
  transition: 'all .2s'
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#475569',
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '6px'
};

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyRoute);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, bRes] = await Promise.all([
        routeAPI.getAll().catch(() => ({ data: { routes: [] } })),
        busAPI.getAll().catch(() => ({ data: { buses: [] } })),
      ]);
      setRoutes(rRes.data.routes || []);
      setBuses(bRes.data.buses || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const { data } = await routeAPI.getAll();
      setRoutes(data.routes || []);
    } catch {
      toast.error('Failed to refresh routes');
    }
  };

  const openAdd = () => {
    setForm(emptyRoute);
    setEditing(null);
    setModal(true);
  };

  const openEdit = (r) => {
    setForm({ ...r, bus: r.bus?._id || r.bus });
    setEditing(r._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, basePrice: Number(form.basePrice), distance: Number(form.distance) };
      if (editing) {
        await routeAPI.update(editing, payload);
        toast.success('Route updated!');
      } else {
        await routeAPI.create(payload);
        toast.success('Route added!');
      }
      setModal(false);
      fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await routeAPI.delete(deleteTarget._id);
      toast.success('Route deleted');
      setDeleteTarget(null);
      fetchRoutes();
    } catch {
      toast.error('Delete failed');
    }
  };

  /* ---------- Filter ---------- */
  const filtered = routes.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.from || '').toLowerCase().includes(q) ||
      (r.to || '').toLowerCase().includes(q) ||
      (r.bus?.busName || '').toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Manage Routes">

      {/* ============ HEADER ============ */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12,
        justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8'
          }} />
          <input
            placeholder="Search routes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '10px 14px 10px 36px',
              border: '1px solid #e2e8f0',
              borderRadius: 8, fontSize: 14, outline: 'none',
              width: 260, color: '#0f172a', background: '#fff'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', color: '#334155',
            border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '10px 16px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer'
          }}>
            <RefreshCw size={15} /> Refresh
          </button>

          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f97316', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '10px 20px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer'
          }}>
            <Plus size={16} /> Add Route
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
          <p style={{ marginTop: 12, fontWeight: 500 }}>Loading routes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 14, padding: 60, textAlign: 'center',
          color: '#64748b'
        }}>
          <MapIcon size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>No routes found</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            {search ? 'Try a different search' : 'Click "Add Route" to create one'}
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
                  {['Route', 'Bus', 'Departure', 'Arrival', 'Duration', 'Base Price', 'Actions'].map(h => (
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
                {filtered.map(r => (
                  <tr key={r._id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10,
                          background: '#fff7ed',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0
                        }}>
                          <MapIcon size={15} color="#f97316" />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                          {r.from} <span style={{ color: '#94a3b8', fontWeight: 400 }}>→</span> {r.to}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                      {r.bus?.busName || '-'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color="#94a3b8" /> {r.departureTime || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color="#94a3b8" /> {r.arrivalTime || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                      {r.duration || '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: '#ecfdf5', color: '#059669',
                        padding: '4px 12px', borderRadius: 20,
                        fontSize: 12, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 3
                      }}>
                        <IndianRupee size={12} />{r.basePrice}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(r)} title="Edit" style={{
                          background: '#eff6ff', color: '#2563eb',
                          border: 'none', borderRadius: 8,
                          padding: '7px 10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center'
                        }}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(r)} title="Delete" style={{
                          background: '#fef2f2', color: '#dc2626',
                          border: 'none', borderRadius: 8,
                          padding: '7px 10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center'
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ ADD / EDIT MODAL ============ */}
      {modal && (
        <div
          onClick={() => !saving && setModal(false)}
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
              padding: 28, width: '100%', maxWidth: 520,
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              animation: 'popIn .25s ease'
            }}>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 22,
              paddingBottom: 16, borderBottom: '1px solid #f1f5f9'
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editing ? 'Edit Route' : 'Add Route'}
              </h2>
              <button onClick={() => !saving && setModal(false)} style={{
                background: '#f1f5f9', border: 'none',
                width: 32, height: 32, borderRadius: 8,
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#475569'
              }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* From + To */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['from', 'From'], ['to', 'To']].map(([k, l]) => (
                  <div key={k}>
                    <label style={labelStyle}>{l}</label>
                    <input
                      style={inputStyle}
                      value={form[k]}
                      onChange={e => setForm({ ...form, [k]: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Bus */}
              <label style={labelStyle}>Bus</label>
              <select
                style={inputStyle}
                value={form.bus}
                onChange={e => setForm({ ...form, bus: e.target.value })}
                required>
                <option value="">Select Bus</option>
                {buses.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.busName} ({b.busType})
                  </option>
                ))}
              </select>

              {/* Time + Duration + Distance + Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['departureTime', 'Departure', 'time'],
                  ['arrivalTime', 'Arrival', 'time'],
                  ['duration', 'Duration', 'text'],
                  ['distance', 'Distance (km)', 'number'],
                  ['basePrice', 'Base Price (₹)', 'number']
                ].map(([k, l, t]) => (
                  <div key={k}>
                    <label style={labelStyle}>{l}</label>
                    <input
                      style={inputStyle}
                      type={t}
                      value={form[k]}
                      onChange={e => setForm({ ...form, [k]: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', background: saving ? '#fdba74' : '#f97316',
                  color: '#fff', border: 'none', borderRadius: 9,
                  padding: 13, fontSize: 14, fontWeight: 700,
                  cursor: saving ? 'wait' : 'pointer', marginTop: 6,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8
                }}>
                {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {saving ? 'Saving...' : (editing ? 'Update Route' : 'Add Route')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
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
              background: '#fef2f2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16
            }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Delete this route?
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 22px', lineHeight: 1.5 }}>
              <b style={{ color: '#f97316' }}>{deleteTarget.from} → {deleteTarget.to}</b> will be permanently removed. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} style={{
                padding: '10px 18px', borderRadius: 8,
                border: '1px solid #e2e8f0', background: '#fff',
                color: '#334155', fontSize: 14, fontWeight: 600,
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleDelete} style={{
                padding: '10px 18px', borderRadius: 8,
                border: 'none', background: '#dc2626',
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 6
              }}>
                <Trash2 size={15} /> Delete
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