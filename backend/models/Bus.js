const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber:  { type: String, required: true },
  type:        { type: String, enum: ['window','aisle','middle'], default: 'aisle' },
  deck:        { type: String, enum: ['lower','upper'], default: 'lower' },
  seatType:    { type: String, enum: ['seater','sleeper'], default: 'seater' },
  genderLock:  { type: String, enum: ['none','male','female'], default: 'none' },
  isAvailable: { type: Boolean, default: true },
  price:       { type: Number, required: true }
});

const busSchema = new mongoose.Schema({
  busNumber:    { type: String, required: true, unique: true },
  busName:      { type: String, required: true },
  operator:     { type: String, required: true },
  busType:      { type: String, enum: ['AC','Non-AC','Sleeper','Semi-Sleeper','Luxury','Volvo'], required: true },
  totalSeats:   { type: Number, required: true },
  seats:        [seatSchema],
  amenities:    [String],
  images:       [String],
  rating:       { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  features: {
    wifi:     { type: Boolean, default: false },
    ac:       { type: Boolean, default: false },
    charging: { type: Boolean, default: false },
    gps:      { type: Boolean, default: false },
    ccCamera: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);