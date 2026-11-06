const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect Database
const connectDB = require('./config/db');
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'CraveWise - Smart Dine-In Discovery & Restaurant Intelligence',
    time: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/meal-builder', require('./routes/mealBuilderRoutes'));
app.use('/api/discounts', require('./routes/discountRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/waitlist', require('./routes/waitlistRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/group-dining', require('./routes/groupDiningRoutes'));
app.use('/api/passport', require('./routes/passportRoutes'));
app.use('/api/restaurant-portal', require('./routes/ownerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Centralized Error Handling Middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` CraveWise API Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Port: ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Unhandled Error] ${err.message}`);
});
