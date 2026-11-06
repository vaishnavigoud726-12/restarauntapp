const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const { computePassportBadges } = require('../services/loyaltyService');

/**
 * @desc    Get customer's Dining Passport summary, statistics, and unlocked badges
 * @route   GET /api/passport/summary
 * @access  Private (Customer)
 */
exports.getMyPassport = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // 1. Fetch completed bookings
    const completedBookings = await Booking.find({
      customerId: customer._id,
      status: 'completed',
    }).populate('restaurantId', 'name address cuisineTypes priceForTwo images averageRating');

    // 2. Compute unique restaurants visited and cuisines
    const uniqueRestaurantMap = new Map();
    const cuisinesSet = new Set();
    let totalSpend = 0;
    let totalSavings = 0;

    completedBookings.forEach((b) => {
      if (b.restaurantId) {
        uniqueRestaurantMap.set(b.restaurantId._id.toString(), b.restaurantId);
        (b.restaurantId.cuisineTypes || []).forEach((c) => cuisinesSet.add(c));
      }
      totalSpend += b.actualBillAmount || b.billEstimatedAmount || 0;
      totalSavings += b.discountSaved || 0;
    });

    const uniqueRestaurants = Array.from(uniqueRestaurantMap.values());
    const cuisinesVisited = Array.from(cuisinesSet);

    // 3. Loyalty point history ledger
    const transactions = await LoyaltyTransaction.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // 4. Calculate Badges
    const stats = {
      totalCompletedVisits: completedBookings.length,
      uniqueRestaurantsVisited: uniqueRestaurants.length,
      cuisinesVisited,
      totalSavings,
      totalSpend,
    };

    const badges = computePassportBadges(stats);

    res.status(200).json({
      success: true,
      data: {
        customer: {
          _id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          avatarUrl: customer.avatarUrl,
          loyaltyPoints: customer.loyaltyPoints,
          segment: customer.segment,
        },
        stats: {
          totalVisits: completedBookings.length,
          uniqueVenuesCount: uniqueRestaurants.length,
          totalSavings: Math.round(totalSavings),
          totalSpend: Math.round(totalSpend),
          cuisinesExplored: cuisinesVisited,
        },
        badges,
        visitedRestaurants: uniqueRestaurants,
        recentLoyaltyLedger: transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

