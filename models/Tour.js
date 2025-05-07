const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['active', 'passive', 'camping', 'excursion', 'health'], required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true },
  location: {
    region: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  accommodation: {
    type: { type: String, enum: ['hotel', 'sanatorium', 'camping', 'retreat', 'none'], required: true },
    name: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5 },
    amenities: [{ type: String }],
  },
  activities: [{
    name: { type: String, required: true },
    description: String,
    durationHours: Number,
    equipmentRequired: Boolean,
  }],
  excursions: [{
    name: { type: String, required: true },
    description: String,
    durationHours: Number,
    price: Number,
  }],
  includedServices: [{ type: String }],
  season: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  minGroupSize: { type: Number, required: true },
  maxGroupSize: { type: Number, required: true },
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  images: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

tourSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  // Пересчёт рейтинга и количества отзывов
  if (this.reviews && this.reviews.length > 0) {
    const avgRating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    this.rating = Math.round(avgRating * 10) / 10; // Округление до 1 знака
    this.reviewsCount = this.reviews.length;
  } else {
    this.rating = 0;
    this.reviewsCount = 0;
  }
  next();
});

tourSchema.index({ 'reviews.userId': 1 }); // Для проверки уникальности отзывов

module.exports = mongoose.model('Tour', tourSchema);