require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: ['http://localhost:3000', 'https://booking-apexgg.vercel.app'], credentials: true },
});

// make io accessible inside controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  // each user joins a room named after their own userId,
  // so we can emit events to just them (e.g. "your booking got accepted")
  socket.on('join', (userId) => {
    socket.join(userId);
  });
});

app.use(cors({ origin: ['http://localhost:3000', 'https://booking-apexgg.vercel.app'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('ServiceHub API running');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));