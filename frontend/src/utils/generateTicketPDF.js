import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/*
  generateTicketPDF.js
  ---------------------------------------------------------
  Place in: /frontend/src/utils/generateTicketPDF.js

  Usage (e.g. in MyBookingsPage.js or BookingConfirmPage.js):

    import { downloadTicketPDF } from '../utils/generateTicketPDF';

    <button onClick={() => downloadTicketPDF(booking)}>
      Download Ticket
    </button>

  Expects a `booking` object shaped like what bookingAPI already
  returns (seen in MyBookingsPage.js):
    booking.bookingId, booking.pnr, booking.status,
    booking.travelDate, booking.finalAmount, booking.paymentStatus,
    booking.route.from, booking.route.to,
    booking.route.departureTime, booking.route.arrivalTime,
    booking.passengers: [{ name, age, gender, seatNumber }]
    booking.bus?.busName, booking.bus?.busType  (optional, falls back gracefully)

  The QR code encodes a small JSON payload (bookingId + pnr) so a
  conductor's scanner app can read it and look the booking up via
  your existing bookingAPI.byPNR(pnr) endpoint for verification.
*/

const BRAND_ORANGE = [249, 115, 22];
const INK = [15, 23, 42];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];

export async function downloadTicketPDF(booking) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 0;

  // ── Header band ──────────────────────────────────────────
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageWidth, 90, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('BusGo', margin, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text("Tamil Nadu's Bus Booking Platform", margin, 66);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(251, 191, 36);
  doc.text('E-TICKET', pageWidth - margin, 48, { align: 'right' });

  y = 120;

  // ── Route headline ───────────────────────────────────────
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`${booking.route?.from || ''}  ->  ${booking.route?.to || ''}`, margin, y);

  y += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  const dateStr = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const timeStr = [booking.route?.departureTime, booking.route?.arrivalTime].filter(Boolean).join(' -> ');
  doc.text([dateStr, timeStr].filter(Boolean).join('   |   '), margin, y);

  y += 30;
  doc.setDrawColor(...LINE);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  // ── Booking info grid ────────────────────────────────────
  const infoPairs = [
    ['Booking ID', booking.bookingId || '-'],
    ['PNR', booking.pnr || '-'],
    ['Bus', [booking.bus?.busName, booking.bus?.busType].filter(Boolean).join(' - ') || '-'],
    ['Status', (booking.status || '-').toUpperCase()],
    ['Payment', (booking.paymentStatus || '-').toUpperCase()],
    ['Fare', booking.finalAmount != null ? `Rs. ${booking.finalAmount}` : '-'],
  ];
  const colWidth = (pageWidth - margin * 2) / 2;
  infoPairs.forEach((pair, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colWidth;
    const rowY = y + row * 42;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(pair[0].toUpperCase(), x, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(String(pair[1]), x, rowY + 16);
  });

  y += Math.ceil(infoPairs.length / 2) * 42 + 20;
  doc.setDrawColor(...LINE);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  // ── Passenger table ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text('Passengers', margin, y);
  y += 18;

  const passengers = booking.passengers || [];
  const tableX = margin;
  const colWidths = [26, 180, 70, 60, 70];
  const headers = ['#', 'Name', 'Age', 'Gender', 'Seat'];

  doc.setFillColor(248, 250, 252);
  doc.rect(tableX, y, pageWidth - margin * 2, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  let cx = tableX + 8;
  headers.forEach((h, i) => {
    doc.text(h.toUpperCase(), cx, y + 16);
    cx += colWidths[i];
  });
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  passengers.forEach((p, idx) => {
    y += 24;
    if (y > 650) { doc.addPage(); y = 60; }
    cx = tableX + 8;
    const rowVals = [String(idx + 1), p.name || '-', String(p.age ?? '-'), p.gender || '-', p.seatNumber || '-'];
    rowVals.forEach((val, i) => {
      doc.text(val, cx, y);
      cx += colWidths[i];
    });
    doc.setDrawColor(...LINE);
    doc.line(tableX, y + 8, pageWidth - margin, y + 8);
  });

  y += 40;

  // ── QR code ──────────────────────────────────────────────
  const qrPayload = JSON.stringify({ bookingId: booking.bookingId, pnr: booking.pnr });
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 240 });

  const qrSize = 110;
  if (y + qrSize > 760) { doc.addPage(); y = 60; }
  doc.addImage(qrDataUrl, 'PNG', margin, y, qrSize, qrSize);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text('Show this QR code to the conductor for', margin + qrSize + 20, y + 40);
  doc.text('boarding verification.', margin + qrSize + 20, y + 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(`PNR: ${booking.pnr || '-'}`, margin + qrSize + 20, y + 80);

  // ── Footer ───────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text('This is a computer-generated ticket and does not require a signature.', margin, pageHeight - 36);
  doc.text('BusGo | support@busgo.com', margin, pageHeight - 22);

  doc.save(`BusGo_Ticket_${booking.pnr || booking.bookingId || 'ticket'}.pdf`);
}