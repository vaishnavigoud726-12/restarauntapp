const Restaurant = require('../models/Restaurant');
const Discount = require('../models/Discount');
const { evaluateRestaurantSuitability } = require('../services/recommendationService');

/**
 * @desc    "Help Me Choose" Dining Decision Assistant
 * @route   POST /api/recommendations/help-me-choose
 * @access  Public / Optional Auth
 */
exports.helpMeChoose = async (req, res, next) => {
  try {
    const {
      budget = 500, // Budget per person in ₹
      preferredCuisines = [],
      maxDistanceKm = 15,
      minRating = 3.5,
      dietaryPreference = 'All',
      userLat = 17.4486,
      userLng = 78.3846,
    } = req.body;

    const restaurants = await Restaurant.find({
      approvalStatus: 'approved',
      averageRating: { $gte: parseFloat(minRating) },
    });

    const activeDiscounts = await Discount.find({ isActive: true });

    const scoredResults = [];

    for (const restaurant of restaurants) {
      const evaluation = evaluateRestaurantSuitability(
        restaurant,
        {
          userLat: parseFloat(userLat),
          userLng: parseFloat(userLng),
          maxDistanceKm: parseFloat(maxDistanceKm),
          targetBudget: parseFloat(budget),
          preferredCuisines,
          dietaryPreference,
        },
        activeDiscounts
      );

      if (evaluation) {
        scoredResults.push(evaluation);
      }
    }

    // Rank by overall suitability score (highest first)
    scoredResults.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    res.status(200).json({
      success: true,
      criteriaApplied: {
        targetBudgetPerPerson: budget,
        preferredCuisines,
        maxDistanceKm,
        minRating,
        dietaryPreference,
      },
      count: scoredResults.length,
      data: scoredResults.slice(0, 8), // Top 8 recommended matches
    });
  } catch (error) {
    next(error);
  }
};

