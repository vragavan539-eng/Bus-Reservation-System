const asyncHandler = require('express-async-handler');
const XLSX = require('xlsx');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

/* ============================================================
   DASHBOARD
============================================================ */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBookings, totalBuses, totalRoutes] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Booking.countDocuments(),
    Bus.countDocuments({ isActive: true }),
    Route.countDocuments({ isActive: true })
  ]);

  const revenue = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$finalAmount' } } }
  ]);

  const recentBookings = await Booking.find()
    .populate('user route')
    .sort({ createdAt: -1 })
    .limit(10);

  const monthlyRevenue = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$finalAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalBookings,
      totalBuses,
      totalRoutes,
      totalRevenue: revenue[0]?.total || 0
    },
    recentBookings,
    monthlyRevenue
  });
});

/* ============================================================
   USERS
============================================================ */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = search
    ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
    : {};
  const users = await User.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });
  const total = await User.countDocuments(filter);
  res.json({ success: true, users, total });
});

exports.blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  );
  res.json({ success: true, user });
});

exports.unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  );
  res.json({ success: true, user });
});

/* ============================================================
   BOOKINGS CRUD  (new — was missing, crashing adminRoutes.js)
============================================================ */

/**
 * GET /api/admin/bookings?page=1&limit=20&status=confirmed
 */
exports.getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};

  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('route', 'from to')
    .populate('bus', 'busName busNumber')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(filter);
  res.json({ success: true, bookings, total });
});

/**
 * POST /api/admin/bookings
 * Body: { routeId, busId, travelDate, userEmail, passengers, finalAmount, status, paymentStatus }
 * Looks the user up by email — the user must already have an
 * account (admin is booking on behalf of an existing customer,
 * same as a counter-staff flow). Adjust if you'd rather
 * auto-create a user record when the email isn't found.
 */
exports.createBooking = asyncHandler(async (req, res) => {
  const { routeId, busId, travelDate, userEmail, passengers, finalAmount, status, paymentStatus } = req.body;

  if (!routeId || !travelDate || !userEmail || !passengers?.length) {
    res.status(400);
    throw new Error('routeId, travelDate, userEmail and passengers are required');
  }

  const user = await User.findOne({ email: userEmail.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error(`No user found with email ${userEmail}`);
  }

  const route = await Route.findById(routeId);
  if (!route) {
    res.status(404);
    throw new Error('Route not found');
  }

  const booking = await Booking.create({
    user: user._id,
    route: routeId,
    bus: busId || route.bus,
    travelDate,
    passengers,
    finalAmount: finalAmount || (route.basePrice || 0) * passengers.length,
    status: status || 'confirmed',
    paymentStatus: paymentStatus || 'paid',
    boardingPoint: route.from,
    droppingPoint: route.to,
  });

  const populated = await Booking.findById(booking._id)
    .populate('user', 'name email')
    .populate('route', 'from to')
    .populate('bus', 'busName busNumber');

  res.status(201).json({ success: true, booking: populated });
});

/**
 * PUT /api/admin/bookings/:id
 * Body: { travelDate?, finalAmount?, status?, paymentStatus? }
 */
exports.updateBooking = asyncHandler(async (req, res) => {
  const { travelDate, finalAmount, status, paymentStatus } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (travelDate !== undefined) booking.travelDate = travelDate;
  if (finalAmount !== undefined) booking.finalAmount = finalAmount;
  if (status !== undefined) booking.status = status;
  if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;

  await booking.save();

  const populated = await Booking.findById(booking._id)
    .populate('user', 'name email')
    .populate('route', 'from to')
    .populate('bus', 'busName busNumber');

  res.json({ success: true, booking: populated });
});

/**
 * DELETE /api/admin/bookings/:id
 */
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  await booking.deleteOne();
  res.json({ success: true, message: 'Booking deleted' });
});

/* ============================================================
   ANALYTICS & REPORTS
============================================================ */

/**
 * GET /api/admin/analytics?range=30d
 * range: 7d | 30d | 90d | 1y | all
 */
