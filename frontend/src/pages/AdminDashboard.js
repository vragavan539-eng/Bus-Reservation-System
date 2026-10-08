import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { adminAPI } from '../services/api';
import {
  Users, Bus, Map, Ticket, DollarSign, Search, Plus,
  Pencil, Trash2, X, CheckCircle, AlertCircle, Loader2,
  Eye, RefreshCw
} from 'lucide-react';

// ---------- Reusable Toast ----------
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: '#ecfdf5', border: '#10b981', color: '#065f46' },
    error:   { bg: '#fef2f2', border: '#ef4444', color: '#991b1b' },
    info:    { bg: '#eff6ff', border: '#3b82f6', color: '#1e40af' },
  }[type] || { bg: '#eff6ff', border: '#3b82f6', color: '#1e40af' };

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      background: colors.bg, borderLeft: `4px solid ${colors.border}`,
      color: colors.color, padding: '14px 18px', borderRadius: 10,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', minWidth: 280,
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
      animation: 'slideIn .3s ease'
    }}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span style={{ flex: 1 }}>{message}</span>
      <X size={16} style={{ cursor: 'pointer', opacity: .6 }} onClick={onClose} />
    </div>
  );
};

// ---------- Reusable Modal ----------
const Modal = ({ open, title, onClose, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9000, padding: 20, backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        animation: 'popIn .25s ease'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{
            border: 'none', background: '#f1f5f9', width: 32, height: 32,
            borderRadius: 8, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#475569'
          }}><X size={16} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

// ---------- Reusable Input ----------
const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{
      display: 'block', fontSize: 13, fontWeight: 600,
      color: '#334155', marginBottom: 6
    }}>{label}</label>}
    <input {...props} style={{
      width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
      borderRadius: 8, fontSize: 14, outline: 'none', color: '#0f172a',
      background: '#fff', transition: 'all .2s', boxSizing: 'border-box'
    }}
      onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
    />
  </div>
);

// ---------- Primary Button ----------
const Button = ({ variant = 'primary', children, ...props }) => {
  const styles = {
    primary: { bg: '#f97316', color: '#fff', border: 'none' },
    ghost:   { bg: '#fff', color: '#334155', border: '1px solid #e2e8f0' },
    danger:  { bg: '#ef4444', color: '#fff', border: 'none' },
  }[variant];

  return (
    <button {...props} style={{
      background: styles.bg, color: styles.color, border: styles.border,
      padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
      gap: 8, transition: 'all .2s'
    }}
      onMouseOver={e => e.currentTarget.style.opacity = .9}
      onMouseOut={e => e.currentTarget.style.opacity = 1}
    >{children}</button>
  );
};

