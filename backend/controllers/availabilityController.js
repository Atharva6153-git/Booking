const Availability = require('../models/Availability');
const Service = require('../models/Service');

exports.createAvailability = async (req, res) => {
  try {
    const { serviceId, date, slots } = req.body;

    if (!serviceId || !date || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: 'serviceId, date and a non-empty slots array are required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this service' });
    }

    const availability = await Availability.create({
      provider: req.user.id,
      service: serviceId,
      date,
      slots: slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
    });

    return res.status(201).json({ message: 'Availability created', availability });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Availability for this service and date already exists' });
    }
    console.error('Create availability error:', err);
    return res.status(500).json({ message: 'Server error while creating availability' });
  }
};

exports.getAvailabilityForService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    const filter = { service: serviceId };
    if (date) filter.date = date;

    const availability = await Availability.find(filter).sort({ date: 1 });

    return res.status(200).json({ availability });
  } catch (err) {
    console.error('Get availability error:', err);
    return res.status(500).json({ message: 'Server error while fetching availability' });
  }
};

exports.getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ provider: req.user.id }).sort({ date: 1 });
    return res.status(200).json({ availability });
  } catch (err) {
    console.error('Get my availability error:', err);
    return res.status(500).json({ message: 'Server error while fetching your availability' });
  }
};

exports.removeSlot = async (req, res) => {
  try {
    const { id, slotId } = req.params;

    const availability = await Availability.findById(id);
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    if (availability.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const slot = availability.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    if (slot.isBooked) {
      return res.status(409).json({ message: 'Cannot remove a slot that is already booked' });
    }

    slot.deleteOne();
    await availability.save();

    return res.status(200).json({ message: 'Slot removed', availability });
  } catch (err) {
    console.error('Remove slot error:', err);
    return res.status(500).json({ message: 'Server error while removing slot' });
  }
};