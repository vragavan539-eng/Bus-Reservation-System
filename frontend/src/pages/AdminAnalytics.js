import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { adminAPI } from '../services/api';
import {
  Users, Ticket, Bus, Map, DollarSign, TrendingUp,
  Download, RefreshCw, Loader2, AlertTriangle,
  BarChart3, PieChart as PieIcon, Award, ServerCrash
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#ef4444'];

const statusColors = {
  confirmed: '#059669',
  pending:   '#d97706',
  cancelled: '#dc2626',
  completed: '#2563eb',
};

const RANGES = [
  { value: '7d',  label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y',  label: 'Last 1 year' },
  { value: 'all', label: 'All time' },
];

/* ───────── helpers ───────── */
const inr = (n) => Number(n || 0).toLocaleString('en-IN');
const compactInr = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `₹${v}`);

async function readError(err) {
  const status = err.response?.status;
  const d = err.response?.data;
  let msg = d?.message;
  if (!msg && typeof Blob !== 'undefined' && d instanceof Blob) {
    try { msg = JSON.parse(await d.text()).message; } catch { /* not JSON */ }
  }
  if (!msg && typeof d === 'string') msg = d.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
  if (!status) return { status: 0, text: `Network error: ${err.message}` };
  return { status, text: `${status} · ${msg || err.message}` };
}

const hintFor = (status) => {
  if (status === 0) return 'Backend is not reachable. Start it (npm run dev in /backend) and check the port in package.json "proxy".';
  if (status === 404) return 'Route not found. Restart the backend and make sure server.js mounts /api/admin/analytics BEFORE /api/admin.';
  if (status === 401) return 'Session expired. Log in again as admin.';
  if (status === 403) return 'This account is not an admin.';
  if (status >= 500) return 'Server error. The backend terminal shows the exact line that failed.';
  return 'Check the backend terminal for details.';
};

const tooltipStyle = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };
const axisProps = { tick: { fontSize: 11, fill: '#64748b' }, axisLine: { stroke: '#e5e7eb' }, tickLine: { stroke: '#e5e7eb' } };

/* ───────── small components ───────── */
function Panel({ icon: Icon, iconColor, iconBg, title, titleSize = 15, mb = 16, children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: mb }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={iconColor} />
        </div>
        <h2 style={{ fontSize: titleSize, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

const Empty = ({ pad = 40, children = 'No data available' }) => (
  <div style={{ padding: pad, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>{children}</div>
);

function RankList({ items, accent, renderTitle, renderSub }) {
  if (items.length === 0) return <Empty pad={30} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: accent.shades[Math.min(i, 3)],
            color: i < 3 ? '#fff' : accent.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, flexShrink: 0,
          }}>#{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{renderTitle(it)}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{renderSub(it)}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>₹{inr(it.revenue)}</div>
        </div>
      ))}
    </div>
  );
}

