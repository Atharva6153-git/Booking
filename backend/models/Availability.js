const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: String, required: true },
    slots: [timeSlotSchema],
  },
  { timestamps: true }
);

availabilitySchema.index({ provider: 1, service: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);