const express = require('express');
const router = express.Router();
const { createReview, getReviewsForService } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createReview);
router.get('/service/:serviceId', getReviewsForService);

module.exports = router;