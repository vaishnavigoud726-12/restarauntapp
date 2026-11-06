const express = require('express');
const router = express.Router();
const {
  getNearbyRestaurants,
  getAllRestaurants,
  getRestaurantById,
  compareRestaurants,
} = require('../controllers/restaurantController');

router.get('/nearby', getNearbyRestaurants);
router.get('/', getAllRestaurants);
router.post('/compare', compareRestaurants);
router.get('/:id', getRestaurantById);

module.exports = router;