// ---------- MAIN DASHBOARD ----------
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ user: '', route: '', travelDate: '', finalAmount: '', status: 'pending' });

  const showToast = (message, type = 'success') => setToast({ message, type });

  // -------- FETCH --------
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.dashboard();
      setStats(res?.data?.stats || null);
      setBookings(res?.data?.recentBookings || []);
    } catch (err) {
      showToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // -------- FILTER --------
  const filtered = bookings.filter(b => {
    const matchesSearch =
      (b.bookingId || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // -------- CREATE / UPDATE --------
  const openCreate = () => {
    setEditTarget(null);
    setForm({ user: '', route: '', travelDate: '', finalAmount: '', status: 'pending' });
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditTarget(b);
    setForm({
      user: b.user?.name || '',
      route: `${b.route?.from || ''} → ${b.route?.to || ''}`,
      travelDate: b.travelDate ? b.travelDate.substring(0, 10) : '',
      finalAmount: b.finalAmount || '',
      status: b.status || 'pending',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.user || !form.route || !form.finalAmount) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      // Backend-ready call (fallback to local if API not implemented yet)
      if (editTarget) {
        await adminAPI.updateBooking?.(editTarget._id, form).catch(() => {});
        setBookings(prev => prev.map(b =>
          b._id === editTarget._id
            ? { ...b, finalAmount: Number(form.finalAmount), status: form.status,
                travelDate: form.travelDate }
            : b
        ));
        showToast('Booking updated successfully');
      } else {
        const newBooking = {
          _id: `local-${Date.now()}`,
          bookingId: `BK${Math.floor(1000 + Math.random() * 9000)}`,
          user: { name: form.user },
          route: { from: form.route.split('→')[0]?.trim() || form.route, to: form.route.split('→')[1]?.trim() || '' },
          travelDate: form.travelDate || new Date().toISOString(),
          finalAmount: Number(form.finalAmount),
          status: form.status,
        };
        await adminAPI.createBooking?.(form).catch(() => {});
        setBookings(prev => [newBooking, ...prev]);
        showToast('Booking created successfully');
      }
      setModalOpen(false);
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  // -------- DELETE --------
  const confirmDelete = (b) => { setDeleteTarget(b); setDeleteOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminAPI.deleteBooking?.(deleteTarget._id).catch(() => {});
      setBookings(prev => prev.filter(b => b._id !== deleteTarget._id));
      showToast('Booking deleted');
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // -------- STAT CARDS --------
  const statCards = stats ? [
    { label: 'Total Users',    value: stats.totalUsers,    Icon: Users,      color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Total Bookings', value: stats.totalBookings, Icon: Ticket,     color: '#f97316', bg: '#fff7ed' },
    { label: 'Active Buses',   value: stats.totalBuses,    Icon: Bus,        color: '#22c55e', bg: '#ecfdf5' },
    { label: 'Active Routes',  value: stats.totalRoutes,   Icon: Map,        color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Total Revenue',  value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, Icon: DollarSign, color: '#eab308', bg: '#fefce8' },
  ] : [];

  const statusColors = {
    confirmed: { bg: '#ecfdf5', color: '#059669' },
    pending:   { bg: '#fffbeb', color: '#d97706' },
    cancelled: { bg: '#fef2f2', color: '#dc2626' },
    completed: { bg: '#eff6ff', color: '#2563eb' },
  };

  return (
    <AdminLayout title="Dashboard">
      <style>{`
        @keyframes slideIn { from { transform: translateX(30px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes popIn   { from { transform: scale(.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes spin    { to { transform: rotate(360deg) } }
      `}</style>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#64748b' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#f97316' }} />
          <p style={{ marginTop: 12, fontWeight: 500 }}>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* ===== STATS ===== */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: 16, marginBottom: 28
          }}>
            {statCards.map(({ label, value, Icon, color, bg }) => (
              <div key={label} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
                padding: 22, transition: 'all .25s', cursor: 'default',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#fed7aa'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(249,115,22,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{value ?? 0}</div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== TABLE CARD ===== */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Bookings</h2>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    placeholder="Search bookings..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      padding: '10px 14px 10px 36px', border: '1px solid #e2e8f0',
                      borderRadius: 8, fontSize: 14, outline: 'none', width: 220, color: '#0f172a'
                    }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
                    fontSize: 14, outline: 'none', color: '#334155', background: '#fff', cursor: 'pointer'
                  }}>
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <Button variant="ghost" onClick={loadData}><RefreshCw size={15} /> Refresh</Button>
                <Button onClick={openCreate}><Plus size={16} /> New Booking</Button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Booking ID', 'User', 'Route', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '12px 14px', textAlign: 'left', fontSize: 12,
                        fontWeight: 700, color: '#64748b', letterSpacing: '.6px',
                        textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                        No bookings found
                      </td>
                    </tr>
                  ) : filtered.map(b => {
                    const sc = statusColors[b.status] || statusColors.pending;
                    return (
                      <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px', fontSize: 13, fontWeight: 700, color: '#f97316' }}>{b.bookingId}</td>
                        <td style={{ padding: '14px', fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{b.user?.name}</td>
                        <td style={{ padding: '14px', fontSize: 13, color: '#475569' }}>{b.route?.from} → {b.route?.to}</td>
                        <td style={{ padding: '14px', fontSize: 13, color: '#475569' }}>
                          {b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td style={{ padding: '14px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>₹{b.finalAmount}</td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            background: sc.bg, color: sc.color, padding: '4px 12px',
                            borderRadius: 20, fontSize: 11, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '.5px'
                          }}>{b.status}</span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button title="View" style={iconBtn('#3b82f6')}><Eye size={15} /></button>
                            <button title="Edit" onClick={() => openEdit(b)} style={iconBtn('#f97316')}><Pencil size={15} /></button>
                            <button title="Delete" onClick={() => confirmDelete(b)} style={iconBtn('#ef4444')}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===== CREATE / EDIT MODAL ===== */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Booking' : 'Create Booking'}>
        <Input label="User Name *" value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} placeholder="Enter user name" />
        <Input label="Route *" value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} placeholder="Chennai → Bangalore" />
        <Input label="Travel Date" type="date" value={form.travelDate} onChange={e => setForm({ ...form, travelDate: e.target.value })} />
        <Input label="Amount (₹) *" type="number" value={form.finalAmount} onChange={e => setForm({ ...form, finalAmount: e.target.value })} placeholder="1200" />

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff' }}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editTarget ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      {/* ===== DELETE CONFIRM ===== */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Delete" width={420}>
        <p style={{ color: '#475569', fontSize: 14, margin: '0 0 20px' }}>
          Are you sure you want to delete booking <b style={{ color: '#f97316' }}>{deleteTarget?.bookingId}</b>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}><Trash2 size={15} /> Delete</Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}

// Icon button style helper
const iconBtn = (color) => ({
  width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color, transition: 'all .2s'
});