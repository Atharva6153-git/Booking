const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);

// Quick test route to confirm the middleware + session check works
router.get('/me', protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
