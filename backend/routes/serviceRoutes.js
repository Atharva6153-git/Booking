const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  updateService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// public browse
router.get('/', getServices);

// provider-only routes (must come before /:id so 'provider' isn't parsed as an id)
router.get('/provider/my', protect, authorize('provider'), getMyServices);
router.post('/', protect, authorize('provider'), createService);
router.patch('/:id', protect, authorize('provider'), updateService);

// public single service view (keep after specific routes)
router.get('/:id', getServiceById);

module.exports = router;