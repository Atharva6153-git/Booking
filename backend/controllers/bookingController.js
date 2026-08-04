const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const calculateDynamicPrice = require('../utils/calculateDynamicPrice');

exports.createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { availabilityId, slotId, isUrgent } = req.body;

    if (!availabilityId || !slotId) {
      return res.status(400).json({ message: 'availabilityId and slotId are required' });
    }

    const updatedAvailability = await Availability.findOneAndUpdate(
      { _id: availabilityId, 'slots._id': slotId, 'slots.isBooked': false },
      { $set: { 'slots.$.isBooked': true } },
      { new: true }
    );

    if (!updatedAvailability) {
      return res.status(409).json({ message: 'Slot is no longer available' });
    }

    const claimedSlot = updatedAvailability.slots.id(slotId);
    const service = await Service.findById(updatedAvailability.service);

    if (!service) {
      await Availability.updateOne(
        { _id: availabilityId, 'slots._id': slotId },
        { $set: { 'slots.$.isBooked': false } }
      );
      return res.status(404).json({ message: 'Service not found' });
    }

    const { finalPrice } = calculateDynamicPrice(
      service.price,
      updatedAvailability.date,
      claimedSlot.startTime
    );

    const booking = await Booking.create({
      customer: customerId,
      provider: updatedAvailability.provider,
      service: service._id,
      availability: updatedAvailability._id,
      slotId: claimedSlot._id,
      date: updatedAvailability.date,
      startTime: claimedSlot.startTime,
      endTime: claimedSlot.endTime,
      finalPrice,
      isUrgent: !!isUrgent,
      status: 'pending',
    });

    claimedSlot.bookingId = booking._id;
    await updatedAvailability.save();

    await Service.findByIdAndUpdate(service._id, { $inc: { totalBookings: 1 } });

    const io = req.app.get('io');

    // Tell the provider they have a new booking
    io.to(updatedAvailability.provider.toString()).emit('newBooking', {
      bookingId: booking._id,
    });

    // Tell everyone watching this service's availability that a slot was taken
    io.emit('availabilityUpdated', { serviceId: service._id.toString() });

    return res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ message: 'Server error while creating booking' });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('service', 'title category price')
      .populate('provider', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (err) {
    console.error('Get my bookings error:', err);
    return res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user.id })
      .populate('service', 'title category price')
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (err) {
    console.error('Get provider bookings error:', err);
    return res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['confirmed', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (status === 'cancelled') {
      await Availability.updateOne(
        { _id: booking.availability, 'slots._id': booking.slotId },
        { $set: { 'slots.$.isBooked': false, 'slots.$.bookingId': null } }
      );
      // Slot freed — notify anyone watching this service's availability
      const io = req.app.get('io');
      io.emit('availabilityUpdated', { serviceId: booking.service.toString() });
    }

    booking.status = status;
    await booking.save();

    const io = req.app.get('io');

    // Notify the customer their booking status changed
    io.to(booking.customer.toString()).emit('bookingStatusUpdate', {
      bookingId: booking._id,
      status: booking.status,
    });

    // Also notify the provider's own bookings page
    io.to(booking.provider.toString()).emit('providerBookingUpdated', {
      bookingId: booking._id,
      status: booking.status,
    });

    return res.status(200).json({ message: 'Booking status updated', booking });
  } catch (err) {
    console.error('Update booking status error:', err);
    return res.status(500).json({ message: 'Server error while updating booking' });
  }
};
