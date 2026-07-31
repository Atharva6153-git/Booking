const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, authorize('customer'), createOrder);
router.post('/verify', protect, authorize('customer'), verifyPayment);

module.exports = router;