/* ───────── page ───────── */
export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30d');
  const [exporting, setExporting] = useState(false);
  const reqId = useRef(0);

  const fetchData = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.analytics(range);
      if (id !== reqId.current) return;
      const payload = res.data?.data || res.data;
      setData(payload && typeof payload === 'object' ? payload : null);
    } catch (err) {
      const e = await readError(err);
      if (id !== reqId.current) return;
      setData(null);
      setError(e);
      toast.error('Failed to load analytics');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ============ ✅ UPDATED: Excel export ============ */
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminAPI.exportAnalytics(range);

      // Backend now sends .xlsx directly
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${range}-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel file downloaded');
    } catch (err) {
      const e = await readError(err);
      toast.error(`Export failed: ${e.text}`);
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary || {};
  const trend = Array.isArray(data?.revenueTrend) ? data.revenueTrend : [];
  const topRoutes = Array.isArray(data?.topRoutes) ? data.topRoutes : [];
  const topBuses = Array.isArray(data?.topBuses) ? data.topBuses : [];
  const statusBreakdown = (Array.isArray(data?.statusBreakdown) ? data.statusBreakdown : []).map((s) => ({
    name: s._id || 'unknown',
    value: s.count || 0,
    color: statusColors[s._id] || '#94a3b8',
  }));
  const paymentBreakdown = (Array.isArray(data?.paymentBreakdown) ? data.paymentBreakdown : []).map((p, i) => ({
    name: p._id || 'unknown',
    value: p.count || 0,
    color: COLORS[i % COLORS.length],
  }));

  const cards = [
    { label: 'Total Revenue',  value: `₹${inr(summary.totalRevenue)}`,           Icon: DollarSign,    color: '#f97316', bg: '#fff7ed' },
    { label: 'Total Bookings', value: inr(summary.totalBookings),                Icon: Ticket,        color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Total Users',    value: inr(summary.totalUsers),                   Icon: Users,         color: '#22c55e', bg: '#ecfdf5' },
    { label: 'Active Buses',   value: inr(summary.totalBuses),                   Icon: Bus,           color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Active Routes',  value: inr(summary.totalRoutes),                  Icon: Map,           color: '#eab308', bg: '#fefce8' },
    { label: 'Cancel Rate',    value: `${Number(summary.cancellationRate || 0)}%`, Icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
  ];

  return (
    <AdminLayout title="Analytics & Reports">
      {/* ============ HEADER ============ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {RANGES.map((r) => {
            const active = range === r.value;
            return (
              <button key={r.value} onClick={() => setRange(r.value)}
                style={{ padding: '8px 14px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: active ? '#f97316' : 'transparent', color: active ? '#fff' : '#64748b', transition: 'all .2s', whiteSpace: 'nowrap' }}>
                {r.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchData} disabled={loading} title="Refresh"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} />
          </button>
          <button onClick={handleExport} disabled={exporting || loading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: exporting ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {exporting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={15} />}
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* ============ ERROR BANNER ============ */}
      {error && !loading && (
        <div role="alert" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <ServerCrash size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#b91c1c', wordBreak: 'break-word' }}>{error.text}</div>
            <div style={{ fontSize: 12.5, color: '#7f1d1d', marginTop: 4, lineHeight: 1.6 }}>{hintFor(error.status)}</div>
          </div>
          <button onClick={fetchData} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#64748b' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#f97316' }} />
          <p style={{ marginTop: 12, fontWeight: 500 }}>Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* ============ SUMMARY CARDS ============ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(180px,100%),1fr))', gap: 16, marginBottom: 24 }}>
            {cards.map(({ label, value, Icon, color, bg }) => (
              <div key={label}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all .25s' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(249,115,22,0.08)'; e.currentTarget.style.borderColor = '#fed7aa'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={color} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ============ REVENUE TREND ============ */}
          <Panel icon={TrendingUp} iconColor="#f97316" iconBg="#fff7ed" title="Revenue & Bookings Trend" titleSize={16} mb={18} style={{ marginBottom: 20 }}>
            {trend.length === 0 ? (
              <div style={{ height: 300, border: '1px dashed #e5e7eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
                No bookings in this period
              </div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
                    <YAxis yAxisId="left" {...axisProps} tickFormatter={compactInr} />
                    <YAxis yAxisId="right" orientation="right" {...axisProps} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value, name) => (name === 'Revenue' ? [`₹${inr(value)}`, name] : [value, name])} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }} activeDot={{ r: 5 }} />
                    <Line yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* ============ STATUS + PAYMENT ============ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))', gap: 20, marginBottom: 20 }}>
            <Panel icon={PieIcon} iconColor="#3b82f6" iconBg="#eff6ff" title="Booking Status">
              {statusBreakdown.length === 0 ? <Empty /> : (
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11, fontWeight: 600 }}>
                        {statusBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel icon={BarChart3} iconColor="#22c55e" iconBg="#ecfdf5" title="Payment Status">
              {paymentBreakdown.length === 0 ? <Empty /> : (
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" {...axisProps} />
                      <YAxis {...axisProps} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {paymentBreakdown.map((p, i) => <Cell key={i} fill={p.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>
          </div>

          {/* ============ TOP ROUTES & BUSES ============ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(360px,100%),1fr))', gap: 20 }}>
            <Panel icon={Award} iconColor="#f97316" iconBg="#fff7ed" title="Top Routes">
              <RankList items={topRoutes}
                accent={{ shades: ['#f97316', '#fb923c', '#fdba74', '#fed7aa'], text: '#9a3412' }}
                renderTitle={(r) => `${r.from || '—'} → ${r.to || '—'}`}
                renderSub={(r) => `${inr(r.bookings)} bookings`} />
            </Panel>

            <Panel icon={Award} iconColor="#8b5cf6" iconBg="#f5f3ff" title="Top Buses">
              <RankList items={topBuses}
                accent={{ shades: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'], text: '#5b21b6' }}
                renderTitle={(b) => b.busName || '—'}
                renderSub={(b) => `${b.busNumber || '—'} • ${inr(b.bookings)} bookings`} />
            </Panel>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  );
}