const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  phone:      { type: String, required: true },
  password:   { type: String, required: true, minlength: 6, select: false },
  role:       { type: String, enum: ['user','admin','operator'], default: 'user' },
  avatar:     { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isBlocked:  { type: Boolean, default: false },
  wallet:     { type: Number, default: 0 },
  otp:        String,
  otpExpire:  Date,
  bookings:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await require('bcryptjs').hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(entered) {
  return await require('bcryptjs').compare(entered, this.password);
};
userSchema.methods.getSignedJwtToken = function() {
  return require('jsonwebtoken').sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};
module.exports = mongoose.model('User', userSchema);