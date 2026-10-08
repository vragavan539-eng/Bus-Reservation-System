const Booking = require('../models/Booking');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const XLSX = require('xlsx');

const DAY = 24 * 60 * 60 * 1000;
const IST_OFFSET = 330 * 60 * 1000;          // Asia/Kolkata = UTC+5:30
const TZ = 'Asia/Kolkata';
const VALID_RANGES = ['7d', '30d', '90d', '1y', 'all'];
const PAID_STATUSES = ['confirmed', 'completed'];

// Works whether the Booking model stores the amount as finalAmount or totalAmount
const AMOUNT = { $ifNull: ['$finalAmount', { $ifNull: ['$totalAmount', 0] }] };

/* Midnight (IST) of the day that contains `date`, returned as a UTC Date */
const istMidnight = (date) => {
  const t = new Date(date.getTime() + IST_OFFSET);
  t.setUTCHours(0, 0, 0, 0);
  return new Date(t.getTime() - IST_OFFSET);
};

/* Turns ?range= into a start date and a trend mode.
   7d / 30d / 90d  -> one point per day      (the range INCLUDES today)
   1y / all        -> one point per month    (daily points would be unreadable) */
function resolveRange(rawRange) {
  const range = VALID_RANGES.includes(rawRange) ? rawRange : '30d';
  const now = new Date();
  const todayStart = istMidnight(now);

  if (range === '7d' || range === '30d' || range === '90d') {
    const days = parseInt(range, 10);
    return { range, mode: 'day', days, startDate: new Date(todayStart.getTime() - (days - 1) * DAY) };
  }
  if (range === '1y') {
    const ist = new Date(now.getTime() + IST_OFFSET);
    const start = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() - 11, 1) - IST_OFFSET);
    return { range, mode: 'month', startDate: start };
  }
  return { range, mode: 'month', startDate: new Date(0) };
}

const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-IN', { month: 'short', year: '2-digit', timeZone: 'UTC' });
};

function fillDaily(rows, startDate, days) {
  const map = new Map(rows.map((r) => [r._id, r]));
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getTime() + i * DAY);
    const key = new Date(d.getTime() + IST_OFFSET).toISOString().slice(0, 10);
    const found = map.get(key);
    out.push({
      date: key,
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: TZ }),
      revenue: found?.revenue || 0,
      bookings: found?.bookings || 0,
    });
  }
  return out;
}

function fillMonthly(rows, range) {
  if (rows.length === 0) return [];
  const map = new Map(rows.map((r) => [r._id, r]));
  const nowIst = new Date(Date.now() + IST_OFFSET);
  const endKey = `${nowIst.getUTCFullYear()}-${String(nowIst.getUTCMonth() + 1).padStart(2, '0')}`;
  // 1y always shows 12 months; "all" starts at the first month that has data
  let [y, m] = range === '1y'
    ? (() => { const s = new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth() - 11, 1)); return [s.getUTCFullYear(), s.getUTCMonth() + 1]; })()
    : rows[0]._id.split('-').map(Number);
  const out = [];
  for (let guard = 0; guard < 600; guard++) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const found = map.get(key);
    out.push({ date: key, label: monthLabel(key), revenue: found?.revenue || 0, bookings: found?.bookings || 0 });
    if (key >= endKey) break;
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

