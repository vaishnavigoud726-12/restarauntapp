/**
 * Recommendation Service - "Help Me Choose" Dining Decision Assistant
 *
 * Implements a transparent, multi-criteria mathematical scoring model.
 * Does NOT claim pseudo-AI. The exact calculation is documented and exposed
 * to the student/evaluator and the end-user.
 *
 * Scoring Formula (Max 100 points):
 * Score = (W_distance * S_distance) +
 *         (W_budget * S_budget) +
 *         (W_cuisine * S_cuisine) +
 *         (W_rating * S_rating) +
 *         (W_offers * S_offers)
 *
 * Default Weights:
 * - Distance: 0.25 (Proximity convenience)
 * - Budget Fit: 0.25 (Price compatibility)
 * - Cuisine Match: 0.20 (User flavor preferences)
 * - Rating: 0.20 (Quality of food, service, ambience)
 * - Active Offers: 0.10 (Value-add discounts)
 */

/**
 * Calculates the Haversine distance in kilometers between two geo coordinates
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Calculates recommendation score for a restaurant
 */
function evaluateRestaurantSuitability(restaurant, criteria, activeDiscounts = []) {
  const {
    userLat,
    userLng,
    maxDistanceKm = 15,
    targetBudget = 600, // per person
    preferredCuisines = [],
    dietaryPreference = 'All',
  } = criteria;

  // 1. Calculate Distance
  const [restLng, restLat] = restaurant.location.coordinates;
  const distanceKm = calculateHaversineDistance(userLat, userLng, restLat, restLng);

  // If beyond max radius, score is 0
  if (distanceKm > maxDistanceKm) {
    return null;
  }

  const explanations = [];

  // --- Sub-score 1: Distance (0 to 100) ---
  // Closer is higher. If distance is 0 km -> 100. If distance == maxDistance -> 0.
  const distanceScore = Math.max(0, 100 * (1 - distanceKm / maxDistanceKm));
  if (distanceKm < 3) {
    explanations.push(`Very close to you (${distanceKm} km away)`);
  } else {
    explanations.push(`Located ${distanceKm} km from your chosen area`);
  }

  // --- Sub-score 2: Budget Fit (0 to 100) ---
  // Approximate per-person price is priceForTwo / 2
  const approxPerPerson = (restaurant.priceForTwo || 800) / 2;
  let budgetScore = 100;
  if (approxPerPerson <= targetBudget) {
    budgetScore = 100; // Well within budget
    explanations.push(`Fits your budget (Avg ₹${approxPerPerson}/person vs target ₹${targetBudget})`);
  } else {
    // Penalize when per-person price exceeds target budget
    const overBudgetRatio = (approxPerPerson - targetBudget) / targetBudget;
    budgetScore = Math.max(0, 100 - overBudgetRatio * 100);
    explanations.push(`Slightly above target budget (Avg ₹${approxPerPerson}/person)`);
  }

  // --- Sub-score 3: Cuisine Match (0 to 100) ---
  let cuisineScore = 50; // default baseline
  if (preferredCuisines && preferredCuisines.length > 0) {
    const hasMatch = restaurant.cuisineTypes.some((c) =>
      preferredCuisines.some((p) => p.toLowerCase() === c.toLowerCase())
    );
    if (hasMatch) {
      cuisineScore = 100;
      explanations.push(`Serves your preferred cuisine (${restaurant.cuisineTypes.join(', ')})`);
    } else {
      cuisineScore = 30;
      explanations.push(`Features ${restaurant.cuisineTypes.join(', ')}`);
    }
  } else {
    cuisineScore = 75;
  }

  // --- Sub-score 4: Rating Quality (0 to 100) ---
  const rating = restaurant.averageRating || 4.0;
  const ratingScore = (rating / 5.0) * 100;
  if (rating >= 4.3) {
    explanations.push(`High dining rating (${rating} / 5.0 based on verified feedback)`);
  }

  // --- Sub-score 5: Offers & Value (0 to 100) ---
  const hasSpecialOffers = activeDiscounts.some(
    (d) =>
      !d.restaurantId ||
      d.restaurantId.toString() === restaurant._id.toString()
  );
  const offerScore = hasSpecialOffers ? 100 : 30;
  if (hasSpecialOffers) {
    explanations.push(`Active personalized discount deals available`);
  }

  // Weighted Sum Calculation
  const totalScore =
    0.25 * distanceScore +
    0.25 * budgetScore +
    0.20 * cuisineScore +
    0.20 * ratingScore +
    0.10 * offerScore;

  return {
    restaurant,
    distanceKm,
    approxCostPerPerson: approxPerPerson,
    suitabilityScore: Math.round(totalScore),
    breakdown: {
      distanceScore: Math.round(distanceScore),
      budgetScore: Math.round(budgetScore),
      cuisineScore: Math.round(cuisineScore),
      ratingScore: Math.round(ratingScore),
      offerScore: Math.round(offerScore),
    },
    explanations,
  };
}

module.exports = {
  calculateHaversineDistance,
  evaluateRestaurantSuitability,
};

