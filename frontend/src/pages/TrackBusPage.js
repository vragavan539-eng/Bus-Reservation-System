import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Bus, Search, Navigation, Clock, Gauge, Radio, Zap, Users, Phone, Wifi, Wind,
  Share2, Locate, Check, Flag, History, Plus, Minus, Maximize2, ShieldCheck, Compass, Crosshair
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleMap, useJsApiLoader, OverlayView, Polyline as GPolyline, Circle as GCircle } from '@react-google-maps/api';

/* ═══════════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#ffffff', soft: '#f8fafc', ink: '#0f172a', body: '#334155', muted: '#64748b', dim: '#94a3b8',
  line: '#e9edf2', lineWarm: '#fde3cc',
  orange: '#f97316', orangeDk: '#ea580c', orangeDeep: '#c2410c', amber: '#fbbf24', tint: '#fff5ec',
  green: '#16a34a', greenBg: '#f0fdf4', greenLn: '#bbf7d0',
  blue: '#2563eb', blueBg: '#eff6ff', red: '#dc2626', redBg: '#fef2f2',
};
const GRAD = `linear-gradient(135deg, ${C.orange}, ${C.orangeDk})`;
const SHADOW = '0 1px 2px rgba(15,23,42,.04), 0 14px 34px -18px rgba(15,23,42,.16)';
const card = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 22, boxShadow: SHADOW };
const ROAD_FACTOR = 1.25;   // straight-line km -> approx road km
const AVG_SPEED = 62;       // km/h used for the "arrives in" estimate
const RECENT_KEY = 'busgo_recent_pnrs';

/* ═══════════════════════════════════════════════════════════════
   DEMO TRIP  (replace fetchTrip() with your real API call)
   Chennai → Vellore → Salem → Erode → Coimbatore
   ═══════════════════════════════════════════════════════════════ */
const DEMO_TRIP = {
  busName: 'Chennai Express', busNumber: 'TN-01-AB-1234', operator: 'TNSTC Deluxe',
  from: 'Chennai', to: 'Coimbatore', driver: 'R. Kumar', delayMin: 15,
  booked: 42, capacity: 48, wifi: true, ac: true, supportPhone: '1800287646',
  stops: [
    { name: 'Chennai', time: '22:00', lat: 13.0827, lng: 80.2707 },
    { name: 'Vellore', time: '23:30', lat: 12.9165, lng: 79.1325 },
    { name: 'Salem', time: '01:30', lat: 11.6643, lng: 78.146 },
    { name: 'Erode', time: '04:15', lat: 11.341, lng: 77.7172 },
    { name: 'Coimbatore', time: '06:00', lat: 11.0168, lng: 76.9558 },
  ],
};

