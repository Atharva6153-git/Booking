require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Known allowed origins — localhost for dev, deployed URLs for production.
// FRONTEND_URL env var is also supported as an escape hatch for other deployments.
const allowedOrigins = [
  'http://localhost:3000',
  'https://booking-apexgg.vercel.app',   // production Vercel frontend
  process.env.FRONTEND_URL,              // optional override via env var
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman / server-to-server (no Origin header)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
};

const io = new Server(server, { cors: corsOptions });

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(userId));
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => res.send('ServiceHub API running'));

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/bookings',     require('./routes/bookingRoutes'));
app.use('/api/services',     require('./routes/serviceRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/payments',     require('./routes/paymentRoutes'));
app.use('/api/reviews',      require('./routes/reviewRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
