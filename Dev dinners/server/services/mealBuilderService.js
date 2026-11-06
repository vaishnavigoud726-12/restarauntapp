/**
 * Meal Builder Service
 *
 * Implements:
 * 1. Combinatorial 3-course meal recommendation under a given budget (Starters + Main Course + Desserts/Beverages).
 * 2. Backend validation of chosen dishes, original price sum, and savings calculation.
 */

/**
 * Generates optimal 3-course meal combinations matching a target budget constraint
 * using a bounded combinatorial search.
 */
function findOptimalMealCombinations(menuItems, maxBudget, dietaryPreference = 'All') {
  // Filter available items and apply dietary constraint if specified
  let items = menuItems.filter((i) => i.isAvailable !== false);
  if (dietaryPreference && dietaryPreference !== 'All') {
    items = items.filter((i) => i.dietaryType === dietaryPreference || (dietaryPreference === 'Veg' && i.dietaryType === 'Vegan'));
  }

  // Partition into courses
  const starters = items.filter((i) => i.category === 'Starters');
  const mains = items.filter((i) => i.category === 'Main Course' || i.category === 'Breads & Rice');
  const desserts = items.filter((i) => i.category === 'Desserts' || i.category === 'Beverages');

  const combinations = [];

  // Generate 3-course triplets (1 Starter + 1 Main + 1 Dessert/Beverage)
  for (const s of starters) {
    for (const m of mains) {
      for (const d of desserts) {
        const total = s.price + m.price + d.price;
        if (total <= maxBudget) {
          // Combined popularity score
          const combinedScore = (s.popularityScore || 50) + (m.popularityScore || 50) + (d.popularityScore || 50);
          // Value efficiency: closer to budget while maximizing dish quality
          const budgetUtilization = total / maxBudget;

          combinations.push({
            items: [s, m, d],
            totalPrice: total,
            budgetRemaining: maxBudget - total,
            popularityScore: combinedScore,
            efficiencyScore: combinedScore * budgetUtilization,
          });
        }
      }
    }
  }

  // Sort by efficiency (highest popularity and best budget utilization)
  combinations.sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  // Return top best combo and up to 2 alternatives
  return combinations.slice(0, 3);
}

/**
 * Validates selected items from the backend, ensuring accurate price computation
 */
function validateAndCalculateMeal(selectedDishes, appliedDiscount = null) {
  if (!selectedDishes || selectedDishes.length === 0) {
    throw new Error('Please select at least 1 menu item.');
  }

  if (selectedDishes.length > 3) {
    throw new Error('You can select a maximum of 3 items in the Smart Meal Builder.');
  }

  // Calculate original sum using authoritative dish prices
  const originalTotal = selectedDishes.reduce((acc, dish) => acc + (dish.price || 0), 0);

  let discountSavings = 0;
  let finalPayable = originalTotal;

  if (appliedDiscount) {
    if (originalTotal >= (appliedDiscount.minBillAmount || 0)) {
      if (appliedDiscount.discountType === 'percentage') {
        const calculated = (originalTotal * appliedDiscount.discountValue) / 100;
        discountSavings = Math.min(calculated, appliedDiscount.maxDiscountAmount || 500);
      } else {
        discountSavings = Math.min(appliedDiscount.discountValue, originalTotal);
      }
      finalPayable = Math.max(0, originalTotal - discountSavings);
    }
  }

  return {
    itemsCount: selectedDishes.length,
    originalTotal: Math.round(originalTotal),
    discountSavings: Math.round(discountSavings),
    finalPayable: Math.round(finalPayable),
    appliedDiscount: appliedDiscount ? appliedDiscount.code : null,
  };
}

module.exports = {
  findOptimalMealCombinations,
  validateAndCalculateMeal,
};

