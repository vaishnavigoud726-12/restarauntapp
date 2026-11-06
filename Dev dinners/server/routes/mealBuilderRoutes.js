const express = require('express');
const router = express.Router();
const {
  calculateCustomMeal,
  getBudgetMealRecommendations,
} = require('../controllers/mealBuilderController');

router.post('/calculate', calculateCustomMeal);
router.get('/budget-recommendations/:restaurantId', getBudgetMealRecommendations);

module.exports = router;

