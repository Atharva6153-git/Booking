const Service = require('../models/Service');

// @route POST /api/services
exports.createService = async (req, res) => {
  try {
    const { title, category, description, price, durationMinutes, area } = req.body;

    if (!title || !category || !price || !area) {
      return res.status(400).json({ message: 'title, category, price and area are required' });
    }

    const service = await Service.create({
      provider: req.user.id,
      title,
      category,
      description,
      price,
      durationMinutes,
      area,
    });

    return res.status(201).json({ message: 'Service created', service });
  } catch (err) {
    console.error('Create service error:', err);
    return res.status(500).json({ message: 'Server error while creating service' });
  }
};

// @route GET /api/services
exports.getServices = async (req, res) => {
  try {
    const { category, area, search, minPrice, maxPrice } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (area) filter.area = area;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(filter)
      .populate('provider', 'name')
      .sort({ avgRating: -1, createdAt: -1 });

    return res.status(200).json({ services });
  } catch (err) {
    console.error('Get services error:', err);
    return res.status(500).json({ message: 'Server error while fetching services' });
  }
};

// @route GET /api/services/:id
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    return res.status(200).json({ service });
  } catch (err) {
    console.error('Get service by id error:', err);
    return res.status(500).json({ message: 'Server error while fetching service' });
  }
};

// @route GET /api/services/provider/my
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ services });
  } catch (err) {
    console.error('Get my services error:', err);
    return res.status(500).json({ message: 'Server error while fetching your services' });
  }
};

// @route PATCH /api/services/:id
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this service' });
    }

    const allowedFields = ['title', 'category', 'description', 'price', 'durationMinutes', 'area', 'isActive'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    await service.save();
    return res.status(200).json({ message: 'Service updated', service });
  } catch (err) {
    console.error('Update service error:', err);
    return res.status(500).json({ message: 'Server error while updating service' });
  }
};