exports.getAnalytics = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;

  // ---------- Range → start date ----------
  const now = new Date();
  let startDate = new Date(0); // all time
  if (range === '7d')  startDate = new Date(now.getTime() - 7 * 86400000);
  if (range === '30d') startDate = new Date(now.getTime() - 30 * 86400000);
  if (range === '90d') startDate = new Date(now.getTime() - 90 * 86400000);
  if (range === '1y')  startDate = new Date(now.getTime() - 365 * 86400000);

  // ---------- SUMMARY CARDS ----------
  const [totalUsers, totalBookings, totalBuses, totalRoutes] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Booking.countDocuments({ createdAt: { $gte: startDate } }),
    Bus.countDocuments({ isActive: true }),
    Route.countDocuments({ isActive: true })
  ]);

  const revenueAgg = await Booking.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
    { $group: { _id: null, total: { $sum: '$finalAmount' } } }
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  const cancelledCount = await Booking.countDocuments({
    status: 'cancelled',
    createdAt: { $gte: startDate }
  });
  const cancellationRate = totalBookings
    ? Number(((cancelledCount / totalBookings) * 100).toFixed(1))
    : 0;

  // ---------- REVENUE TREND ----------
  const trendDays = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 30 : 30;

  const rawTrend = await Booking.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$finalAmount' },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill missing dates with zeros
  const trendMap = new Map(rawTrend.map(r => [r._id, r]));
  const revenueTrend = [];
  const daysToFill = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : range === '1y' ? 365 : 30;
  const maxPoints = range === '1y' ? 30 : daysToFill;
  const step = range === '1y' ? 12 : 1;

  for (let i = daysToFill - 1; i >= 0; i -= step) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    const found = trendMap.get(key);
    revenueTrend.push({
      date: key,
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: found?.revenue || 0,
      bookings: found?.bookings || 0
    });
    if (revenueTrend.length >= maxPoints) break;
  }

  // ---------- TOP ROUTES ----------
  const topRoutes = await Booking.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$route',
        bookings: { $sum: 1 },
        revenue: { $sum: '$finalAmount' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'routes',
        localField: '_id',
        foreignField: '_id',
        as: 'routeInfo'
      }
    },
    { $unwind: { path: '$routeInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        from: '$routeInfo.from',
        to: '$routeInfo.to',
        bookings: 1,
        revenue: 1
      }
    }
  ]);

  // ---------- TOP BUSES ----------
  const topBuses = await Booking.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$bus',
        bookings: { $sum: 1 },
        revenue: { $sum: '$finalAmount' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'buses',
        localField: '_id',
        foreignField: '_id',
        as: 'busInfo'
      }
    },
    { $unwind: { path: '$busInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        busName: '$busInfo.busName',
        busNumber: '$busInfo.busNumber',
        bookings: 1,
        revenue: 1
      }
    }
  ]);

  // ---------- STATUS BREAKDOWN ----------
  const statusBreakdown = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // ---------- PAYMENT BREAKDOWN ----------
  const paymentBreakdown = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    range,
    summary: {
      totalUsers,
      totalBookings,
      totalBuses,
      totalRoutes,
      totalRevenue,
      cancellationRate
    },
    revenueTrend,
    topRoutes,
    topBuses,
    statusBreakdown,
    paymentBreakdown
  });
});

/**
 * GET /api/admin/analytics/export?range=30d
 * Returns .xlsx file directly
 */
exports.exportAnalytics = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;

  const now = new Date();
  let startDate = new Date(0);
  if (range === '7d')  startDate = new Date(now.getTime() - 7 * 86400000);
  if (range === '30d') startDate = new Date(now.getTime() - 30 * 86400000);
  if (range === '90d') startDate = new Date(now.getTime() - 90 * 86400000);
  if (range === '1y')  startDate = new Date(now.getTime() - 365 * 86400000);

  const bookings = await Booking.find({ createdAt: { $gte: startDate } })
    .populate('user', 'name email phone')
    .populate('route', 'from to')
    .populate('bus', 'busName busNumber')
    .sort({ createdAt: -1 })
    .lean();

  // Build rows for Excel
  const rows = bookings.map((b) => ({
    'Booking ID':  b.bookingId || '',
    'User Name':   b.user?.name || '',
    'Email':       b.user?.email || '',
    'Phone':       b.user?.phone || '',
    'From':        b.route?.from || '',
    'To':          b.route?.to || '',
    'Bus':         b.bus?.busName || '',
    'Bus Number':  b.bus?.busNumber || '',
    'Travel Date': b.travelDate
      ? new Date(b.travelDate).toLocaleDateString('en-IN')
      : '',
    'Passengers':  b.passengers?.length || 0,
    'Amount (₹)':  b.finalAmount || 0,
    'Status':      b.status || '',
    'Payment':     b.paymentStatus || '',
    'Booked On':   b.createdAt
      ? new Date(b.createdAt).toLocaleString('en-IN')
      : ''
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const headers = Object.keys(rows[0] || { 'No Data': '' });
  ws['!cols'] = headers.map((h) => {
    let max = h.length;
    rows.forEach((r) => {
      const len = String(r[h] || '').length;
      if (len > max) max = len;
    });
    return { wch: Math.min(max + 3, 40) };
  });

  // Styling (header row bold)
  const rangeAddr = XLSX.utils.decode_range(ws['!ref']);
  for (let c = rangeAddr.s.c; c <= rangeAddr.e.c; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[cellAddr]) {
      ws[cellAddr].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'F97316' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

  // Generate .xlsx buffer
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="analytics-${range}-${Date.now()}.xlsx"`
  );
  res.send(buf);
});