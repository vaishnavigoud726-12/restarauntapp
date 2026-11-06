const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Customer = require('../models/Customer');

/**
 * Loyalty Service - Dining Passport & Rewards System
 * Manages point accrual for completed dine-in visits and dynamically unlocks badges.
 */

const BADGES = [
  {
    id: 'first_dine',
    name: 'First Dining Experience',
    description: 'Completed your very first table reservation on CraveWise',
    icon: 'Sparkles',
    criteria: (stats) => stats.totalCompletedVisits >= 1,
  },
  {
    id: 'food_explorer',
    name: 'Food Explorer',
    description: 'Dined at 3 or more unique restaurants',
    icon: 'Compass',
    criteria: (stats) => (stats.uniqueRestaurantsVisited || 0) >= 3,
  },
  {
    id: 'biryani_connoisseur',
    name: 'Biryani Connoisseur',
    description: 'Visited an authentic Hyderabadi Dum Biryani specialist',
    icon: 'Flame',
    criteria: (stats) => (stats.cuisinesVisited || []).includes('Hyderabadi'),
  },
  {
    id: 'smart_saver',
    name: 'Smart Saver',
    description: 'Saved ₹500+ through personalized discounts',
    icon: 'TrendingDown',
    criteria: (stats) => (stats.totalSavings || 0) >= 500,
  },
  {
    id: 'loyal_diner',
    name: 'Loyal Diner',
    description: 'Achieved 5+ successful completed restaurant visits',
    icon: 'Award',
    criteria: (stats) => stats.totalCompletedVisits >= 5,
  },
];

/**
 * Awards loyalty points upon booking completion and logs the ledger transaction
 */
async function awardPointsForVisit(customerId, bookingId, actualBillAmount = 1000) {
  const customer = await Customer.findById(customerId);
  if (!customer) return;

  // Formula: Base 50 points + 5% of dining bill (1 point per ₹20 spent)
  const billPoints = Math.round(actualBillAmount / 20);
  const pointsToEarn = 50 + billPoints;

  const newBalance = (customer.loyaltyPoints || 0) + pointsToEarn;

  // Create immutable ledger transaction
  await LoyaltyTransaction.create({
    customerId,
    bookingId,
    points: pointsToEarn,
    type: 'credit',
    reason: `Dine-in completed at restaurant (+${pointsToEarn} points)`,
    balanceAfter: newBalance,
  });

  // Update customer record
  customer.loyaltyPoints = newBalance;
  customer.totalCompletedVisits = (customer.totalCompletedVisits || 0) + 1;
  await customer.save();

  return { pointsEarned: pointsToEarn, newBalance };
}

/**
 * Computes unlocked badges and passport stats for a customer
 */
function computePassportBadges(stats) {
  return BADGES.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    isUnlocked: badge.criteria(stats),
  }));
}

module.exports = {
  awardPointsForVisit,
  computePassportBadges,
  BADGES,
};

