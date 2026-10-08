import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { bookingAPI, adminAPI, routeAPI } from '../services/api';
import {
  Search, RefreshCw, Loader2, Ticket, ChevronLeft,
  ChevronRight, CreditCard, Calendar, Plus, Pencil,
  Trash2, X, Save, UserPlus, Minus
} from 'lucide-react';
import toast from 'react-hot-toast';

/*
  AdminBookings.js — with CRUD
  ---------------------------------------------------------
  New Booking : adminAPI.createBooking(payload)
  Edit        : adminAPI.updateBooking(id, payload)
  Delete      : styled confirmation dialog (same look as the
                "Delete this route?" dialog on Manage Routes),
                then adminAPI.deleteBooking(id)
*/

const statusStyles = {
  confirmed: { bg: '#ecfdf5', color: '#059669' },
  pending:   { bg: '#fffbeb', color: '#d97706' },
  cancelled: { bg: '#fef2f2', color: '#dc2626' },
  completed: { bg: '#eff6ff', color: '#2563eb' },
};

const paymentStyles = {
  paid:     { bg: '#ecfdf5', color: '#059669' },
  pending:  { bg: '#fffbeb', color: '#d97706' },
  failed:   { bg: '#fef2f2', color: '#dc2626' },
  refunded: { bg: '#f5f3ff', color: '#7c3aed' },
};

const thStyle = {
  padding: '14px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#64748b',
  letterSpacing: '.5px',
  textTransform: 'uppercase',
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
  lineHeight: 1.2
};

const tdStyle = {
  padding: '14px 12px',
  verticalAlign: 'middle',
  lineHeight: 1.4
};

