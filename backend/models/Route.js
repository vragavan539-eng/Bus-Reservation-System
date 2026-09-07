const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  city: String, arrivalTime: String, departureTime: String, distanceFromOrigin: Number
});

const routeSchema = new mongoose.Schema({
  from:          { type: String, required: true },
  to:            { type: String, required: true },
  bus:           { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  stops:         [stopSchema],
  departureTime: { type: String, required: true },
  arrivalTime:   { type: String, required: true },
  duration:      { type: String, required: true },
  distance:      { type: Number, required: true },
  basePrice:     { type: Number, required: true },
  availableDays: [{ type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }],
  isActive:      { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);