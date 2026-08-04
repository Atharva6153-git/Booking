const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);

// Returns full user profile — used by frontend to rehydrate session on page load/refresh
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
