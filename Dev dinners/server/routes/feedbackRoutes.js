const express = require('express');
const router = express.Router();
const {
  submitVerifiedReview,
  getRestaurantReviews,
  ownerReplyToReview,
  moderateReview,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('customer'), submitVerifiedReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.post('/:id/reply', protect, authorize('restaurant_owner'), ownerReplyToReview);
router.put('/:id/moderate', protect, authorize('super_admin'), moderateReview);

module.exports = router;

