import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Bus, Search, X, Calendar, Ticket, Key, Armchair, Users,
  ChevronRight, CreditCard, Download, TrendingUp, Sparkles,
  ArrowRight, CheckCircle2, AlertCircle, XCircle, Clock,
  MapPin, Zap, Shield, Star, QrCode, Share2, Copy, Check,
  ExternalLink, Printer, Mail, Phone, Loader2, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: CheckCircle2 },
  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: Clock },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: XCircle },
  completed: { label: 'Completed', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', icon: CheckCircle2 },
};

const paymentColors = {
  paid: '#10b981', pending: '#f59e0b',
  failed: '#ef4444', refunded: '#8b5cf6',
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pnr, setPnr] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Modals
  const [qrBooking, setQrBooking] = useState(null);
  const [shareBooking, setShareBooking] = useState(null);
  const [ticketBooking, setTicketBooking] = useState(null); // NEW: ticket preview modal
  const [downloadingId, setDownloadingId] = useState(null);
  const [copied, setCopied] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => { fetchBookings(); }, [filter]);

  // ESC to close modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setQrBooking(null);
        setShareBooking(null);
        setTicketBooking(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.myBookings(filter ? { status: filter } : {});
      setBookings(data.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? Refund will be initiated.')) return;
    try {
      const { data } = await bookingAPI.cancel(id, { reason: 'User requested' });
      toast.success(`Cancelled! Refund: ₹${data.refundAmount}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const searchByPNR = async () => {
    if (!pnr.trim()) { toast.error('Enter PNR'); return; }
    try {
      const { data } = await bookingAPI.byPNR(pnr.trim());
      setBookings([data.booking]);
      toast.success('Booking found!');
    } catch { toast.error('PNR not found'); }
  };

  /* ===== QR MODAL ===== */
  const openQR = (booking) => setQrBooking(booking);

  /* ===== SHARE MODAL ===== */
  const openShare = (booking) => setShareBooking(booking);

  /* ===== TICKET PREVIEW MODAL ===== */
  const openTicket = (booking) => setTicketBooking(booking);

  const copyShareLink = () => {
    const link = `${window.location.origin}/booking/${shareBooking?._id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform) => {
    const link = `${window.location.origin}/booking/${shareBooking?._id}`;
    const text = `Check out my bus trip: ${shareBooking?.route?.from} → ${shareBooking?.route?.to}`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      email: `mailto:?subject=My Bus Trip&body=${encodeURIComponent(text + '\n' + link)}`,
      sms: `sms:?body=${encodeURIComponent(text + ' ' + link)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
  };

  /* ===== RENDER TICKET TO HIDDEN DIV & GET ELEMENT ===== */
  const renderTicketToElement = async (booking) => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '720px';
    container.style.background = '#fff';
    document.body.appendChild(container);

    const { createRoot } = await import('react-dom/client');
    const root = createRoot(container);

    await new Promise((resolve) => {
      root.render(<TicketTemplate booking={booking} />);
      setTimeout(resolve, 600);
    });

    return { container, root };
  };

  /* ===== DOWNLOAD TICKET PDF ===== */
  const downloadTicket = async (booking) => {
    setDownloadingId(booking._id);
    const toastId = toast.loading('Generating ticket...');

    try {
      const { container, root } = await renderTicketToElement(booking);
      const ticketEl = container.firstChild;

      const canvas = await html2canvas(ticketEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;

      // If taller than page, scale down to fit
      if (imgH > pageH - 20) {
        const scale = (pageH - 20) / imgH;
        pdf.addImage(imgData, 'PNG', 10, 10, imgW * scale, imgH * scale);
      } else {
        pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH);
      }

      pdf.save(`BusGo_Ticket_${booking.pnr || booking.bookingId}.pdf`);

      root.unmount();
      document.body.removeChild(container);
      toast.success('Ticket downloaded!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Download failed', { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  /* ===== DOWNLOAD TICKET AS IMAGE ===== */
  const downloadTicketImage = async (booking) => {
    const toastId = toast.loading('Saving image...');
    try {
      const { container, root } = await renderTicketToElement(booking);
      const canvas = await html2canvas(container.firstChild, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `BusGo_Ticket_${booking.pnr || booking.bookingId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      root.unmount();
      document.body.removeChild(container);
      toast.success('Image saved!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save image', { id: toastId });
    }
  };

  /* ===== PRINT TICKET ===== */
  const printTicket = async (booking) => {
    const toastId = toast.loading('Preparing print...');
    try {
      const { container, root } = await renderTicketToElement(booking);
      const ticketHtml = container.innerHTML;

      const printWindow = window.open('', '_blank', 'width=800,height=900');
      printWindow.document.write(`
        <html>
        <head>
          <title>BusGo Ticket - ${booking.pnr || booking.bookingId}</title>
          <style>
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body {
              margin: 0;
              padding: 20px;
              background: #f1f5f9;
              font-family: 'Inter', system-ui, sans-serif;
            }
            @media print {
              body { background: #fff; padding: 0; }
              @page { margin: 10mm; }
            }
            svg { display: block; }
          </style>
        </head>
        <body>
          ${ticketHtml}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 400);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();

      root.unmount();
      document.body.removeChild(container);
      toast.success('Print ready!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Print failed', { id: toastId });
    }
  };

  const stats = useMemo(() => ({
    total: bookings.length,
    upcoming: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    spent: bookings.reduce((s, b) => s + (b.finalAmount || 0), 0),
  }), [bookings]);

  const filters = [
    { value: '', label: 'All' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />
      <div style={S.dotGrid} />

      <div style={S.container}>
        {/* ===== HEADER ===== */}
        <div style={S.header}>
          <div>
            <div style={S.badge}>
              <span style={S.badgeDot} />
              YOUR JOURNEYS
            </div>
            <h1 style={S.h1}>
              My <span style={S.h1Gradient}>Bookings</span>
            </h1>
            <p style={S.sub}>Track, manage, and revisit all your bus reservations in one place.</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            style={S.primaryBtn}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(249,115,22,0.6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(249,115,22,0.5)'; }}
          >
            <Sparkles size={15} />
            Book New Trip
            <ArrowRight size={15} />
          </button>
        </div>

        {/* ===== STATS ===== */}
        <div style={S.statsGrid}>
          {[
            { label: 'Total Bookings', value: stats.total, icon: Ticket, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Upcoming Trips', value: stats.upcoming, icon: Clock, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Total Spent', value: `₹${stats.spent.toLocaleString('en-IN')}`, icon: TrendingUp, color: '#f97316', bg: '#fff7ed' },
          ].map((s, i) => (
            <div
              key={i}
              style={S.statCard}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(15,23,42,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.04)'; }}
            >
              <div style={{ ...S.statIcon, background: s.bg, color: s.color }}>
                <s.icon size={18} strokeWidth={2.4} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={S.statLabel}>{s.label}</div>
                <div style={S.statValue}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== TOOLBAR ===== */}
        <div style={S.toolbar}>
          <div style={S.tabs}>
            {filters.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    ...S.tab,
                    background: active ? '#0f172a' : 'transparent',
                    color: active ? '#fff' : '#64748b',
                    boxShadow: active ? '0 4px 12px rgba(15,23,42,0.15)' : 'none',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div style={S.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input
              placeholder="Search by PNR..."
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchByPNR()}
              style={S.searchInput}
            />
            {pnr && (
              <button onClick={() => setPnr('')} style={S.clearBtn}>
                <X size={14} />
              </button>
            )}
            <button
              onClick={searchByPNR}
              style={S.searchGo}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ===== LOADING ===== */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={S.skeleton}>
                <div style={{ ...S.skelLine, width: '30%' }} />
                <div style={{ ...S.skelLine, width: '60%', height: '22px' }} />
                <div style={{ ...S.skelLine, width: '80%', height: '14px' }} />
              </div>
            ))}
          </div>
        )}

        {/* ===== EMPTY ===== */}
        {!loading && bookings.length === 0 && (
          <div style={S.empty}>
            <div style={S.emptyIconWrap}>
              <div style={S.emptyIconGlow} />
              <div style={S.emptyIcon}>
                <Bus size={42} color="#f97316" strokeWidth={1.5} />
              </div>
            </div>
            <h3 style={S.emptyTitle}>No Bookings Yet</h3>
            <p style={S.emptySub}>
              Your journey starts here. Book your first trip and it will appear right here.
            </p>
            <button onClick={() => navigate('/search')} style={S.primaryBtn}>
              <Search size={16} />
              Search Buses
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* ===== BOOKINGS ===== */}
        {!loading && bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map((b, idx) => {
              const st = statusConfig[b.status] || statusConfig.pending;
              const StatusIcon = st.icon;
              const isHovered = hoveredCard === b._id;
              const isConfirmed = b.status === 'confirmed';
              const isDownloading = downloadingId === b._id;

              return (
                <div
                  key={b._id}
                  onMouseEnter={() => setHoveredCard(b._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...S.card,
                    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                    boxShadow: isHovered
                      ? '0 20px 40px -12px rgba(15,23,42,0.15), 0 4px 12px rgba(15,23,42,0.06)'
                      : '0 4px 16px rgba(15,23,42,0.06)',
                    borderColor: isHovered ? '#fed7aa' : '#f1f5f9',
                  }}
                >
                  <div style={{ ...S.accentBar, background: st.color }} />

                  <div style={S.cardBody}>
                    {/* ===== LEFT ===== */}
                    <div style={S.cardLeft}>
                      <div style={S.cardTopRow}>
                        <div style={{ ...S.statusPill, background: st.bg, color: st.color, borderColor: st.border }}>
                          <StatusIcon size={12} strokeWidth={2.5} />
                          {st.label.toUpperCase()}
                        </div>
                        <span style={S.bookingIdText}>
                          ID: <span style={S.bookingIdVal}>{b.bookingId}</span>
                        </span>
                      </div>

                      {/* Route */}
                      <div style={S.routeRow}>
                        <div style={S.routePoint}>
                          <div style={S.routeDotFrom}>
                            <div style={S.routeDotFromInner} />
                          </div>
                          <div>
                            <div style={S.routeLabel}>FROM</div>
                            <div style={S.routeCity}>{b.route?.from || 'N/A'}</div>
                          </div>
                        </div>

                        <div style={S.routeMiddle}>
                          <div style={S.routeTrack}>
                            <Bus size={13} color="#f97316" strokeWidth={2.4} />
                          </div>
                          <ChevronRight size={14} color="#cbd5e1" />
                        </div>

                        <div style={S.routePoint}>
                          <div style={S.routeDotTo}>
                            <div style={S.routeDotToInner} />
                          </div>
                          <div>
                            <div style={S.routeLabel}>TO</div>
                            <div style={S.routeCity}>{b.route?.to || 'N/A'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Meta chips */}
                      <div style={S.metaGrid}>
                        <MetaChip icon={Calendar} label="Travel Date" value={new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                        <MetaChip icon={Key} label="PNR" value={b.pnr} mono />
                        <MetaChip icon={Armchair} label="Seats" value={b.passengers?.map((p) => p.seatNumber).join(', ') || '—'} mono />
                        <MetaChip icon={Users} label="Passengers" value={`${b.passengers?.length || 0} Pax`} />
                      </div>
                    </div>

                    {/* ===== RIGHT ===== */}
                    <div style={S.cardRight}>
                      <div style={S.priceBlock}>
                        <div style={S.priceLabel}>Total Amount</div>
                        <div style={S.priceValue}>
                          <span style={S.priceCurrency}>₹</span>
                          {b.finalAmount?.toLocaleString('en-IN')}
                        </div>
                        <div
                          style={{
                            ...S.payPill,
                            color: paymentColors[b.paymentStatus] || '#64748b',
                            background: `${paymentColors[b.paymentStatus] || '#64748b'}15`,
                          }}
                        >
                          <CreditCard size={11} />
                          {b.paymentStatus?.toUpperCase()}
                        </div>
                      </div>

                      <div style={S.actionsCol}>
                        {/* TICKET BUTTON (opens preview modal) */}
                        <button
                          onClick={() => openTicket(b)}
                          style={S.ticketBtn}
                          title="View Ticket"
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(249,115,22,0.5)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#f97316'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <Ticket size={14} />
                          View Ticket
                        </button>

                        {/* QR BUTTON */}
                        <button
                          onClick={() => openQR(b)}
                          style={S.iconBtn}
                          title="QR Code"
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <QrCode size={15} />
                        </button>

                        {/* SHARE BUTTON */}
                        <button
                          onClick={() => openShare(b)}
                          style={S.iconBtn}
                          title="Share"
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.color = '#10b981'; e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <Share2 size={15} />
                        </button>

                        {/* QUICK DOWNLOAD */}
                        <button
                          onClick={() => downloadTicket(b)}
                          disabled={isDownloading}
                          style={S.iconBtn}
                          title="Download PDF"
                          onMouseEnter={(e) => { if (!isDownloading) { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0f172a'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          {isDownloading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={15} />}
                        </button>

                        {/* CANCEL */}
                        {isConfirmed && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            style={S.cancelBtn}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <X size={13} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ TICKET PREVIEW MODAL ============ */}
      {ticketBooking && (
        <div style={S.ticketOverlay} onClick={() => setTicketBooking(null)}>
          <div style={S.ticketModal} onClick={(e) => e.stopPropagation()}>
            <div style={S.ticketModalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={S.ticketModalIcon}>
                  <Ticket size={18} color="#f97316" />
                </div>
                <div>
                  <div style={S.ticketModalTitle}>Your E-Ticket</div>
                  <div style={S.ticketModalSub}>PNR: {ticketBooking.pnr}</div>
                </div>
              </div>
              <button onClick={() => setTicketBooking(null)} style={S.ticketModalClose}>
                <X size={18} />
              </button>
            </div>

            <div style={S.ticketScroll}>
              <TicketTemplate booking={ticketBooking} refProp={ticketRef} />
            </div>

            <div style={S.ticketActions}>
              <button
                onClick={() => downloadTicket(ticketBooking)}
                disabled={downloadingId === ticketBooking._id}
                style={{ ...S.ticketActionBtn, background: '#0f172a', color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {downloadingId === ticketBooking._id ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={15} />}
                {downloadingId === ticketBooking._id ? 'Saving...' : 'Download PDF'}
              </button>
              <button
                onClick={() => downloadTicketImage(ticketBooking)}
                style={{ ...S.ticketActionBtn, background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <Download size={15} /> Save Image
              </button>
              <button
                onClick={() => printTicket(ticketBooking)}
                style={{ ...S.ticketActionBtn, background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#fed7aa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#fff7ed'; }}
              >
                <Printer size={15} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ QR MODAL ============ */}
      {qrBooking && (
        <Modal onClose={() => setQrBooking(null)}>
          <div style={{ textAlign: 'center' }}>
            <div style={S.modalIconWrap}>
              <QrCode size={22} color="#6366f1" />
            </div>
            <h3 style={S.modalTitle}>QR Ticket</h3>
            <p style={S.modalSub}>Show this at boarding</p>

            <div style={S.qrBox}>
              <QRCodeSVG
                value={JSON.stringify({
                  pnr: qrBooking.pnr,
                  bookingId: qrBooking.bookingId,
                  route: `${qrBooking.route?.from}-${qrBooking.route?.to}`,
                  date: qrBooking.travelDate,
                  seats: qrBooking.passengers?.map((p) => p.seatNumber),
                })}
                size={200}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
              />
            </div>

            <div style={S.qrMeta}>
              <div>
                <div style={S.qrMetaLabel}>PNR</div>
                <div style={S.qrMetaValue}>{qrBooking.pnr}</div>
              </div>
              <div>
                <div style={S.qrMetaLabel}>SEATS</div>
                <div style={S.qrMetaValue}>{qrBooking.passengers?.map((p) => p.seatNumber).join(', ')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => downloadTicket(qrBooking)} style={{ ...S.modalBtn, background: '#0f172a', color: '#fff', flex: 1 }}>
                <Download size={14} /> Download
              </button>
              <button onClick={() => setQrBooking(null)} style={{ ...S.modalBtn, background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============ SHARE MODAL ============ */}
      {shareBooking && (
        <Modal onClose={() => setShareBooking(null)}>
          <div>
            <div style={S.modalIconWrap}>
              <Share2 size={22} color="#10b981" />
            </div>
            <h3 style={S.modalTitle}>Share Trip</h3>
            <p style={S.modalSub}>Invite friends to see your booking</p>

            <div style={S.shareGrid}>
              {[
                { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', emoji: '💬' },
                { key: 'telegram', label: 'Telegram', color: '#0088cc', emoji: '✈️' },
                { key: 'twitter', label: 'Twitter', color: '#1DA1F2', emoji: '🐦' },
                { key: 'email', label: 'Email', color: '#ea4335', emoji: '✉️' },
                { key: 'sms', label: 'SMS', color: '#6366f1', emoji: '📱' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => shareVia(p.key)}
                  style={S.shareItem}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = p.color + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ ...S.shareEmoji, background: p.color + '15', color: p.color }}>{p.emoji}</div>
                  <span style={S.shareLabel}>{p.label}</span>
                </button>
              ))}
            </div>

            <div style={S.linkBox}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.linkLabel}>SHARE LINK</div>
                <div style={S.linkValue}>{window.location.origin}/booking/{shareBooking._id}</div>
              </div>
              <button
                onClick={copyShareLink}
                style={{ ...S.copyBtn, background: copied ? '#10b981' : '#0f172a' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

/* ============================================================
   🎫 TICKET TEMPLATE — Original Design with BusGo Watermark
============================================================ */
function TicketTemplate({ booking, refProp }) {
  const st = statusConfig[booking.status] || statusConfig.confirmed;
  const travelDate = new Date(booking.travelDate);
  const issueDate = new Date();

  // Deterministic fake QR for decorative preview
  const qrValue = String(booking.pnr || booking.bookingId || 'BUSGO');

  return (
    <div ref={refProp} style={T.ticket}>
      {/* ============ BUSGO WATERMARK (transparent) ============ */}
      <div style={T.wmWrap} aria-hidden="true">
        {/* big rotated BusGo center */}
        <div style={T.wmCenter}>
          <div style={T.wmBusIcon}>
            <Bus size={90} strokeWidth={1} color="#000" />
          </div>
          <div style={T.wmText}>BusGo</div>
        </div>

        {/* top-right small */}
        <div style={T.wmSmallTR}>
          <div style={{ ...T.wmText, fontSize: '38px', letterSpacing: '4px' }}>BusGo</div>
        </div>

        {/* bottom-left small */}
        <div style={T.wmSmallBL}>
          <div style={{ ...T.wmText, fontSize: '34px', letterSpacing: '4px' }}>BusGo</div>
        </div>
      </div>

      {/* ============ HEADER ============ */}
      <div style={T.header}>
        <div style={T.headerBrand}>
          <div style={T.headerLogo}>
            <Bus size={20} strokeWidth={2.6} color="#fff" />
          </div>
          <div>
            <div style={T.headerName}>BusGo</div>
            <div style={T.headerTag}>India's Most Trusted Bus Booking</div>
          </div>
        </div>
        <div style={T.headerRight}>
          <div style={T.headerType}>E-TICKET</div>
          <div style={T.headerNum}>#{booking.bookingId?.slice(-8) || '00000000'}</div>
        </div>
      </div>

      {/* ============ STATUS STRIP ============ */}
      <div style={T.strip}>
        <div style={{ ...T.stripStatus, background: st.color, color: '#fff' }}>
          <Shield size={11} strokeWidth={2.6} />
          {st.label.toUpperCase()}
        </div>

        <div style={T.stripPnr}>
          <div style={T.stripPnrLabel}>PNR NUMBER</div>
          <div style={T.stripPnrVal}>{booking.pnr || 'N/A'}</div>
        </div>
      </div>

      {/* ============ BODY ============ */}
      <div style={T.body}>
        {/* Route hero */}
        <div style={T.hero}>
          <div style={T.heroCol}>
            <div style={T.heroLabel}>FROM</div>
            <div style={T.heroCity}>{booking.route?.from || 'N/A'}</div>
            <div style={T.heroHint}>Departure Point</div>
          </div>

          <div style={T.heroMid}>
            <div style={T.heroLine} />
            <div style={T.heroBus}>
              <Bus size={16} color="#fff" strokeWidth={2.6} />
            </div>
            <div style={T.heroLine} />
          </div>

          <div style={{ ...T.heroCol, textAlign: 'right' }}>
            <div style={T.heroLabel}>TO</div>
            <div style={T.heroCity}>{booking.route?.to || 'N/A'}</div>
            <div style={T.heroHint}>Arrival Point</div>
          </div>
        </div>

        {/* Info grid */}
        <div style={T.infoGrid}>
          <InfoCell
            icon={Calendar}
            label="TRAVEL DATE"
            value={travelDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            sub={travelDate.toLocaleDateString('en-IN', { weekday: 'long' })}
          />
          <InfoCell
            icon={Users}
            label="PASSENGERS"
            value={`${booking.passengers?.length || 0} Person${(booking.passengers?.length || 0) > 1 ? 's' : ''}`}
            sub={booking.passengers?.map((p) => p.name).filter(Boolean).slice(0, 2).join(', ') || '—'}
          />
          <InfoCell
            icon={Armchair}
            label="SEAT NUMBERS"
            value={booking.passengers?.map((p) => p.seatNumber).join(', ') || '—'}
            sub="Assigned"
            mono
          />
          <InfoCell
            icon={Bus}
            label="BUS / OPERATOR"
            value={booking.bus?.busNumber || booking.busNumber || 'TN-01-AB-1234'}
            sub={booking.bus?.operator || booking.operator || 'TNSTC Deluxe'}
          />
        </div>

        {/* Passenger table */}
        <div style={T.paxSection}>
          <div style={T.secHeader}>
            <div style={T.secTitle}>PASSENGER DETAILS</div>
            <div style={T.secLine} />
          </div>

          <div style={T.paxTable}>
            <div style={T.paxHead}>
              <div style={{ ...T.paxCell, flex: 0.5 }}>#</div>
              <div style={{ ...T.paxCell, flex: 2 }}>NAME</div>
              <div style={{ ...T.paxCell, flex: 0.7 }}>AGE</div>
              <div style={{ ...T.paxCell, flex: 0.7 }}>GENDER</div>
              <div style={{ ...T.paxCell, flex: 1 }}>SEAT</div>
            </div>

            {(booking.passengers || []).map((p, i) => (
              <div key={i} style={{ ...T.paxRow, background: i % 2 ? '#fafbfc' : '#fff' }}>
                <div style={{ ...T.paxCell, flex: 0.5, fontWeight: 700 }}>{i + 1}</div>
                <div style={{ ...T.paxCell, flex: 2, fontWeight: 700 }}>{p.name || 'Passenger'}</div>
                <div style={{ ...T.paxCell, flex: 0.7 }}>{p.age || '—'}</div>
                <div style={{ ...T.paxCell, flex: 0.7 }}>{p.gender || '—'}</div>
                <div style={{ ...T.paxCell, flex: 1, fontWeight: 800, color: '#f97316' }}>
                  {p.seatNumber || '—'}
                </div>
              </div>
            ))}

            {(!booking.passengers || booking.passengers.length === 0) && (
              <div style={{ ...T.paxRow, justifyContent: 'center', color: '#94a3b8' }}>
                No passenger details available
              </div>
            )}
          </div>
        </div>

        {/* Fare + QR */}
        <div style={T.fareRow}>
          <div style={T.fareBox}>
            <div style={T.fareLabel}>TOTAL FARE</div>
            <div style={T.fareValue}>
              <span style={T.fareCur}>₹</span>
              {booking.finalAmount?.toLocaleString('en-IN') || '0'}
            </div>
            <div style={T.fareMeta}>
              <span style={{ color: paymentColors[booking.paymentStatus] || '#f59e0b' }}>
                ● {booking.paymentStatus?.toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>

          <div style={T.qrBox}>
            <QRCodeSVG value={qrValue} size={96} bgColor="#ffffff" fgColor="#0f172a" level="M" />
            <div style={T.qrLabel}>SCAN AT BOARDING</div>
          </div>
        </div>

        {/* Terms */}
        <div style={T.terms}>
          <div style={T.termsTitle}>IMPORTANT INSTRUCTIONS</div>
          <div style={T.termsList}>
            <span>• Carry valid ID proof for verification</span>
            <span>• Reach 15 minutes before departure</span>
            <span>• No refund after bus departure</span>
          </div>
        </div>
      </div>

      {/* ============ FOOTER ============ */}
      <div style={T.footer}>
        <div>
          <div style={T.footerBrand}>
            <Bus size={13} color="#f97316" strokeWidth={2.6} />
            <span style={{ fontWeight: 800, color: '#0f172a' }}>BusGo</span>
          </div>
          <div style={T.footerMeta}>
            Issued on {issueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' at '}
            {issueDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div style={T.footerRight}>
          <FooterContact icon={Phone} value="1800-BUS-GO" />
          <FooterContact icon={Mail} value="support@busgo.com" />
          <FooterContact icon={Globe} value="busgo.com" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub components ---------- */
function InfoCell({ icon: Icon, label, value, sub, mono }) {
  return (
    <div style={T.infoCell}>
      <div style={T.infoIcon}>
        <Icon size={14} strokeWidth={2.4} color="#f97316" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={T.infoLabel}>{label}</div>
        <div style={{ ...T.infoValue, fontFamily: mono ? 'ui-monospace, monospace' : 'inherit' }}>
          {value}
        </div>
        {sub && <div style={T.infoSub}>{sub}</div>}
      </div>
    </div>
  );
}

function FooterContact({ icon: Icon, value }) {
  return (
    <div style={T.footerContact}>
      <Icon size={11} color="#64748b" strokeWidth={2.2} />
      <span>{value}</span>
    </div>
  );
}

/* ============ TICKET STYLES ============ */
const T = {
  ticket: {
    position: 'relative',
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    color: '#0f172a',
    boxShadow: '0 30px 80px -20px rgba(15,23,42,0.25), 0 8px 24px rgba(15,23,42,0.08)',
    border: '1px solid #f1f5f9',
  },

  /* ---- WATERMARK ---- */
  wmWrap: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 0,
  },
  wmCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-24deg)',
    opacity: 0.05,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  wmBusIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wmText: {
    fontSize: '72px',
    fontWeight: 900,
    letterSpacing: '8px',
    color: '#000',
    lineHeight: 1,
    fontFamily: "'Inter', sans-serif",
  },
  wmSmallTR: {
    position: 'absolute',
    top: '30%',
    right: '4%',
    transform: 'rotate(-20deg)',
    opacity: 0.035,
  },
  wmSmallBL: {
    position: 'absolute',
    bottom: '22%',
    left: '4%',
    transform: 'rotate(-20deg)',
    opacity: 0.035,
  },

  /* ---- HEADER ---- */
  header: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 28px',
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: '#fff',
    gap: '16px',
    flexWrap: 'wrap',
  },
  headerBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: { fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 },
  headerTag: { fontSize: '10px', opacity: 0.9, letterSpacing: '0.5px', marginTop: '3px', fontWeight: 500 },
  headerRight: { textAlign: 'right' },
  headerType: { fontSize: '10px', fontWeight: 800, letterSpacing: '3px', opacity: 0.85, marginBottom: '3px' },
  headerNum: { fontSize: '13px', fontWeight: 700, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.5px' },

  /* ---- STATUS STRIP ---- */
  strip: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 28px',
    background: '#f8fafc',
    borderBottom: '1px dashed #e2e8f0',
    gap: '12px',
    flexWrap: 'wrap',
  },
  stripStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1.5px',
    boxShadow: '0 4px 12px -3px rgba(0,0,0,0.15)',
  },
  stripPnr: { textAlign: 'right' },
  stripPnrLabel: { fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '2px' },
  stripPnrVal: { fontSize: '15px', fontWeight: 900, color: '#0f172a', fontFamily: 'ui-monospace, monospace', letterSpacing: '1px' },

  /* ---- BODY ---- */
  body: { position: 'relative', zIndex: 2, padding: '24px 28px' },

  /* ---- HERO ---- */
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 20px',
    background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    borderRadius: '16px',
    border: '1px solid #fed7aa',
    marginBottom: '22px',
  },
  heroCol: { flex: 1, minWidth: 0 },
  heroLabel: { fontSize: '9px', color: '#ea580c', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '4px' },
  heroCity: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#0f172a',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  heroHint: { fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 },
  heroMid: { display: 'flex', alignItems: 'center', gap: '6px', flex: 0.8, minWidth: '80px' },
  heroLine: { flex: 1, height: '2px', borderTop: '2px dashed #fb923c' },
  heroBus: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 4px rgba(249,115,22,0.15), 0 4px 12px rgba(249,115,22,0.4)',
    flexShrink: 0,
  },

  /* ---- INFO GRID ---- */
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '22px',
  },
  infoCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
    minWidth: 0,
  },
  infoIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: '#fff',
    border: '1px solid #fed7aa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoLabel: { fontSize: '9px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1.2px', marginBottom: '3px' },
  infoValue: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  infoSub: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '2px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  /* ---- PASSENGERS ---- */
  paxSection: { marginBottom: '22px' },
  secHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  secTitle: { fontSize: '10px', fontWeight: 900, letterSpacing: '2px', color: '#0f172a' },
  secLine: { flex: 1, height: '1px', background: 'linear-gradient(90deg, #e2e8f0, transparent)' },
  paxTable: { border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' },
  paxHead: {
    display: 'flex',
    background: '#0f172a',
    color: '#fff',
    padding: '10px 16px',
    fontSize: '9px',
    fontWeight: 800,
    letterSpacing: '1.5px',
  },
  paxRow: {
    display: 'flex',
    padding: '12px 16px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '12px',
    color: '#0f172a',
    alignItems: 'center',
  },
  paxCell: {
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  /* ---- FARE + QR ---- */
  fareRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: '14px',
    padding: '18px 20px',
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
    borderRadius: '16px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  fareBox: { flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  fareLabel: { fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '2px', marginBottom: '6px' },
  fareValue: {
    fontSize: '34px',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.04em',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  fareCur: { fontSize: '22px', color: '#fb923c', fontWeight: 800 },
  fareMeta: { fontSize: '11px', fontWeight: 700, marginTop: '8px', letterSpacing: '1px' },
  qrBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '10px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 0 0 4px rgba(255,255,255,0.08)',
  },
  qrLabel: { fontSize: '8px', color: '#64748b', fontWeight: 800, letterSpacing: '1.2px' },

  /* ---- TERMS ---- */
  terms: {
    padding: '14px 16px',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '12px',
  },
  termsTitle: { fontSize: '9px', color: '#92400e', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '6px' },
  termsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    fontSize: '11px',
    color: '#78350f',
    fontWeight: 500,
    lineHeight: 1.5,
  },

  /* ---- FOOTER ---- */
  footer: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 28px',
    background: '#f8fafc',
    borderTop: '1px dashed #e2e8f0',
    flexWrap: 'wrap',
  },
  footerBrand: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '3px' },
  footerMeta: { fontSize: '10px', color: '#94a3b8', fontWeight: 500 },
  footerRight: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
  footerContact: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#64748b', fontWeight: 600 },
};

/* ============ META CHIP ============ */
function MetaChip({ icon: Icon, label, value, mono }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...S.metaChip,
        borderColor: hover ? '#fed7aa' : '#f1f5f9',
        background: hover ? '#fff7ed' : '#f8fafc',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ ...S.metaIconWrap, color: hover ? '#f97316' : '#94a3b8' }}>
        <Icon size={13} strokeWidth={2.2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={S.metaLabel}>{label}</div>
        <div style={{ ...S.metaValue, fontFamily: mono ? 'ui-monospace, monospace' : 'inherit' }}>{value}</div>
      </div>
    </div>
  );
}

/* ============ MODAL WRAPPER ============ */
function Modal({ children, onClose }) {
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={S.modalClose} aria-label="Close">
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ==================== STYLES ==================== */
const S = {
  /* ---- Page ---- */
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: '80px',
    paddingBottom: '80px',
    fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    color: '#0f172a',
  },
  blob1: {
    position: 'absolute', top: '-180px', left: '-180px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-180px', right: '-180px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
    pointerEvents: 'none',
  },
  dotGrid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.05) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    maskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)',
    WebkitMaskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)',
  },
  container: { position: 'relative', maxWidth: '1120px', margin: '0 auto', padding: '0 24px', zIndex: 2 },

  /* ---- Header ---- */
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '6px 14px', borderRadius: '20px',
    background: '#fff7ed', border: '1px solid #fed7aa',
    color: '#ea580c', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px',
    marginBottom: '12px',
  },
  badgeDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', boxShadow: '0 0 8px #f97316' },
  h1: { fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#0f172a' },
  h1Gradient: {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  sub: { color: '#64748b', fontSize: '14px', marginTop: '8px', maxWidth: '480px', lineHeight: 1.6 },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '12px 20px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 12px 30px -8px rgba(249,115,22,0.5)',
    fontFamily: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  /* ---- Stats ---- */
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '28px' },
  statCard: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '18px', background: '#fff',
    border: '1px solid #f1f5f9', borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'default',
  },
  statIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' },
  statValue: { fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 },

  /* ---- Toolbar ---- */
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: '4px', padding: '4px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', flexWrap: 'wrap' },
  tab: { padding: '8px 15px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s', fontFamily: 'inherit' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '5px 5px 5px 14px',
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '12px', minWidth: '280px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    transition: 'border-color 0.25s, box-shadow 0.25s',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '13px', padding: '8px 0', color: '#0f172a', fontFamily: 'inherit', background: 'transparent' },
  clearBtn: { border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  searchGo: {
    padding: '8px 12px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
    boxShadow: '0 4px 12px -3px rgba(249,115,22,0.5)',
    transition: 'transform 0.2s',
  },

  /* ---- Loading ---- */
  skeleton: { padding: '24px', background: '#fff', borderRadius: '18px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' },
  skelLine: {
    height: '14px', borderRadius: '6px',
    background: 'linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },

  /* ---- Empty ---- */
  empty: {
    textAlign: 'center', padding: '60px 24px',
    background: '#fff', border: '1px dashed #e2e8f0',
    borderRadius: '20px', maxWidth: '520px', margin: '0 auto',
  },
  emptyIconWrap: { position: 'relative', width: '100px', height: '100px', margin: '0 auto 20px' },
  emptyIconGlow: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.2), transparent 70%)',
    filter: 'blur(20px)',
  },
  emptyIcon: {
    position: 'relative', width: '100%', height: '100%',
    background: '#fff7ed', border: '1px solid #fed7aa',
    borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: '20px', fontWeight: 800, margin: '0 0 8px', color: '#0f172a', letterSpacing: '-0.02em' },
  emptySub: { color: '#64748b', fontSize: '14px', margin: '0 0 22px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 },

  /* ---- Booking card ---- */
  card: {
    position: 'relative', background: '#fff',
    border: '1px solid #f1f5f9', borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  },
  accentBar: { height: '3px', width: '100%' },
  cardBody: { display: 'flex', justifyContent: 'space-between', gap: '24px', padding: '22px 24px', flexWrap: 'wrap' },
  cardLeft: { flex: 1, minWidth: '280px' },
  cardRight: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', minWidth: '240px' },
  cardTopRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  statusPill: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px',
    border: '1px solid transparent',
  },
  bookingIdText: { fontSize: '12px', color: '#94a3b8', fontWeight: 500 },
  bookingIdVal: { fontFamily: 'ui-monospace, monospace', color: '#0f172a', fontWeight: 700 },

  /* ---- Route ---- */
  routeRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' },
  routePoint: { display: 'flex', alignItems: 'center', gap: '10px' },
  routeDotFrom: { width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 4px rgba(16,185,129,0.15)' },
  routeDotFromInner: { display: 'none' },
  routeDotTo: { width: '12px', height: '12px', borderRadius: '50%', background: '#f97316', boxShadow: '0 0 0 4px rgba(249,115,22,0.15)' },
  routeDotToInner: { display: 'none' },
  routeLabel: { fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px', marginBottom: '2px' },
  routeCity: { fontSize: '17px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' },
  routeMiddle: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '60px', maxWidth: '160px' },
  routeTrack: {
    flex: 1, height: '2px',
    borderTop: '2px dashed #e2e8f0',
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* ---- Meta ---- */
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' },
  metaChip: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px',
    background: '#f8fafc', border: '1px solid #f1f5f9',
    borderRadius: '12px',
    transition: 'all 0.25s', minWidth: 0,
  },
  metaIconWrap: {
    width: '28px', height: '28px', borderRadius: '8px',
    background: '#fff', border: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'color 0.25s',
  },
  metaLabel: { fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '2px' },
  metaValue: { fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' },

  /* ---- Price ---- */
  priceBlock: { textAlign: 'right' },
  priceLabel: { fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' },
  priceValue: { fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '2px', justifyContent: 'flex-end' },
  priceCurrency: { fontSize: '18px', color: '#f97316' },
  payPill: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 8px', borderRadius: '20px',
    fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px',
    marginTop: '8px',
  },

  /* ---- Actions ---- */
  actionsCol: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  iconBtn: {
    width: '38px', height: '38px', borderRadius: '10px',
    border: '1px solid #e2e8f0', background: '#fff',
    color: '#64748b', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.25s',
  },
  ticketBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '9px 14px', borderRadius: '10px',
    border: '1px solid #fed7aa', background: '#fff',
    color: '#f97316', fontSize: '12px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.25s',
  },
  cancelBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '10px 16px', borderRadius: '10px',
    border: '1px solid #fecaca', background: '#fef2f2',
    color: '#ef4444', fontSize: '12px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.25s',
  },

  /* ---- Ticket Preview Modal ---- */
  ticketOverlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(15,23,42,0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    animation: 'fadeIn 0.25s ease-out',
  },
  ticketModal: {
    position: 'relative',
    width: '100%', maxWidth: '800px', maxHeight: '94vh',
    background: '#fff',
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
    animation: 'scaleIn 0.3s cubic-bezier(0.4,0,0.2,1)',
  },
  ticketModalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fff',
    flexShrink: 0,
  },
  ticketModalIcon: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: '#fff7ed', border: '1px solid #fed7aa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ticketModalTitle: { fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' },
  ticketModalSub: { fontSize: '11px', color: '#94a3b8', fontFamily: 'ui-monospace, monospace', marginTop: '2px' },
  ticketModalClose: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: '#f8fafc', border: '1px solid #f1f5f9',
    color: '#64748b', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  },
  ticketScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
  },
  ticketActions: {
    display: 'flex', gap: '10px',
    padding: '16px 24px',
    background: '#fff',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  ticketActionBtn: {
    flex: 1, minWidth: '140px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '12px 16px', borderRadius: '12px',
    border: 'none', fontSize: '13px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.25s',
  },

  /* ---- Modal ---- */
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(15,23,42,0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    animation: 'fadeIn 0.25s ease-out',
  },
  modalCard: {
    position: 'relative',
    width: '100%', maxWidth: '420px',
    background: '#fff',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 25px 60px -12px rgba(15,23,42,0.35)',
    animation: 'scaleIn 0.3s cubic-bezier(0.4,0,0.2,1)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  modalClose: {
    position: 'absolute', top: '16px', right: '16px',
    width: '32px', height: '32px', borderRadius: '10px',
    background: '#f8fafc', border: '1px solid #f1f5f9',
    color: '#64748b', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  },
  modalIconWrap: {
    width: '48px', height: '48px', borderRadius: '14px',
    background: '#eef2ff', color: '#6366f1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
  },
  modalTitle: { fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a', textAlign: 'center', letterSpacing: '-0.02em' },
  modalSub: { fontSize: '13px', color: '#64748b', margin: '0 0 20px', textAlign: 'center' },
  modalBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '11px 16px', borderRadius: '10px',
    border: 'none', fontSize: '13px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'transform 0.2s',
  },

  /* ---- QR ---- */
  qrBox: {
    padding: '20px', background: '#f8fafc',
    borderRadius: '16px', border: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '16px',
  },
  qrMeta: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
    padding: '14px', background: '#f8fafc',
    borderRadius: '12px', border: '1px solid #f1f5f9',
  },
  qrMetaLabel: { fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px', marginBottom: '3px' },
  qrMetaValue: { fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'ui-monospace, monospace' },

  /* ---- Share ---- */
  shareGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '10px', marginBottom: '18px',
  },
  shareItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    padding: '14px 8px', borderRadius: '12px',
    background: '#fff', border: '1px solid #e2e8f0',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.25s',
  },
  shareEmoji: {
    width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px',
  },
  shareLabel: { fontSize: '11px', fontWeight: 700, color: '#0f172a' },
  linkBox: {
    display: 'flex', gap: '8px', alignItems: 'center',
    padding: '10px 10px 10px 14px', background: '#f8fafc',
    border: '1px solid #f1f5f9', borderRadius: '12px',
  },
  linkLabel: { fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px', marginBottom: '2px' },
  linkValue: {
    fontSize: '11px', color: '#0f172a', fontWeight: 600,
    fontFamily: 'ui-monospace, monospace',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  copyBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '8px 12px', borderRadius: '8px', border: 'none',
    color: '#fff', fontSize: '12px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.25s', flexShrink: 0,
  },
};