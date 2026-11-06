const express = require('express');
const router = express.Router();
const {
  getAvailableTables,
  createBooking,
  getMyBookings,
  cancelBooking,
  verifyCheckIn,
  completeDiningVisit,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/available-tables', getAvailableTables);
router.post('/', protect, authorize('customer'), createBooking);
router.get('/my-bookings', protect, authorize('customer'), getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Restaurant Owner Check-in and Completion routes
router.post('/verify-checkin', protect, authorize('restaurant_owner'), verifyCheckIn);
router.post('/:id/complete', protect, authorize('restaurant_owner'), completeDiningVisit);

module.exports = router;

