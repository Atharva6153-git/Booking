const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT from the httpOnly cookie AND checks that its
// sessionId still matches the one stored in the DB.
// If someone logs in again elsewhere, the DB's currentSessionId changes,
// so this old token's sessionId will no longer match -> auto rejected.
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (user.currentSessionId !== decoded.sessionId) {
      // This is the actual session-invalidation check.
      // Someone logged in elsewhere (or with stolen creds) after this token was issued.
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role-based access guard, e.g. authorize('admin') or authorize('admin', 'provider')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for this role' });
    }
    next();
  };
};
