const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    durationMinutes: { type: Number, required: true, default: 60 },
    area: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    avgRating: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);