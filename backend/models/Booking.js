const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true }, age: { type: Number, required: true },
  gender: { type: String, enum: ['Male','Female','Other'], required: true },
  seatNumber: { type: String, required: true }
});

const bookingSchema = new mongoose.Schema({
  bookingId:     { type: String, unique: true },
  pnr:           String,
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  route:         { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  bus:           { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  travelDate:    { type: Date, required: true },
  passengers:    [passengerSchema],
  boardingPoint: String, droppingPoint: String,
  totalAmount:   { type: Number, required: true },
  discount:      { type: Number, default: 0 },
  finalAmount:   { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paymentMethod: String, paymentId: String,
  status:        { type: String, enum: ['confirmed','cancelled','completed','pending'], default: 'pending' },
  cancellationReason: String, refundAmount: { type: Number, default: 0 },
  refundStatus:  { type: String, enum: ['none','initiated','completed'], default: 'none' }
}, { timestamps: true });

bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BUS' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2,4).toUpperCase();
    this.pnr = 'PNR' + Math.random().toString(36).substr(2,8).toUpperCase();
  }
  next();
});
module.exports = mongoose.model('Booking', bookingSchema);