// TODO: swap with e.g. `const { data } = await API.get('/tracking/' + code); return data.trip;`
const fetchTrip = (code) =>
  new Promise((resolve) => setTimeout(() => resolve({ ...DEMO_TRIP, pnr: code }), 1100));

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const haversine = (a, b) => {
  const R = 6371, rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h)) * ROAD_FACTOR;
};
const addMinutes = (hhmm, add) => {
  const [h, m] = hhmm.split(':').map(Number);
  const t = (((h * 60 + m + add) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};
const fmtDur = (min) => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, '0')}m`;
const loadRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };
const saveRecent = (code) => {
  try {
    const next = [code, ...loadRecent().filter((c) => c !== code)].slice(0, 3);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
  } catch { return []; }
};

/* ═══════════════════════════════════════════════════════════════
   MAP ICONS  (styled by classes in the <style> block below)
   ═══════════════════════════════════════════════════════════════ */
const busIcon = L.divIcon({
  className: 'tb-div',
  html: `<div class="tb-bus"><span class="tb-bus-ping"></span><div class="tb-bus-core">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
      <circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
    </svg></div></div>`,
  iconSize: [46, 46], iconAnchor: [23, 23],
});
const stopIcon = (status) => L.divIcon({
  className: 'tb-div',
  html: `<div class="tb-stop ${status}"></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10],
});
const userIcon = L.divIcon({
  className: 'tb-div',
  html: `<div class="tb-user"><span class="tb-user-ping"></span><span class="tb-user-dot"></span></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11],
});

/* Watches the browser's GPS (works on https or localhost; asks the user for permission) */
function useLiveLocation() {
  const [userPos, setUserPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [permission, setPermission] = useState('prompt');

  useEffect(() => {
    if (!navigator.geolocation) { setPermission('unsupported'); return undefined; }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(pos.coords.accuracy);
        setPermission('granted');
      },
      (err) => { if (err.code === 1) setPermission('denied'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { userPos, accuracy, permission };
}

/* ═══════════════════════════════════════════════════════════════
   MAP HELPERS  (must live inside <MapContainer>)
   ═══════════════════════════════════════════════════════════════ */
function FitRoute({ coords }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => { map.invalidateSize(); map.fitBounds(coords, { padding: [60, 60] }); }, 150);
    return () => clearTimeout(t);
  }, [map, coords]);
  return null;
}

// Pans to the bus only while "follow" is on. The old version called flyTo on EVERY render
// (new array each time), so the map kept snapping back and could not be dragged.
function FollowBus({ pos, follow, onUserDrag }) {
  const map = useMap();
  useMapEvents({ dragstart: onUserDrag });
  useEffect(() => {
    if (follow) map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 9), { animate: true });
  }, [follow, pos.lat, pos.lng, map]);
  return null;
}

function MapTools({ coords, follow, onToggleFollow, userPos, onCenterUser }) {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) { L.DomEvent.disableClickPropagation(ref.current); L.DomEvent.disableScrollPropagation(ref.current); }
  }, []);
  const btn = (active) => ({
    width: 36, height: 36, borderRadius: 11, border: `1px solid ${active ? C.lineWarm : C.line}`,
    background: active ? C.tint : '#fff', color: active ? C.orangeDk : C.body, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px -6px rgba(15,23,42,.3)',
  });
  return (
    <div ref={ref} style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button style={btn(follow)} onClick={onToggleFollow} title="Follow bus" aria-label="Follow bus"><Locate size={16} /></button>
      <button style={btn(false)} onClick={() => map.fitBounds(coords, { padding: [60, 60] })} title="Fit route" aria-label="Fit route"><Maximize2 size={15} /></button>
      <button style={btn(!!userPos)} title="My location" aria-label="My location"
        onClick={() => {
          if (!userPos) { toast.error('Location not available. Allow location access in your browser.'); return; }
          onCenterUser();
          map.setView([userPos.lat, userPos.lng], 14, { animate: true });
        }}><Crosshair size={15} /></button>
      <button style={btn(false)} onClick={() => map.zoomIn()} aria-label="Zoom in"><Plus size={16} /></button>
      <button style={btn(false)} onClick={() => map.zoomOut()} aria-label="Zoom out"><Minus size={16} /></button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SMALL UI PIECES
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   GOOGLE MAPS (optional). Used only when a key is present in .env:
   REACT_APP_GOOGLE_MAPS_API_KEY=your_key   (restart `npm start` after adding)
   Without a key the page falls back to the free OpenStreetMap map.
   ═══════════════════════════════════════════════════════════════ */
const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const G_OPTIONS = {
  disableDefaultUI: true, clickableIcons: false, gestureHandling: 'greedy',
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d9f0' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f7fa' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fde3cc' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#fbd7a8' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e7f0e3' }] },
  ],
};
const G_CONTAINER = { width: '100%', height: '100%' };
const dashIcon = (color, scale) => [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale, strokeColor: color }, offset: '0', repeat: `${scale * 5}px` }];
const centerOffset = (w, h) => ({ x: -w / 2, y: -h / 2 });

function MapNotice({ title, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, padding: 24, textAlign: 'center', background: C.soft }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.orangeDeep }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.muted, maxWidth: 420, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function GoogleRouteMap({ model, userPos, accuracy, showUser, follow, setFollow, onCenterUser, speed, tracking }) {
  const { isLoaded, loadError } = useJsApiLoader({ id: 'busgo-google-maps', googleMapsApiKey: GOOGLE_KEY });
  const mapRef = useRef(null);
  const [authFail, setAuthFail] = useState(false);
  // Constant initial centre: passing a changing `center` would snap the map back on every tick
  const initialCenter = useRef(model.pos).current;

  useEffect(() => {
    window.gm_authFailure = () => setAuthFail(true);
    return () => { delete window.gm_authFailure; };
  }, []);

  const fitRoute = useCallback(() => {
    if (!mapRef.current || !window.google) return;
    const b = new window.google.maps.LatLngBounds();
    model.allCoords.forEach(([lat, lng]) => b.extend({ lat, lng }));
    if (userPos && showUser) b.extend(userPos);
    mapRef.current.fitBounds(b, 60);
  }, [model.allCoords, userPos, showUser]);

  useEffect(() => {
    if (!follow || !mapRef.current) return;
    mapRef.current.panTo(model.pos);
    if ((mapRef.current.getZoom() || 0) < 10) mapRef.current.setZoom(10);
  }, [follow, model.pos.lat, model.pos.lng]); // eslint-disable-line

  const toPath = (coords) => coords.map(([lat, lng]) => ({ lat, lng }));
  const btn = (active) => ({
    width: 36, height: 36, borderRadius: 11, border: `1px solid ${active ? C.lineWarm : C.line}`,
    background: active ? C.tint : '#fff', color: active ? C.orangeDk : C.body, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px -6px rgba(15,23,42,.3)',
  });
  const dotColor = (st) => (st === 'departed' ? C.green : st === 'next' ? C.orange : '#94a3b8');

  if (loadError) return <MapNotice title="Google Maps failed to load">Check <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> in your .env file and make sure the Maps JavaScript API is enabled.</MapNotice>;
  if (authFail) return <MapNotice title="Google rejected the API key">Enable <b>billing</b> and the <b>Maps JavaScript API</b> for this key. If you added HTTP referrer restrictions, allow <code>localhost:3000/*</code>.</MapNotice>;
  if (!isLoaded) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
        <span style={{ width: 32, height: 32, border: '3px solid rgba(249,115,22,.25)', borderTopColor: C.orange, borderRadius: '50%', animation: 'tbSpin .8s linear infinite' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Loading Google Maps…</span>
      </div>
    );
  }

  return (
    <>
      <GoogleMap mapContainerStyle={G_CONTAINER} center={initialCenter} zoom={7} options={G_OPTIONS}
        onLoad={(map) => { mapRef.current = map; fitRoute(); }} onDragStart={() => setFollow(false)}>
        <GPolyline path={toPath(model.todoCoords)} options={{ strokeOpacity: 0, icons: dashIcon(C.orange, 4) }} />
        <GPolyline path={toPath(model.doneCoords)} options={{ strokeColor: C.green, strokeOpacity: 0.95, strokeWeight: 5 }} />

        {userPos && showUser && model.userToBusKm < 200 && (
          <GPolyline path={[userPos, model.pos]} options={{ strokeOpacity: 0, icons: dashIcon(C.blue, 3) }} />
        )}
        {!model.arrived && (
          <GCircle center={{ lat: model.stops[model.nextIdx].lat, lng: model.stops[model.nextIdx].lng }} radius={12000}
            options={{ strokeColor: C.orange, strokeOpacity: 0.5, strokeWeight: 1, fillColor: C.orange, fillOpacity: 0.08, clickable: false }} />
        )}
        {userPos && showUser && (
          <GCircle center={userPos} radius={Math.max(accuracy || 30, 30)}
            options={{ strokeColor: C.blue, strokeOpacity: 0.4, strokeWeight: 1, fillColor: C.blue, fillOpacity: 0.12, clickable: false }} />
        )}

        {model.stops.map((s, i) => (
          <OverlayView key={s.name} position={{ lat: s.lat, lng: s.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={centerOffset}>
            <div style={{ position: 'relative', width: 20, height: 20 }}>
              <div className={`tb-stop ${model.status[i]}`} style={{ borderColor: dotColor(model.status[i]) }} />
              <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', fontSize: 10.5, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap', background: 'rgba(255,255,255,.94)', padding: '2px 8px', borderRadius: 99, border: `1px solid ${C.line}`, boxShadow: '0 2px 6px rgba(15,23,42,.1)' }}>{s.name}</div>
            </div>
          </OverlayView>
        ))}

        {userPos && showUser && (
          <OverlayView position={userPos} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={centerOffset}>
            <div className="tb-user"><span className="tb-user-ping" /><span className="tb-user-dot" /></div>
          </OverlayView>
        )}

        <OverlayView position={model.pos} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={centerOffset}>
          <div className="tb-bus" title={`${tracking.busName} · ${speed} km/h`}>
            <span className="tb-bus-ping" />
            <div className="tb-bus-core"><Bus size={20} color="#fff" /></div>
          </div>
        </OverlayView>
      </GoogleMap>

      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button style={btn(follow)} onClick={() => setFollow((f) => !f)} title="Follow bus" aria-label="Follow bus"><Locate size={16} /></button>
        <button style={btn(false)} onClick={fitRoute} title="Fit route" aria-label="Fit route"><Maximize2 size={15} /></button>
        <button style={btn(!!userPos)} title="My location" aria-label="My location"
          onClick={() => {
            if (!userPos) { toast.error('Location not available. Allow location access in your browser.'); return; }
            onCenterUser();
            mapRef.current?.panTo(userPos); mapRef.current?.setZoom(14);
          }}><Crosshair size={15} /></button>
        <button style={btn(false)} onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 8) + 1)} aria-label="Zoom in"><Plus size={16} /></button>
        <button style={btn(false)} onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 8) - 1)} aria-label="Zoom out"><Minus size={16} /></button>
      </div>
    </>
  );
}

const SpeedGauge = ({ value, max = 120 }) => {
  const len = Math.PI * 50;
  const ratio = Math.min(value / max, 1);
  return (
    <svg viewBox="0 0 120 72" width="100%" style={{ maxWidth: 150, display: 'block', margin: '0 auto' }}>
      <defs>
        <linearGradient id="tbGauge" x1="0" x2="1"><stop offset="0" stopColor={C.amber} /><stop offset="1" stopColor={C.orangeDk} /></linearGradient>
      </defs>
      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#eef1f5" strokeWidth="10" strokeLinecap="round" />
      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="url(#tbGauge)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${len * ratio} ${len}`} style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="60" y="52" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="24" fill={C.ink}>{value}</text>
      <text x="60" y="67" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.dim} letterSpacing="1">KM/H</text>
    </svg>
  );
};

