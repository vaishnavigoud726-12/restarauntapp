const Customer = require('../models/Customer');
const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const Discount = require('../models/Discount');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get Platform-Wide Analytics for Super Admin
 * @route   GET /api/admin/metrics
 * @access  Private (Super Admin)
 */
exports.getPlatformMetrics = async (req, res, next) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ accountStatus: 'active' });

    const totalRestaurants = await Restaurant.countDocuments();
    const approvedRestaurants = await Restaurant.countDocuments({ approvalStatus: 'approved' });
    const pendingRestaurants = await Restaurant.countDocuments({ approvalStatus: 'pending' });
    const frozenRestaurants = await Restaurant.countDocuments({ approvalStatus: 'frozen' });

    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const activeDiscounts = await Discount.countDocuments({ isActive: true });
    const totalFeedback = await Feedback.countDocuments();

    // Top cuisines aggregation
    const popularCuisines = await Restaurant.aggregate([
      { $unwind: '$cuisineTypes' },
      { $group: { _id: '$cuisineTypes', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Top rated restaurants
    const topRestaurants = await Restaurant.find({ approvalStatus: 'approved' })
      .sort({ averageRating: -1 })
      .limit(5)
      .select('name address averageRating totalReviews cuisineTypes');

    // Recent activity logs
    const recentActivity = await ActivityLog.find().sort({ timestamp: -1 }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCustomers,
          activeCustomers,
          totalRestaurants,
          approvedRestaurants,
          pendingRestaurants,
          frozenRestaurants,
          totalBookings,
          completedBookings,
          activeDiscounts,
          totalFeedback,
        },
        popularCuisines,
        topRestaurants,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: List and search customers
 * @route   GET /api/admin/customers
 * @access  Private (Super Admin)
 */
exports.getCustomersAdmin = async (req, res, next) => {
  try {
    const { keyword, status } = req.query;
    const filter = {};
    if (keyword) {
      filter.$or = [
        { fullName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (status) filter.accountStatus = status;

    const customers = await Customer.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Toggle customer account status (active / suspended)
 * @route   PUT /api/admin/customers/:id/status
 * @access  Private (Super Admin)
 */
exports.updateCustomerStatus = async (req, res, next) => {
  try {
    const { accountStatus } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    customer.accountStatus = accountStatus || (customer.accountStatus === 'active' ? 'suspended' : 'active');
    await customer.save();

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.fullName || 'Admin',
      actorRole: 'super_admin',
      action: `CUSTOMER_${customer.accountStatus.toUpperCase()}`,
      targetEntity: `Customer: ${customer.fullName} (${customer.email})`,
    });

    res.status(200).json({
      success: true,
      message: `Customer account is now ${customer.accountStatus}`,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: List and search restaurants
 * @route   GET /api/admin/restaurants
 * @access  Private (Super Admin)
 */
exports.getRestaurantsAdmin = async (req, res, next) => {
  try {
    const { status, keyword } = req.query;
    const filter = {};
    if (status) filter.approvalStatus = status;
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { 'address.area': { $regex: keyword, $options: 'i' } },
      ];
    }

    const restaurants = await Restaurant.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Update restaurant approval status (approved, frozen, rejected)
 * @route   PUT /api/admin/restaurants/:id/status
 * @access  Private (Super Admin)
 */
exports.updateRestaurantStatus = async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    restaurant.approvalStatus = approvalStatus;
    await restaurant.save();

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.fullName || 'Admin',
      actorRole: 'super_admin',
      action: `RESTAURANT_${approvalStatus.toUpperCase()}`,
      targetEntity: `Restaurant: ${restaurant.name} (${restaurant.email})`,
    });

    res.status(200).json({
      success: true,
      message: `Restaurant status updated to ${approvalStatus}`,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Get all reviews for moderation
 * @route   GET /api/admin/feedback
 * @access  Private (Super Admin)
 */
exports.getAllFeedbackAdmin = async (req, res, next) => {
  try {
    const reviews = await Feedback.find()
      .populate('customerId', 'fullName email')
      .populate('restaurantId', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