const inputStyle = {
  width: '100%', background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#0f172a',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

const labelStyle = {
  fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px',
};

const emptyPassenger = { name: '', age: '', gender: 'Male', seatNumber: '' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  // CRUD modal state
  const [modalMode, setModalMode] = useState(null); // null | 'create' | 'edit'
  const [activeBooking, setActiveBooking] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create-form specific
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);

  const [form, setForm] = useState({
    routeId: '', travelDate: '', userEmail: '',
    passengers: [{ ...emptyPassenger }],
    finalAmount: '', status: 'confirmed', paymentStatus: 'paid',
  });

  useEffect(() => { fetchBookings(); }, [filter, page]);

  // Esc closes whichever dialog is open (a delete in progress cannot be dismissed)
  useEffect(() => {
    if (!deleteTarget && !modalMode) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (deleteTarget) { if (!deleting) setDeleteTarget(null); }
      else closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleteTarget, modalMode, deleting]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filter) params.status = filter;
      const { data } = await bookingAPI.allBookings(params);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const filtered = search
    ? bookings.filter(b => {
        const q = search.toLowerCase();
        return (
          (b.bookingId || '').toLowerCase().includes(q) ||
          (b.user?.name || '').toLowerCase().includes(q) ||
          (b.route?.from || '').toLowerCase().includes(q) ||
          (b.route?.to || '').toLowerCase().includes(q)
        );
      })
    : bookings;

  const tabs = [
    ['', 'All'],
    ['confirmed', 'Confirmed'],
    ['pending', 'Pending'],
    ['cancelled', 'Cancelled'],
    ['completed', 'Completed'],
  ];

  /* ───────── Create modal ───────── */
  const openCreate = async () => {
    setForm({
      routeId: '', travelDate: '', userEmail: '',
      passengers: [{ ...emptyPassenger }],
      finalAmount: '', status: 'confirmed', paymentStatus: 'paid',
    });
    setModalMode('create');
    if (routes.length === 0) {
      setRoutesLoading(true);
      try {
        const { data } = await routeAPI.getAll();
        setRoutes(data.routes || data || []);
      } catch {
        toast.error('Could not load routes');
      } finally {
        setRoutesLoading(false);
      }
    }
  };

  const selectedRoute = routes.find(r => r._id === form.routeId);

  const updatePassenger = (idx, field, val) => {
    setForm(f => ({
      ...f,
      passengers: f.passengers.map((p, i) => i === idx ? { ...p, [field]: val } : p),
    }));
  };
  const addPassengerRow = () => setForm(f => ({ ...f, passengers: [...f.passengers, { ...emptyPassenger }] }));
  const removePassengerRow = (idx) => setForm(f => ({ ...f, passengers: f.passengers.filter((_, i) => i !== idx) }));

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.routeId || !form.travelDate || !form.userEmail.trim()) {
      toast.error('Please fill route, travel date and user email');
      return;
    }
    if (form.passengers.some(p => !p.name || !p.age || !p.seatNumber)) {
      toast.error('Fill in all passenger fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        routeId: form.routeId,
        busId: selectedRoute?.bus?._id || selectedRoute?.bus,
        travelDate: form.travelDate,
        userEmail: form.userEmail.trim(),
        passengers: form.passengers,
        finalAmount: Number(form.finalAmount) || (selectedRoute?.basePrice || 0) * form.passengers.length,
        status: form.status,
        paymentStatus: form.paymentStatus,
      };
      await adminAPI.createBooking(payload);
      toast.success('Booking created');
      setModalMode(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create booking');
    } finally {
      setSaving(false);
    }
  };

  /* ───────── Edit modal ───────── */
  const openEdit = (booking) => {
    setActiveBooking(booking);
    setForm(f => ({
      ...f,
      travelDate: booking.travelDate ? new Date(booking.travelDate).toISOString().split('T')[0] : '',
      finalAmount: booking.finalAmount || '',
      status: booking.status || 'confirmed',
      paymentStatus: booking.paymentStatus || 'paid',
    }));
    setModalMode('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateBooking(activeBooking._id, {
        travelDate: form.travelDate,
        finalAmount: Number(form.finalAmount) || 0,
        status: form.status,
        paymentStatus: form.paymentStatus,
      });
      toast.success('Booking updated');
      setModalMode(null);
      setActiveBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update booking');
    } finally {
      setSaving(false);
    }
  };

  /* ───────── Delete (confirmation dialog) ───────── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAPI.deleteBooking(deleteTarget._id);
      toast.success('Booking deleted');
      setDeleteTarget(null);
      // deleting the only row on the last page would leave an empty page, so step back one page
      if (bookings.length === 1 && page > 1) setPage(p => p - 1);
      else fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete booking');
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => { setModalMode(null); setActiveBooking(null); };

  return (
    <AdminLayout title="All Bookings">

      {/* ============ HEADER ============ */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12,
        justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20
      }}>
        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 4, background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 10, padding: 4,
          flexWrap: 'wrap'
        }}>
          {tabs.map(([v, l]) => {
            const active = filter === v;
            return (
              <button
                key={v}
                onClick={() => { setFilter(v); setPage(1); }}
                style={{
                  padding: '8px 14px', borderRadius: 7,
                  border: 'none', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  background: active ? '#f97316' : 'transparent',
                  color: active ? '#fff' : '#64748b',
                  transition: 'all .2s',
                  whiteSpace: 'nowrap'
                }}>
                {l}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          flexWrap: 'wrap', flexShrink: 0
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#94a3b8',
              pointerEvents: 'none'
            }} />
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '10px 14px 10px 36px',
                border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, outline: 'none',
                width: 200, color: '#0f172a', background: '#fff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button onClick={fetchBookings} title="Refresh" style={{
            display: 'flex', alignItems: 'center',
            background: '#fff', color: '#334155',
            border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '10px 12px', cursor: 'pointer'
          }}>
            <RefreshCw size={15} />
          </button>

          <button onClick={openCreate} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#f97316', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 16px', fontSize: 13.5,
            fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            <Plus size={15} /> New Booking
          </button>

          <span style={{
            background: '#fff7ed', color: '#ea580c',
            padding: '8px 14px', borderRadius: 20,
            fontSize: 13, fontWeight: 700,
            whiteSpace: 'nowrap', flexShrink: 0
          }}>
            Total: {total}
          </span>
        </div>
      </div>

      {/* ============ TABLE ============ */}
      {loading ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: 80, color: '#64748b'
        }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#f97316' }} />
          <p style={{ marginTop: 12, fontWeight: 500 }}>Loading bookings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 14, padding: 60, textAlign: 'center',
          color: '#64748b'
        }}>
          <Ticket size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>No bookings found</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            {search || filter ? 'Try a different filter or search' : 'Bookings will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              overflowX: 'auto',
              width: '100%',
              WebkitOverflowScrolling: 'touch'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 1040,
                tableLayout: 'auto'
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Booking ID', 'User', 'Route', 'Date', 'Pax', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const sc = statusStyles[b.status] || statusStyles.pending;
                    const pc = paymentStyles[b.paymentStatus] || paymentStyles.pending;
                    return (
                      <tr key={b._id}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>

                        {/* Booking ID */}
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: '#fff7ed',
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'center', flexShrink: 0
                            }}>
                              <Ticket size={13} color="#f97316" />
                            </div>
                            <span style={{
                              fontSize: 11.5, fontWeight: 700,
                              color: '#f97316',
                              fontFamily: 'monospace',
                              lineHeight: 1
                            }}>
                              {b.bookingId}
                            </span>
                          </div>
                        </td>

                        {/* User */}
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%',
                              background: 'linear-gradient(135deg,#f97316,#ea580c)',
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'center', flexShrink: 0
                            }}>
                              <span style={{
                                fontSize: 10.5, fontWeight: 700,
                                color: '#fff', lineHeight: 1
                              }}>
                                {(b.user?.name?.[0] || 'U').toUpperCase()}
                              </span>
                            </div>
                            <span style={{
                              fontSize: 13, fontWeight: 600,
                              color: '#0f172a', lineHeight: 1.2,
                              whiteSpace: 'nowrap'
                            }}>
                              {b.user?.name || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Route */}
                        <td style={{
                          ...tdStyle,
                          fontSize: 13,
                          color: '#475569',
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}>
                          {b.route?.from}{' '}
                          <span style={{ color: '#94a3b8' }}>→</span>{' '}
                          {b.route?.to}
                        </td>

                        {/* Date */}
                        <td style={tdStyle}>
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            gap: 5, fontSize: 12.5, color: '#475569',
                            whiteSpace: 'nowrap'
                          }}>
                            <Calendar size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
                            <span style={{ lineHeight: 1.2 }}>
                              {new Date(b.travelDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short'
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Passengers */}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{
                            background: '#f1f5f9', color: '#334155',
                            padding: '4px 10px', borderRadius: 20,
                            fontSize: 11.5, fontWeight: 700,
                            display: 'inline-block', lineHeight: 1
                          }}>
                            {b.passengers?.length || 0}
                          </span>
                        </td>

                        {/* Amount */}
                        <td style={{
                          ...tdStyle,
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap'
                        }}>
                          ₹{b.finalAmount}
                        </td>

                        {/* Payment status */}
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: pc.bg, color: pc.color,
                            padding: '4px 10px', borderRadius: 20,
                            fontSize: 10.5, fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '.3px',
                            lineHeight: 1,
                            whiteSpace: 'nowrap'
                          }}>
                            <CreditCard size={10} style={{ flexShrink: 0 }} />
                            {b.paymentStatus}
                          </span>
                        </td>

                        {/* Booking status */}
                        <td style={tdStyle}>
                          <span style={{
                            background: sc.bg, color: sc.color,
                            padding: '4px 10px', borderRadius: 20,
                            fontSize: 10.5, fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '.3px',
                            display: 'inline-block',
                            lineHeight: 1,
                            whiteSpace: 'nowrap'
                          }}>
                            {b.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ ...tdStyle, paddingRight: 20 }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(b)} title="Edit" aria-label="Edit booking"
                              style={{
                                width: 30, height: 30, borderRadius: 8,
                                border: '1px solid #e2e8f0', background: '#fff',
                                color: '#334155', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => setDeleteTarget(b)} title="Delete" aria-label="Delete booking"
                              style={{
                                width: 30, height: 30, borderRadius: 8,
                                border: '1px solid #fecaca', background: '#fef2f2',
                                color: '#dc2626', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============ PAGINATION ============ */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 12, marginTop: 22, flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '10px 16px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: page === 1 ? '#cbd5e1' : '#334155',
                  fontSize: 13, fontWeight: 600,
                  cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}>
                <ChevronLeft size={15} /> Prev
              </button>

              <span style={{
                background: '#fff', border: '1px solid #e2e8f0',
                padding: '10px 18px', borderRadius: 8,
                fontSize: 13, fontWeight: 600, color: '#0f172a'
              }}>
                Page <b style={{ color: '#f97316' }}>{page}</b> of {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '10px 16px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: page === totalPages ? '#cbd5e1' : '#334155',
                  fontSize: 13, fontWeight: 600,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer'
                }}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ============ DELETE CONFIRMATION ============ */}
      {deleteTarget && (
        <div style={overlayStyle} onClick={() => { if (!deleting) setDeleteTarget(null); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" aria-describedby="del-desc"
            style={{ ...modalStyle, maxWidth: 420, padding: 28, animation: 'abPop .18s ease' }}
            onClick={e => e.stopPropagation()}>

            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Trash2 size={20} color="#dc2626" />
            </div>

            <h2 id="del-title" style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Delete this booking?
            </h2>
            <p id="del-desc" style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: '0 0 22px' }}>
              <b style={{ color: '#f97316', fontWeight: 700 }}>{deleteTarget.bookingId}</b>
              {(deleteTarget.user?.name || deleteTarget.route) && (
                <> ({[deleteTarget.user?.name, deleteTarget.route && `${deleteTarget.route.from} → ${deleteTarget.route.to}`].filter(Boolean).join(' · ')})</>
              )}{' '}
              will be permanently removed. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" autoFocus onClick={() => setDeleteTarget(null)} disabled={deleting}
                style={{
                  background: '#fff', color: '#334155', border: '1px solid #e2e8f0',
                  borderRadius: 10, padding: '11px 22px', fontSize: 13.5, fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1,
                }}>
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} disabled={deleting}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: deleting ? '#f87171' : '#dc2626', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '11px 22px', fontSize: 13.5, fontWeight: 700,
                  cursor: deleting ? 'wait' : 'pointer', transition: 'background .15s',
                }}>
                {deleting
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deleting...</>
                  : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CREATE MODAL ============ */}
      {modalMode === 'create' && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={{ ...modalStyle, maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserPlus size={18} color="#f97316" />
                <h2 style={modalTitleStyle}>New Booking</h2>
              </div>
              <button onClick={closeModal} style={closeBtnStyle}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Route *</label>
                {routesLoading ? (
                  <div style={{ fontSize: 13, color: '#94a3b8', padding: '8px 0' }}>Loading routes...</div>
                ) : (
                  <select style={inputStyle} value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })}>
                    <option value="">Select a route</option>
                    {routes.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.from} → {r.to} • {r.bus?.busName || 'Bus'} • ₹{r.basePrice}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Travel Date *</label>
                  <input type="date" style={inputStyle} value={form.travelDate} onChange={e => setForm({ ...form, travelDate: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>User Email *</label>
                  <input type="email" style={inputStyle} placeholder="user@example.com" value={form.userEmail} onChange={e => setForm({ ...form, userEmail: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Passengers</label>
                  <button type="button" onClick={addPassengerRow} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa', borderRadius: 7, padding: '5px 10px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
                    <Plus size={12} /> Add
                  </button>
                </div>
                {form.passengers.map((p, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input style={inputStyle} placeholder="Name" value={p.name} onChange={e => updatePassenger(i, 'name', e.target.value)} />
                    <input style={inputStyle} type="number" placeholder="Age" min="1" max="100" value={p.age} onChange={e => updatePassenger(i, 'age', e.target.value)} />
                    <select style={inputStyle} value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                    <input style={inputStyle} placeholder="Seat" value={p.seatNumber} onChange={e => updatePassenger(i, 'seatNumber', e.target.value)} />
                    <button type="button" onClick={() => removePassengerRow(i)} disabled={form.passengers.length === 1}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: form.passengers.length === 1 ? '#cbd5e1' : '#dc2626', cursor: form.passengers.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Amount (₹)</label>
                  <input style={inputStyle} type="number" placeholder="Auto" value={form.finalAmount} onChange={e => setForm({ ...form, finalAmount: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Payment</label>
                  <select style={inputStyle} value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value })}>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={closeModal} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" disabled={saving} style={saveBtnStyle(saving)}>
                  {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : <><Save size={14} /> Create Booking</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ EDIT MODAL ============ */}
      {modalMode === 'edit' && activeBooking && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={{ ...modalStyle, maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pencil size={17} color="#f97316" />
                <div>
                  <h2 style={modalTitleStyle}>Edit Booking</h2>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>{activeBooking.bookingId}</div>
                </div>
              </div>
              <button onClick={closeModal} style={closeBtnStyle}><X size={16} /></button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Travel Date</label>
                <input type="date" style={inputStyle} value={form.travelDate} onChange={e => setForm({ ...form, travelDate: e.target.value })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Amount (₹)</label>
                <input style={inputStyle} type="number" value={form.finalAmount} onChange={e => setForm({ ...form, finalAmount: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Payment</label>
                  <select style={inputStyle} value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value })}>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={closeModal} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" disabled={saving} style={saveBtnStyle(saving)}>
                  {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes abPop { from { opacity: 0; transform: translateY(8px) scale(.97) } to { opacity: 1; transform: none } }
        table td, table th { vertical-align: middle; }
      `}</style>
    </AdminLayout>
  );
}

/* ---------- shared modal styles ---------- */
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};
const modalStyle = {
  width: '100%', background: '#fff', borderRadius: 18,
  boxShadow: '0 25px 60px -12px rgba(15,23,42,0.35)',
  display: 'flex', flexDirection: 'column', maxHeight: '90vh',
};
const modalHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '18px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
};
const modalTitleStyle = { fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 };
const closeBtnStyle = {
  width: 32, height: 32, borderRadius: 9, background: '#f8fafc',
  border: '1px solid #f1f5f9', color: '#64748b', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const cancelBtnStyle = {
  flex: 1, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
  borderRadius: 10, padding: '11px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
};
const saveBtnStyle = (saving) => ({
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  background: saving ? '#94a3b8' : '#f97316', color: '#fff', border: 'none',
  borderRadius: 10, padding: '11px', fontSize: 13.5, fontWeight: 700,
  cursor: saving ? 'not-allowed' : 'pointer',
});