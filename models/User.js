const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    preferences: [{ type: String }],
  },
  bookings: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
    bookingDate: Date,
    status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'pending' },
    participants: Number,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);