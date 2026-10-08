const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/buses',      require('./routes/busRoutes'));
app.use('/api/routes',     require('./routes/routeRoutes'));
app.use('/api/bookings',   require('./routes/bookingRoutes'));
app.use('/api/payments',   require('./routes/paymentRoutes'));
app.use('/api/reviews',    require('./routes/reviewRoutes'));
app.use('/api/chat',       require('./routes/chatRoutes'));
app.use('/api/passengers', require('./routes/savedPassengerRoutes'));

// ✅ Analytics MUST be mounted BEFORE '/api/admin'.
// Express matches in order: if '/api/admin' came first, adminRoutes would receive
// '/api/admin/analytics' and (e.g. through a '/:id' route) answer it itself,
// so this router would never run. File name on disk: admin.analytics.routes.js
app.use('/api/admin/analytics', require('./routes/admin.analytics.routes'));
app.use('/api/admin',           require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'BusGo API Running 🚌' }));

// 404 handler — catches requests to routes that don't exist
app.use((req, res, next) => {
  res.status(404);
  const err = new Error(`Route not found - ${req.originalUrl}`);
  next(err);
});

// Global error handler
// Controllers call res.status(401) / res.status(400) etc. *before* throwing, so by the time the
// error arrives here res.statusCode is already correct. Respect it instead of always using 500.
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err);

  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚌 Server on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => {
    console.error('❌ DB Error:', err);
    process.exit(1);
  });