import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Pencil, X, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { savedPassengerAPI } from '../../services/savedPassengerApi';

/*
  SavedPassengersManager.js
  ---------------------------------------------------------
  Place in: /frontend/src/components/SavedPassengers/SavedPassengersManager.js

  Drop into ProfilePage.js wherever it fits, e.g.:
    import SavedPassengersManager from '../components/SavedPassengers/SavedPassengersManager';
    ...
    <SavedPassengersManager />

  Self-contained: fetches its own data, no props required.
  Dark theme matching BookingPage.js / MyBookingsPage.js (#1e2d50
  cards on #0a0f1e). Adjust colors if your ProfilePage uses the
  lighter HomePage theme instead.
*/

const emptyForm = { name: '', age: '', gender: 'Male' };

export default function SavedPassengersManager() {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPassengers(); }, []);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const { data } = await savedPassengerAPI.getAll();
      setPassengers(data.passengers || []);
    } catch {
      toast.error('Could not load saved passengers');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setForm({ name: p.name, age: p.age, gender: p.gender });
    setEditingId(p._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.age) {
      toast.error('Please fill in name and age');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await savedPassengerAPI.update(editingId, form);
        setPassengers(data.passengers);
        toast.success('Passenger updated');
      } else {
        const { data } = await savedPassengerAPI.add(form);
        setPassengers(data.passengers);
        toast.success('Passenger saved');
      }
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save passenger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this saved passenger?')) return;
    try {
      const { data } = await savedPassengerAPI.remove(id);
      setPassengers(data.passengers);
      toast.success('Passenger removed');
    } catch {
      toast.error('Could not remove passenger');
    }
  };

  const inp = {
    width: '100%', background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: "'Inter',sans-serif",
  };

  return (
    <div style={{ background: '#1e2d50', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={18} color="#f97316" />
          <h2 style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, margin: 0 }}>Saved Passengers</h2>
        </div>
        {!showForm && (
          <button onClick={openAddForm}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f97316', color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne',
            }}>
            <Plus size={14} /> Add Passenger
          </button>
        )}
      </div>

      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        Save people you often book for — family, friends, colleagues — and fill their details in one tap during checkout instead of typing them every time.
      </p>

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSave} style={{
          background: 'rgba(10,15,30,0.4)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 12,
          padding: 18, marginBottom: 18,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Name</label>
              <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" autoFocus />
            </div>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Age</label>
              <input style={inp} type="number" min="1" max="100" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Age" />
            </div>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Gender</label>
              <select style={inp} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: saving ? '#64748b' : '#f97316', color: '#fff', border: 'none', borderRadius: 8,
                padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Syne',
              }}>
              {saving
                ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                : <><Check size={14} /> {editingId ? 'Update' : 'Save'}</>
              }
            </button>
            <button type="button" onClick={closeForm}
              style={{
                background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer',
              }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Loading...</div>
      ) : passengers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b', fontSize: 13 }}>
          No saved passengers yet. Add one to speed up your next booking.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {passengers.map((p) => (
            <div key={p._id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(10,15,30,0.4)', border: '1px solid rgba(148,163,184,0.1)',
              borderRadius: 10, padding: '12px 16px',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{p.age} yrs · {p.gender}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEditForm(p)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)',
                    background: 'transparent', color: '#94a3b8', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(p._id)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)',
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}