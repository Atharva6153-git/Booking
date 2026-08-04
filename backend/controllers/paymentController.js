const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this booking' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(409).json({ message: 'Booking already paid' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(booking.finalPrice * 100),
      currency: 'INR',
      receipt: `booking_${booking._id}`,
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ message: 'Server error while creating payment order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.paymentStatus = 'paid';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.status = 'confirmed';
    await booking.save();

    // Notify both customer and provider that payment succeeded
    const io = req.app.get('io');
    io.to(booking.customer.toString()).emit('paymentVerified', { bookingId: booking._id });
    io.to(booking.provider.toString()).emit('paymentVerified', { bookingId: booking._id });

    return res.status(200).json({ message: 'Payment verified', booking });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ message: 'Server error while verifying payment' });
  }
};