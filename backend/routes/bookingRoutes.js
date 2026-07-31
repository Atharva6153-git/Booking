const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, authorize('customer'), getMyBookings);
router.get('/provider', protect, authorize('provider'), getProviderBookings);
router.patch('/:id/status', protect, authorize('provider'), updateBookingStatus);

module.exports = router;