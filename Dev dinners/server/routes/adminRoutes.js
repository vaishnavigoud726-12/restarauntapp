const express = require('express');
const router = express.Router();
const {
  getPlatformMetrics,
  getCustomersAdmin,
  updateCustomerStatus,
  getRestaurantsAdmin,
  updateRestaurantStatus,
  getAllFeedbackAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes protected & restricted to super_admin
router.use(protect, authorize('super_admin'));

router.get('/metrics', getPlatformMetrics);
router.get('/customers', getCustomersAdmin);
router.put('/customers/:id/status', updateCustomerStatus);
router.get('/restaurants', getRestaurantsAdmin);
router.put('/restaurants/:id/status', updateRestaurantStatus);
router.get('/feedback', getAllFeedbackAdmin);

module.exports = router;

