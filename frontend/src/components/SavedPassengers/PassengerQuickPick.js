import React, { useState, useEffect, useRef } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { savedPassengerAPI } from '../../services/savedPassengerApi';

/*
  PassengerQuickPick.js
  ---------------------------------------------------------
  Place in: /frontend/src/components/SavedPassengers/PassengerQuickPick.js

  Drop next to each passenger's Name field in BookingPage.js's
  Step 2 (Passenger Details), e.g.:

    <label>Full Name *</label>
    <div style={{ display: 'flex', gap: 8 }}>
      <input style={inp} value={p.name} onChange={...} />
      <PassengerQuickPick
        onSelect={(saved) => {
          updP(p.seatNumber, 'name', saved.name);
          updP(p.seatNumber, 'age', saved.age);
          updP(p.seatNumber, 'gender', saved.gender);
        }}
      />
    </div>

  Fetches the saved-passenger list once on mount (lazy — only
  when the dropdown is first opened) and lets the user pick one
  to autofill that passenger slot's name/age/gender in one click.
  Self-contained styling matches BookingPage.js's dark theme.
*/

export default function PassengerQuickPick({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [passengers, setPassengers] = useState(null); // null = not yet fetched
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [open]);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && passengers === null) {
      setLoading(true);
      try {
        const { data } = await savedPassengerAPI.getAll();
        setPassengers(data.passengers || []);
      } catch {
        setPassengers([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePick = (p) => {
    onSelect(p);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button type="button" onClick={toggleOpen}
        title="Fill from saved passengers"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          height: '100%', padding: '0 12px',
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 8, color: '#f97316', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
        <Users size={13} />
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
          width: 220, maxHeight: 240, overflowY: 'auto',
          background: '#1e2d50', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 10,
          boxShadow: '0 16px 40px rgba(0,0,0,0.4)', padding: 6,
        }}>
          {loading ? (
            <div style={{ padding: '14px 10px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>Loading...</div>
          ) : passengers && passengers.length > 0 ? (
            passengers.map((p) => (
              <div key={p._id} onClick={() => handlePick(p)}
                style={{
                  padding: '9px 12px', borderRadius: 7, cursor: 'pointer',
                  fontSize: 13, color: '#f1f5f9',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{p.age} yrs · {p.gender}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '14px 10px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
              No saved passengers yet. Add some from your Profile.
            </div>
          )}
        </div>
      )}
    </div>
  );
}