/**
 * GET /api/admin/analytics?range=30d
 * range: 7d | 30d | 90d | 1y | all
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { range, mode, days, startDate } = resolveRange(req.query.range);
    const inRange = { createdAt: { $gte: startDate } };
    const paid = { status: { $in: PAID_STATUSES }, ...inRange };

    // ---------- SUMMARY ----------
    const [totalUsers, totalBookings, totalBuses, totalRoutes, cancelledCount, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(inRange),
      Bus.countDocuments(),
      Route.countDocuments(),
      Booking.countDocuments({ status: 'cancelled', ...inRange }),
      Booking.aggregate([
        { $match: paid },
        { $group: { _id: null, total: { $sum: AMOUNT } } },
      ]),
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const cancellationRate = totalBookings ? Number(((cancelledCount / totalBookings) * 100).toFixed(1)) : 0;

    // ---------- TREND ----------
    const trendRows = await Booking.aggregate([
      { $match: paid },
      {
        $group: {
          _id: { $dateToString: { format: mode === 'day' ? '%Y-%m-%d' : '%Y-%m', date: '$createdAt', timezone: TZ } },
          revenue: { $sum: AMOUNT },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const revenueTrend = mode === 'day' ? fillDaily(trendRows, startDate, days) : fillMonthly(trendRows, range);

    // ---------- TOP ROUTES ----------
    const topRoutes = await Booking.aggregate([
      { $match: paid },
      { $group: { _id: '$route', bookings: { $sum: 1 }, revenue: { $sum: AMOUNT } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'routes', localField: '_id', foreignField: '_id', as: 'routeInfo' } },
      { $unwind: { path: '$routeInfo', preserveNullAndEmptyArrays: true } },
      { $project: { from: '$routeInfo.from', to: '$routeInfo.to', bookings: 1, revenue: 1 } },
    ]);

    // ---------- TOP BUSES ----------
    const topBuses = await Booking.aggregate([
      { $match: paid },
      { $group: { _id: '$bus', bookings: { $sum: 1 }, revenue: { $sum: AMOUNT } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'buses', localField: '_id', foreignField: '_id', as: 'busInfo' } },
      { $unwind: { path: '$busInfo', preserveNullAndEmptyArrays: true } },
      { $project: { busName: '$busInfo.busName', busNumber: '$busInfo.busNumber', bookings: 1, revenue: 1 } },
    ]);

    // ---------- BREAKDOWNS ----------
    const [statusBreakdown, paymentBreakdown] = await Promise.all([
      Booking.aggregate([{ $match: inRange }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Booking.aggregate([{ $match: inRange }, { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      range,
      summary: { totalUsers, totalBookings, totalBuses, totalRoutes, totalRevenue, cancellationRate },
      revenueTrend,
      topRoutes,
      topBuses,
      statusBreakdown,
      paymentBreakdown,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* Excel cell sanitizer: values starting with = + - @ are neutralised so Excel
   cannot run a name like "=HYPERLINK(...)" as a formula when the sheet opens. */
const xlText = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return s;
};

/**
 * GET /api/admin/analytics/export?range=30d
 * Returns a real .xlsx workbook (binary), matching the "Export Excel" button
 * and the .xlsx filename/Content-Type the frontend expects.
 * Requires the 'xlsx' package: npm install xlsx
 */
exports.exportAnalytics = async (req, res) => {
  try {
    const { range, startDate } = resolveRange(req.query.range);

    const bookings = await Booking.find({ createdAt: { $gte: startDate } })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('route', 'from to')
      .populate('bus', 'busName busNumber')
      .lean();

    const rows = bookings.map((b) => {
      const u = b.user || {};
      const r = b.route || {};
      const bus = b.bus || {};
      return {
        'Booking ID':  xlText(b.bookingId || b.pnr || b._id),
        'User':        xlText(u.name),
        'Email':       xlText(u.email),
        'Route':       xlText(`${r.from || ''} → ${r.to || ''}`),
        'Bus':         xlText(`${bus.busName || ''} (${bus.busNumber || ''})`),
        'Travel Date': b.travelDate ? new Date(b.travelDate).toISOString().split('T')[0] : '',
        'Amount':      Number(b.finalAmount ?? b.totalAmount ?? 0),
        'Status':      xlText(b.status),
        'Payment':     xlText(b.paymentStatus),
        'Created At':  b.createdAt ? new Date(b.createdAt).toISOString() : '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 14 }, { wch: 18 }, { wch: 24 }, { wch: 22 }, { wch: 24 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${range}-${Date.now()}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error('Analytics export error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};