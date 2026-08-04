const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: sign a JWT that carries the user's id, role, and current sessionId
const generateToken = (user, sessionId) => {
  return jwt.sign(
    { id: user._id, role: user.role, sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper: set the JWT inside an httpOnly cookie
// httpOnly = JavaScript on the frontend CANNOT read this cookie.
// This is what protects the token from XSS-based theft (unlike localStorage).
// In production we use sameSite:'none' so the cookie works cross-domain
// (frontend on Vercel, backend on Render). Must pair with secure:true.
const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,           // HTTPS only in prod
    sameSite: isProd ? 'none' : 'strict', // 'none' required for cross-domain in prod
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @route POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
    });

    return res.status(201).json({
      message: 'Signup successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a brand-new session ID on every login.
    // Saving this overwrites whatever session ID was there before,
    // which is exactly what invalidates any previously issued token.
    const newSessionId = crypto.randomUUID();
    user.currentSessionId = newSessionId;
    await user.save();

    const token = generateToken(user, newSessionId);
    setTokenCookie(res, token);

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    // Clear the session id in DB too, so the cookie (if somehow reused) is dead
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, { currentSessionId: null });
    }
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};
