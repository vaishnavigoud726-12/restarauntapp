const express = require('express');
const router = express.Router();
const {
  joinWaitlist,
  getMyWaitlistStatus,
  getRestaurantWaitlist,
  notifyWaitlistCustomer,
} = require('../controllers/waitlistController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/join', protect, authorize('customer'), joinWaitlist);
router.get('/my-status', protect, authorize('customer'), getMyWaitlistStatus);
router.get('/restaurant-queue', protect, authorize('restaurant_owner'), getRestaurantWaitlist);
router.put('/:id/notify', protect, authorize('restaurant_owner'), notifyWaitlistCustomer);

module.exports = router;

