const MenuItem = require('../models/MenuItem');
const Discount = require('../models/Discount');
const {
  findOptimalMealCombinations,
  validateAndCalculateMeal,
} = require('../services/mealBuilderService');

/**
 * @desc    Validate and calculate a custom meal built by the customer
 * @route   POST /api/meal-builder/calculate
 * @access  Public
 */
exports.calculateCustomMeal = async (req, res, next) => {
  try {
    const { itemIds = [], discountCode } = req.body;

    if (!itemIds || itemIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Please select at least 1 menu item.' });
    }

    if (itemIds.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Smart Meal Builder allows selecting a maximum of 3 items.',
      });
    }

    // Query dishes from database to ensure authoritative prices
    const dishes = await MenuItem.find({ _id: { $in: itemIds } });

    if (dishes.length !== itemIds.length) {
      return res.status(404).json({ success: false, error: 'One or more selected dishes were not found.' });
    }

    let appliedDiscount = null;
    if (discountCode) {
      appliedDiscount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
      });
    }

    const calculation = validateAndCalculateMeal(dishes, appliedDiscount);

    res.status(200).json({
      success: true,
      data: {
        dishes: dishes.map((d) => ({
          _id: d._id,
          name: d.name,
          category: d.category,
          price: d.price,
          dietaryType: d.dietaryType,
        })),
        ...calculation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recommend optimal 3-course meal combinations under a target budget
 * @route   GET /api/meal-builder/budget-recommendations/:restaurantId
 * @access  Public
 */
exports.getBudgetMealRecommendations = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { budget = 500, dietaryPreference = 'All' } = req.query;

    const menuItems = await MenuItem.find({
      restaurantId,
      isAvailable: true,
    });

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No available menu items found for this restaurant.',
      });
    }

    const combos = findOptimalMealCombinations(
      menuItems,
      parseFloat(budget),
      dietaryPreference
    );

    res.status(200).json({
      success: true,
      budgetTarget: parseFloat(budget),
      dietaryFilter: dietaryPreference,
      combinationsCount: combos.length,
      data: combos,
    });
  } catch (error) {
    next(error);
  }
};