const Tile = ({ icon: Icon, label, color = C.orange, children, sub }) => (
  <div style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 14px 13px', minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
      <span style={{ width: 24, height: 24, borderRadius: 8, background: '#fff', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={13} color={color} /></span>
      <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '1.1px', color: C.dim, textTransform: 'uppercase' }}>{label}</span>
    </div>
    {children}
    {sub && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
  </div>
);

const Chip = ({ icon: Icon, children, tone = 'neutral' }) => {
  const t = tone === 'good' ? [C.greenBg, C.greenLn, C.green]
    : tone === 'info' ? [C.blueBg, '#dbeafe', C.blue]
    : [C.soft, C.line, C.body];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: t[2], background: t[0], border: `1px solid ${t[1]}`, padding: '5px 11px', borderRadius: 99 }}>
      <Icon size={12} /> {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS (scoped to .tb-page)
   ═══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  @keyframes tbPing { 0% { transform: scale(.6); opacity:.7; } 100% { transform: scale(1.9); opacity:0; } }
  @keyframes tbSpin { to { transform: rotate(360deg); } }
  @keyframes tbFade { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform:none; } }
  @keyframes tbBlink { 0%,100% { opacity:1; } 50% { opacity:.35; } }
  @keyframes tbShimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
  @keyframes tbShine { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(330%) skewX(-18deg); } }
  @keyframes tbFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes tbDash { to { stroke-dashoffset: -40; } }
  @keyframes tbNext { 0% { box-shadow: 0 0 0 0 rgba(249,115,22,.5); } 70% { box-shadow: 0 0 0 10px rgba(249,115,22,0); } 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); } }

  .tb-page { font-family: 'Inter', system-ui, sans-serif; }
  .tb-page .tb-skel { background: linear-gradient(90deg,#f1f5f9 0,#e5eaf0 40px,#f1f5f9 80px); background-size:400px 100%; animation: tbShimmer 1.3s infinite linear; }
  .tb-btn { transition: transform .2s ease, box-shadow .2s ease; position: relative; overflow: hidden; }
  .tb-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 28px -14px rgba(234,88,12,.85); }
  .tb-btn .tb-shine { position:absolute; top:0; bottom:0; left:0; width:30%; background: linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent); animation: tbShine 3.2s ease-in-out infinite; pointer-events:none; }
  .tb-ghost { transition: background .2s ease, border-color .2s ease, transform .2s ease; }
  .tb-ghost:hover { background: ${C.soft} !important; border-color: ${C.dim} !important; transform: translateY(-1px); }
  .tb-search:focus-within { border-color: ${C.orange} !important; box-shadow: 0 0 0 5px rgba(249,115,22,.14), ${SHADOW} !important; }
  .tb-recent:hover { border-color: ${C.orange} !important; color: ${C.orangeDk} !important; background: ${C.tint} !important; }

  .tb-grid { display:grid; grid-template-columns: minmax(0,1.7fr) minmax(300px,1fr); gap:20px; align-items:start; }
  .tb-stats { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px; }
  .tb-features { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:14px; }
  @media (min-width: 700px) { .tb-stats { grid-template-columns: repeat(4, minmax(0,1fr)); } }
  @media (max-width: 980px) { .tb-grid { grid-template-columns: 1fr; } .tb-sticky { position: static !important; } }
  @media (max-width: 700px) { .tb-features { grid-template-columns: 1fr; } .tb-strip-time { display:none; } .tb-eta { text-align:left !important; } }

  /* map */
  .tb-map .leaflet-container { font-family: inherit; background:#eef2f6; }
  .tb-map .leaflet-popup-content-wrapper { border-radius: 14px; box-shadow: 0 14px 30px -10px rgba(15,23,42,.35); border: 1px solid ${C.line}; }
  .tb-map .leaflet-popup-content { margin: 12px 14px; font-family: 'Inter', sans-serif; }
  .tb-map .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,.8); }
  .tb-map .leaflet-tile-pane { filter: saturate(.7) contrast(.95) brightness(1.03); }
  .tb-div { background: transparent !important; border: none !important; }
  .tb-bus { position: relative; width: 46px; height: 46px; }
  .tb-bus-ping { position:absolute; inset:-6px; border-radius:50%; background: rgba(249,115,22,.35); animation: tbPing 1.8s ease-out infinite; }
  .tb-bus-core { position:relative; width:46px; height:46px; border-radius:50%; background: ${GRAD}; display:flex; align-items:center; justify-content:center; border:3px solid #fff; box-shadow: 0 10px 22px -6px rgba(234,88,12,.7); }
  .tb-stop { width:20px; height:20px; border-radius:50%; background:#fff; border:4px solid #cbd5e1; box-sizing:border-box; box-shadow: 0 3px 8px rgba(15,23,42,.25); }
  .tb-stop.departed, .tb-stop.arrived { border-color: ${C.green}; }
  .tb-stop.next { border-color: ${C.orange}; animation: tbNext 1.6s infinite; }
  .tb-user { position: relative; width: 22px; height: 22px; }
  .tb-user-ping { position:absolute; inset:-8px; border-radius:50%; background: rgba(37,99,235,.3); animation: tbPing 2s ease-out infinite; }
  .tb-user-dot { position:absolute; inset:0; border-radius:50%; background:${C.blue}; border:4px solid #fff; box-sizing:border-box; box-shadow: 0 0 0 2px rgba(37,99,235,.35), 0 6px 14px rgba(37,99,235,.55); }
  .tb-tip.leaflet-tooltip { background:#fff; border:1px solid ${C.line}; color:${C.ink}; font-weight:800; font-size:11px; padding:3px 9px; border-radius:99px; box-shadow:0 6px 14px -8px rgba(15,23,42,.4); }
  .tb-tip.leaflet-tooltip-top:before { border-top-color:#fff; }
`;

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function TrackBusPage() {
  const [sp, setSp] = useSearchParams();
  const [pnr, setPnr] = useState('');
  const [tracking, setTracking] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(55);
  const [tick, setTick] = useState(0);
  const [follow, setFollow] = useState(false);
  const [recent, setRecent] = useState(loadRecent);
  const [showUser, setShowUser] = useState(true);
  const { userPos, accuracy, permission } = useLiveLocation();
  const alive = useRef(true);

  const pillBase = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 99 };
  const gpsPill = permission === 'denied' ? (
    <span style={{ ...pillBase, color: C.orangeDeep, background: C.tint, border: `1px solid ${C.lineWarm}` }}><Compass size={12} /> Location blocked. Allow it in the browser to see distance from you</span>
  ) : userPos ? (
    <span style={{ ...pillBase, color: C.blue, background: C.blueBg, border: '1px solid #dbeafe' }}><Crosshair size={12} /> Your location active (±{Math.round(accuracy || 0)}m)</span>
  ) : permission === 'unsupported' ? null : (
    <span style={{ ...pillBase, color: C.muted, background: C.soft, border: `1px solid ${C.line}` }}><Compass size={12} /> Detecting your location…</span>
  );

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  /* ─── Track ─── */
  const startTrack = async (raw) => {
    const code = String(raw || '').trim().toUpperCase();
    if (!code) { toast.error('Enter your PNR number'); return; }
    if (!/^[A-Z0-9]{5,14}$/.test(code)) { toast.error('PNR should be 5–14 letters or digits'); return; }
    setIsSearching(true);
    try {
      const trip = await fetchTrip(code);
      if (!alive.current) return;
      setTracking(trip);
      setProgress(55); setTick(0); setFollow(false);
      setPnr(code);
      setRecent(saveRecent(code));
      setSp({ pnr: code }, { replace: true });
      toast.success('Bus found! Tracking live...', { icon: '🛰️' });
    } catch {
      if (alive.current) toast.error('Could not find a bus for this PNR');
    } finally {
      if (alive.current) setIsSearching(false);
    }
  };

  // Open straight from a shared link: /track?pnr=ABC123
  useEffect(() => {
    const q = sp.get('pnr');
    if (q) { setPnr(q.toUpperCase()); startTrack(q); }
  }, []);

  /* ─── Live simulation (stops once the bus arrives) ─── */
  useEffect(() => {
    if (!tracking || progress >= 100) return undefined;
    const id = setInterval(() => {
      setProgress((p) => Math.min(p + 0.35, 100));
      setTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(id);
  }, [tracking, progress >= 100]);

  /* ─── Everything below is DERIVED from progress, so map, timeline,
         stats and route strip can never disagree with each other ─── */
  const model = useMemo(() => {
    if (!tracking) return null;
    const stops = tracking.stops, last = stops.length - 1;
    const p = Math.min(progress / 100, 1);
    const seg = Math.min(Math.floor(p * last), last - 1);
    const segP = p >= 1 ? 1 : p * last - seg;
    const a = stops[seg], b = stops[seg + 1];
    const pos = { lat: a.lat + (b.lat - a.lat) * segP, lng: a.lng + (b.lng - a.lng) * segP };
    const arrived = p >= 1;
    const nextIdx = arrived ? last : seg + 1;

    const status = stops.map((_, i) => (arrived ? 'departed' : i <= seg ? 'departed' : i === nextIdx ? 'next' : 'upcoming'));

    const legs = stops.slice(0, -1).map((s, i) => haversine(s, stops[i + 1]));
    const totalKm = legs.reduce((x, y) => x + y, 0);
    const toNext = arrived ? 0 : haversine(pos, stops[nextIdx]);
    const away = stops.map((_, i) => {
      if (arrived || i < nextIdx) return 0;
      return toNext + legs.slice(nextIdx, i).reduce((x, y) => x + y, 0);
    });
    const remainingKm = arrived ? 0 : away[last];

    return {
      stops, last, pos, arrived, nextIdx, status, away, totalKm, remainingKm, toNext,
      doneCoords: [...stops.slice(0, seg + 1).map((s) => [s.lat, s.lng]), [pos.lat, pos.lng]],
      todoCoords: [[pos.lat, pos.lng], ...stops.slice(seg + 1).map((s) => [s.lat, s.lng])],
      allCoords: stops.map((s) => [s.lat, s.lng]),
      location: arrived ? `Arrived at ${tracking.to}` : `Between ${a.name} and ${b.name}`,
      userToBusKm: userPos ? haversine(userPos, pos) : null,
    };
  }, [tracking, progress, userPos]);

  const speed = model && !model.arrived ? Math.round(70 + 7 * Math.sin(tick / 2.5)) : 0;

  const shareTrip = async () => {
    const url = `${window.location.origin}${window.location.pathname}?pnr=${tracking.pnr}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Track my BusGo bus', text: `Track ${tracking.busName} live`, url });
      else { await navigator.clipboard.writeText(url); toast.success('Tracking link copied'); }
    } catch { /* share dialog dismissed */ }
  };

  const stopLabelColor = { departed: C.green, next: C.orangeDk, upcoming: C.dim };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="tb-page" style={{ minHeight: '100vh', background: `radial-gradient(900px 340px at 88% -60px, rgba(249,115,22,.10), transparent 70%), radial-gradient(700px 300px at 0% 0%, rgba(251,191,36,.08), transparent 70%), ${C.bg}`, color: C.ink, paddingTop: 84, paddingBottom: 80 }}>
      <style>{CSS}</style>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 22px' }}>

        {/* ════════ HERO + SEARCH ════════ */}
        <div style={{ textAlign: 'center', margin: '18px 0 34px', animation: 'tbFade .5s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 99, background: C.tint, border: `1px solid ${C.lineWarm}`, color: C.orangeDk, fontSize: 11, fontWeight: 800, letterSpacing: '1.6px', marginBottom: 18 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 0 4px rgba(22,163,74,.18)`, animation: 'tbBlink 1.6s infinite' }} />
            LIVE GPS TRACKING
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px, 5.4vw, 52px)', fontWeight: 800, lineHeight: 1.08, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Track your bus, <span style={{ background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>live</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Real-time location, arrival estimates and stop-by-stop updates. Just enter your PNR.
          </p>

          {gpsPill && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>{gpsPill}</div>}

          <div style={{ maxWidth: 640, margin: '20px auto 0' }}>
            <div className="tb-search" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 8px 18px', background: '#fff', border: `1.5px solid ${C.line}`, borderRadius: 18, boxShadow: SHADOW, flexWrap: 'wrap', transition: 'all .2s' }}>
              <Search size={18} color={C.dim} />
              <input
                placeholder="Enter PNR number (e.g. PNRXYZ123)" value={pnr} aria-label="PNR number"
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && startTrack(pnr)}
                style={{ flex: 1, minWidth: 170, background: 'transparent', border: 'none', outline: 'none', color: C.ink, fontSize: 15, fontWeight: 600, padding: '12px 4px', fontFamily: 'inherit', letterSpacing: '.5px' }} />
              <button className="tb-btn" onClick={() => startTrack(pnr)} disabled={isSearching}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', border: 'none', borderRadius: 13, background: isSearching ? '#cbd5e1' : GRAD, color: '#fff', fontWeight: 800, fontSize: 14, cursor: isSearching ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif' }}>
                {!isSearching && <span className="tb-shine" />}
                {isSearching
                  ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'tbSpin .8s linear infinite' }} /> Searching</>
                  : <><Navigation size={15} /> Track bus</>}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14, fontSize: 12, color: C.muted }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600 }}><Zap size={12} color={C.orange} /> Try</span>
              {['PNRXYZ123', ...recent.filter((r) => r !== 'PNRXYZ123')].map((c, i) => (
                <button key={c} className="tb-recent" onClick={() => { setPnr(c); startTrack(c); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', border: `1px solid ${C.line}`, color: C.body, fontFamily: 'ui-monospace, monospace', fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 99, cursor: 'pointer', transition: 'all .2s' }}>
                  {i > 0 && <History size={11} />}{c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ════════ LOADING SKELETON ════════ */}
        {isSearching && !tracking && (
          <div className="tb-grid" aria-busy="true">
            <div style={{ ...card, padding: 20 }}>
              <div className="tb-skel" style={{ height: 22, width: 160, borderRadius: 8, marginBottom: 14 }} />
              <div className="tb-skel" style={{ height: 380, borderRadius: 16 }} />
            </div>
            <div style={{ ...card, padding: 20 }}>
              {[0, 1, 2, 3, 4].map((i) => <div key={i} className="tb-skel" style={{ height: 54, borderRadius: 12, marginBottom: 12 }} />)}
            </div>
          </div>
        )}

        {/* ════════ RESULTS ════════ */}
        {tracking && model && (
          <div style={{ animation: 'tbFade .5s ease' }}>

            {/* ── Summary + route strip ── */}
            <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: 20, position: 'relative', background: 'linear-gradient(120deg,#fff7ed 0%,#ffffff 55%,#fff3e6 100%)' }}>
              <Bus size={210} color="rgba(249,115,22,.06)" strokeWidth={1.2} style={{ position: 'absolute', right: -24, bottom: -50, transform: 'rotate(-8deg)', pointerEvents: 'none' }} />
              <div style={{ height: 5, background: `linear-gradient(90deg, ${C.orange}, ${C.amber})` }} />

              <div style={{ padding: '22px 26px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 22px -10px rgba(234,88,12,.8)', flexShrink: 0 }}>
                    <Bus size={26} color="#fff" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, margin: 0 }}>{tracking.busName}</h2>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.2px', color: model.arrived ? C.blue : C.green, background: model.arrived ? C.blueBg : C.greenBg, border: `1px solid ${model.arrived ? '#bfdbfe' : C.greenLn}`, padding: '3px 10px', borderRadius: 99 }}>
                        <Radio size={10} style={{ animation: model.arrived ? 'none' : 'tbBlink 1.5s infinite' }} /> {model.arrived ? 'ARRIVED' : 'LIVE'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                      {tracking.operator} · <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{tracking.busNumber}</span> · PNR <b style={{ color: C.body }}>{tracking.pnr}</b>
                    </div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
                      {tracking.ac && <Chip icon={Wind}>AC</Chip>}
                      {tracking.wifi && <Chip icon={Wifi}>WiFi</Chip>}
                      <Chip icon={Users}>{tracking.booked}/{tracking.capacity} seats</Chip>
                      {model.userToBusKm !== null && <Chip icon={Crosshair} tone="info">{Math.round(model.userToBusKm)} km from you</Chip>}
                    </div>
                  </div>
                </div>

                <div className="tb-eta" style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '1.5px', color: C.dim }}>EXPECTED ARRIVAL</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, lineHeight: 1.05, color: C.ink }}>
                    {addMinutes(model.stops[model.last].time, tracking.delayMin)}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, fontWeight: 800, color: tracking.delayMin ? C.orangeDeep : C.green, background: tracking.delayMin ? C.tint : C.greenBg, border: `1px solid ${tracking.delayMin ? C.lineWarm : C.greenLn}`, padding: '4px 11px', borderRadius: 99 }}>
                    <Clock size={12} /> {tracking.delayMin ? `Running ${tracking.delayMin} min late` : 'On time'}
                  </div>
                </div>
              </div>

              {/* route strip */}
              <div style={{ padding: '30px 38px 26px', position: 'relative' }}>
                <div style={{ position: 'relative', height: 40 }}>
                  <div style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 4, borderRadius: 99, background: C.line }} />
                  <div style={{ position: 'absolute', top: 18, left: 0, height: 4, borderRadius: 99, background: `linear-gradient(90deg, ${C.green}, ${C.orange})`, width: `${progress}%`, transition: 'width 1.8s linear' }} />
                  {model.stops.map((s, i) => (
                    <div key={s.name} style={{ position: 'absolute', top: 13, left: `${(i / model.last) * 100}%`, transform: 'translateX(-50%)', textAlign: 'center' }}>
                      <div style={{ width: 14, height: 14, margin: '0 auto', borderRadius: '50%', background: '#fff', border: `3.5px solid ${model.status[i] === 'departed' ? C.green : model.status[i] === 'next' ? C.orange : '#cbd5e1'}`, boxSizing: 'border-box', animation: model.status[i] === 'next' ? 'tbNext 1.6s infinite' : 'none' }} />
                      <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, color: stopLabelColor[model.status[i]], whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div className="tb-strip-time" style={{ fontSize: 10.5, color: C.dim, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{s.time}</div>
                    </div>
                  ))}
                  <div style={{ position: 'absolute', top: 4, left: `${progress}%`, transform: 'translateX(-50%)', width: 32, height: 32, borderRadius: '50%', background: GRAD, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -6px rgba(234,88,12,.8)', transition: 'left 1.8s linear', zIndex: 2 }}>
                    <Bus size={14} color="#fff" />
                  </div>
                </div>
                <div style={{ height: 34 }} />
              </div>
            </div>

            <div className="tb-grid">
              {/* ═══════ LEFT: MAP + STATS ═══════ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                <div className="tb-map" style={{ ...card, padding: 14 }}>
                  <div style={{ position: 'relative', height: 440, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}` }}>
                    {GOOGLE_KEY ? (
                      <GoogleRouteMap model={model} userPos={userPos} accuracy={accuracy} showUser={showUser}
                        follow={follow} setFollow={setFollow} speed={speed} tracking={tracking}
                        onCenterUser={() => { setFollow(false); setShowUser(true); }} />
                    ) : (
                    <MapContainer center={[model.pos.lat, model.pos.lng]} zoom={7} scrollWheelZoom zoomControl={false} style={{ width: '100%', height: '100%', zIndex: 0 }}>
                      <TileLayer
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                      <FitRoute coords={model.allCoords} />
                      <FollowBus pos={model.pos} follow={follow} onUserDrag={() => setFollow(false)} />

                      {/* remaining route (dashed) and completed route (solid) */}
                      <Polyline positions={model.todoCoords} pathOptions={{ color: C.orange, weight: 4, opacity: 0.75, dashArray: '9 9' }} />
                      <Polyline positions={model.doneCoords} pathOptions={{ color: C.green, weight: 5, opacity: 0.95 }} />

                      {userPos && showUser && model.userToBusKm < 200 && (
                        <Polyline positions={[[userPos.lat, userPos.lng], [model.pos.lat, model.pos.lng]]}
                          pathOptions={{ color: C.blue, weight: 2, opacity: 0.55, dashArray: '4 8' }} />
                      )}
                      {userPos && showUser && (
                        <Circle center={[userPos.lat, userPos.lng]} radius={Math.max(accuracy || 30, 30)}
                          pathOptions={{ color: C.blue, fillColor: C.blue, fillOpacity: 0.12, weight: 1 }} />
                      )}
                      {userPos && showUser && (
                        <Marker position={[userPos.lat, userPos.lng]} icon={userIcon} zIndexOffset={900}>
                          <Tooltip direction="top" offset={[0, -12]} className="tb-tip">You are here</Tooltip>
                        </Marker>
                      )}

                      {model.stops.map((s, i) => (
                        <Marker key={s.name} position={[s.lat, s.lng]} icon={stopIcon(model.status[i])}>
                          <Tooltip permanent direction="top" offset={[0, -10]} className="tb-tip">{s.name}</Tooltip>
                          <Popup>
                            <div style={{ minWidth: 140 }}>
                              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14 }}>{s.name}</div>
                              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Scheduled {s.time}</div>
                              <div style={{ fontSize: 10.5, fontWeight: 800, marginTop: 7, display: 'inline-block', padding: '2px 8px', borderRadius: 99, background: model.status[i] === 'departed' ? C.greenBg : model.status[i] === 'next' ? C.tint : C.soft, color: stopLabelColor[model.status[i]] }}>
                                {model.status[i] === 'departed' ? 'PASSED' : model.status[i] === 'next' ? 'NEXT STOP' : 'UPCOMING'}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {!model.arrived && (
                        <Circle center={[model.stops[model.nextIdx].lat, model.stops[model.nextIdx].lng]} radius={12000}
                          pathOptions={{ color: C.orange, fillColor: C.orange, fillOpacity: 0.08, weight: 1 }} />
                      )}

                      <Marker position={[model.pos.lat, model.pos.lng]} icon={busIcon} zIndexOffset={1000}>
                        <Popup>
                          <div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14 }}>{tracking.busName}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{tracking.busNumber} · {speed} km/h</div>
                          </div>
                        </Popup>
                      </Marker>

                      <MapTools coords={model.allCoords} follow={follow} onToggleFollow={() => setFollow((f) => !f)}
                        userPos={userPos} onCenterUser={() => { setFollow(false); setShowUser(true); }} />
                    </MapContainer>
                    )}

                    {/* overlays above the map */}
                    <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.94)', border: `1px solid ${C.line}`, borderRadius: 99, padding: '7px 14px 7px 11px', boxShadow: '0 8px 18px -10px rgba(15,23,42,.4)', maxWidth: 'calc(100% - 70px)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: model.arrived ? C.blue : C.green, animation: model.arrived ? 'none' : 'tbBlink 1.5s infinite', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.body, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.location}</span>
                    </div>

                    {!model.arrived && (
                      <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 5, background: 'rgba(255,255,255,.96)', border: `1px solid ${C.line}`, borderRadius: 16, padding: '11px 15px', boxShadow: '0 12px 24px -12px rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', gap: 11 }}>
                        <span style={{ width: 34, height: 34, borderRadius: 11, background: C.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Flag size={16} color={C.orangeDk} /></span>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.2px', color: C.dim }}>NEXT STOP</div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, lineHeight: 1.15 }}>{model.stops[model.nextIdx].name}</div>
                          <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>~{Math.round(model.toNext)} km away</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* stats */}
                <div style={{ ...card, padding: 18 }}>
                  <div className="tb-stats">
                    <Tile icon={Gauge} label="Speed" color={C.orange}><SpeedGauge value={speed} /></Tile>
                    <Tile icon={MapPin} label="Distance left" color={C.blue} sub={`of ~${Math.round(model.totalKm)} km`}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800 }}>{Math.round(model.remainingKm)}<span style={{ fontSize: 13, color: C.dim, marginLeft: 4 }}>km</span></div>
                      <div style={{ height: 6, background: C.line, borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${C.amber}, ${C.orangeDk})`, borderRadius: 99, transition: 'width 1.8s linear' }} />
                      </div>
                    </Tile>
                    <Tile icon={Clock} label="Arrives in" color={C.green} sub={model.arrived ? 'Journey complete' : 'at avg speed'}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800 }}>
                        {model.arrived ? '0m' : fmtDur((model.remainingKm / AVG_SPEED) * 60 + tracking.delayMin)}
                      </div>
                    </Tile>
                    <Tile icon={Crosshair} label="From you" color={C.blue} sub={userPos ? 'live distance' : 'waiting for GPS'}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800 }}>
                        {model.userToBusKm !== null ? Math.round(model.userToBusKm) : '—'}
                        <span style={{ fontSize: 13, color: C.dim, marginLeft: 4 }}>km</span>
                      </div>
                    </Tile>
                  </div>
                </div>
              </div>

              {/* ═══════ RIGHT: TIMELINE + DRIVER ═══════ */}
              <div className="tb-sticky" style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                <div style={{ ...card, padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, margin: 0 }}>Route timeline</h3>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, background: C.soft, padding: '4px 10px', borderRadius: 99 }}>{model.stops.length} stops</span>
                  </div>

                  {model.stops.map((s, i) => {
                    const st = model.status[i], isLast = i === model.last;
                    const col = st === 'departed' ? C.green : st === 'next' ? C.orange : '#cbd5e1';
                    const showExp = tracking.delayMin > 0 && st !== 'departed';
                    return (
                      <div key={s.name} style={{ display: 'flex', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 22, flexShrink: 0 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: st === 'departed' ? C.green : '#fff', border: `3.5px solid ${col}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: st === 'next' ? 'tbNext 1.6s infinite' : 'none', zIndex: 1 }}>
                            {st === 'departed' && <Check size={11} color="#fff" strokeWidth={3.5} />}
                          </div>
                          {!isLast && <div style={{ width: 3, flex: 1, minHeight: 44, margin: '3px 0', borderRadius: 99, background: st === 'departed' && model.status[i + 1] === 'departed' ? C.green : st === 'departed' ? `linear-gradient(${C.green}, ${C.orange})` : C.line }} />}
                        </div>

                        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <span style={{ fontSize: 15, fontWeight: st === 'next' ? 800 : 700, color: st === 'upcoming' ? C.muted : C.ink }}>{s.name}</span>
                              {st === 'next' && <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '1px', padding: '2px 8px', borderRadius: 99, background: C.tint, color: C.orangeDk, border: `1px solid ${C.lineWarm}` }}>NEXT</span>}
                            </div>
                            <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                              {showExp ? <><s style={{ color: C.dim, fontWeight: 500 }}>{s.time}</s> <span style={{ color: C.orangeDk }}>{addMinutes(s.time, tracking.delayMin)}</span></> : s.time}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, marginTop: 3, fontWeight: 600, color: st === 'departed' ? C.green : st === 'next' ? C.orangeDk : C.dim }}>
                            {st === 'departed' ? (isLast ? 'Arrived' : 'Departed') : `~${Math.round(model.away[i])} km away`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ ...card, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#1e40af)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, fontFamily: 'Syne, sans-serif' }}>
                      {tracking.driver.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '1.2px', color: C.dim }}>DRIVER</div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{tracking.driver}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: C.green }}><ShieldCheck size={13} /> Verified</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <a href={`tel:${tracking.supportPhone}`} className="tb-ghost"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 12px', borderRadius: 12, background: '#fff', border: `1.5px solid ${C.line}`, color: C.body, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                      <Phone size={14} /> Call support
                    </a>
                    <button className="tb-btn" onClick={shareTrip}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 12px', borderRadius: 12, background: GRAD, color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <span className="tb-shine" /><Share2 size={14} /> Share trip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ EMPTY STATE ════════ */}
        {!tracking && !isSearching && (
          <div style={{ maxWidth: 920, margin: '10px auto 0', animation: 'tbFade .6s ease' }}>
            <div style={{ ...card, padding: '34px 28px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg,#fff7ed 0%,#ffffff 60%,#fff3e6 100%)' }}>
              <svg viewBox="0 0 520 120" width="100%" style={{ maxWidth: 520, display: 'block', margin: '0 auto 8px' }} aria-hidden="true">
                <path d="M30 80 C 120 20, 200 120, 280 60 S 440 30, 490 70" fill="none" stroke={C.lineWarm} strokeWidth="3" strokeDasharray="8 8" style={{ animation: 'tbDash 1.4s linear infinite' }} />
                <circle cx="30" cy="80" r="9" fill="#fff" stroke={C.orange} strokeWidth="4" />
                <circle cx="490" cy="70" r="9" fill={C.orange} />
                <g style={{ animation: 'tbFloat 3s ease-in-out infinite' }}>
                  <circle cx="260" cy="62" r="20" fill={C.orange} /><circle cx="260" cy="62" r="20" fill="none" stroke="#fff" strokeWidth="3" />
                  <g transform="translate(250 52) scale(.85)" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
                    <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                    <circle cx="7" cy="18" r="2" /><path d="M9 18h5" /><circle cx="16" cy="18" r="2" />
                  </g>
                </g>
              </svg>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 21, fontWeight: 800, margin: '4px 0 6px' }}>No bus tracked yet</h3>
              <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Enter your PNR above to see where your bus is right now.</p>
            </div>

            <div className="tb-features" style={{ marginTop: 16 }}>
              {[
                [Radio, 'Live location', 'Watch your bus move on the map and follow it in one tap.', C.orange],
                [Clock, 'Smart ETA', 'Arrival time adjusts automatically when the bus runs late.', C.green],
                [Share2, 'Share the trip', 'Send a tracking link so family can follow along.', C.blue],
              ].map(([Icon, t, d, col]) => (
                <div key={t} style={{ ...card, padding: 20, borderRadius: 18 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: C.soft, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon size={18} color={col} /></span>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}