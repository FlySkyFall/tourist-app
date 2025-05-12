const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    region: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  category: { type: String, enum: ['historical', 'natural', 'cultural', 'other'], required: true },
  images: [String],
  website: { type: String },
});

module.exports = mongoose.model('Attraction', attractionSchema);