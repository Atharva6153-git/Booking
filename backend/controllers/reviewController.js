const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'bookingId and rating are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(409).json({ message: 'This booking has already been reviewed' });
    }

    const review = await Review.create({
      booking: bookingId,
      customer: req.user.id,
      provider: booking.provider,
      service: booking.service,
      rating,
      comment,
    });

    const allReviews = await Review.find({ service: booking.service });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Service.findByIdAndUpdate(booking.service, { avgRating: avg });

    return res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    console.error('Create review error:', err);
    return res.status(500).json({ message: 'Server error while submitting review' });
  }
};

exports.getReviewsForService = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    return res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};