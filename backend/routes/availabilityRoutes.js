const express = require('express');
const router = express.Router();
const {
  createAvailability,
  getAvailabilityForService,
  getMyAvailability,
  removeSlot,
} = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('provider'), createAvailability);
router.get('/my', protect, authorize('provider'), getMyAvailability);
router.get('/service/:serviceId', getAvailabilityForService);
router.delete('/:id/slot/:slotId', protect, authorize('provider'), removeSlot);

module.exports = router;