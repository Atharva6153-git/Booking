const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// createBooking is customer-only (providers don't book their own services)
router.post('/', protect, authorize('customer'), createBooking);

// Removed role restriction from GET routes — the controller already filters
// by req.user.id so a provider can't see a customer's bookings and vice versa.
// The 403 was caused by role mismatch when a user navigated to the wrong page.
router.get('/my', protect, getMyBookings);
router.get('/provider', protect, getProviderBookings);

router.patch('/:id/status', protect, authorize('provider'), updateBookingStatus);

module.exports = router;