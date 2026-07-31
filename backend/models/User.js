const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // stored as bcrypt hash, never plain text
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer',
    },
    // This is the core of session invalidation.
    // A new random value is generated every time the user logs in.
    // The JWT carries this same value inside its payload.
    // On every protected request, middleware compares JWT's value
    // with this field in the DB. Mismatch = old/stolen token = rejected.
    currentSessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
