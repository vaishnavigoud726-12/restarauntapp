const express = require('express');
const router = express.Router();
const {
  getMyEligibleDiscounts,
  validateDiscountCode,
  getAllDiscountsAdmin,
  createDiscountRule,
  toggleDiscountStatus,
} = require('../controllers/discountController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Customer routes
router.get('/my-eligible-offers', protect, authorize('customer'), getMyEligibleDiscounts);
router.post('/validate', validateDiscountCode);

// Super admin routes
router.get('/admin/all', protect, authorize('super_admin'), getAllDiscountsAdmin);
router.post('/admin', protect, authorize('super_admin'), createDiscountRule);
router.delete('/admin/:id', protect, authorize('super_admin'), toggleDiscountStatus);

module.exports = router;

