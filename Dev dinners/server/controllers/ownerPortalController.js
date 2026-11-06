const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const Discount = require('../models/Discount');
const DiscountUsage = require('../models/DiscountUsage');

/**
 * @desc    Get Owner Intelligence Dashboard KPIs & Analytics
 * @route   GET /api/restaurant-portal/dashboard
 * @access  Private (Restaurant Owner)
 */
exports.getOwnerDashboard = async (req, res, next) => {
  try {
    const restaurantId = req.user._id;

    // 1. Booking counts and status breakdown
    const allBookings = await Booking.find({ restaurantId });
    const totalBookings = allBookings.length;
    const completedBookings = allBookings.filter((b) => b.status === 'completed');
    const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled');
    const confirmedToday = allBookings.filter((b) => b.status === 'confirmed');
    const currentlySeated = allBookings.filter((b) => b.status === 'seated');

    // 2. Real Revenue Calculation from recorded completed dining transactions
    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + (b.actualBillAmount || b.billEstimatedAmount || 0),
      0
    );

    // 3. Table Utilization
    const allTables = await Table.find({ restaurantId, isActive: true });
    const totalCapacity = allTables.reduce((sum, t) => sum + t.capacity, 0);
    const occupiedCapacity = currentlySeated.reduce((sum, b) => sum + b.guestCount, 0);
    const tableUtilizationRate =
      totalCapacity > 0 ? Math.round((occupiedCapacity / totalCapacity) * 100) : 0;

    // 4. Menu popularity analysis
    const popularItems = await MenuItem.find({ restaurantId })
      .sort({ popularityScore: -1 })
      .limit(5);

    // 5. Recent feedback & ratings
    const recentFeedback = await Feedback.find({ restaurantId })
      .populate('customerId', 'fullName avatarUrl')
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Discount performance
    const activeOffers = await Discount.find({
      $or: [{ restaurantId }, { restaurantId: null }],
      isActive: true,
    });

    const discountUsages = await DiscountUsage.find({
      bookingId: { $in: completedBookings.map((b) => b._id) },
    });
    const totalDiscountSavingsGiven = discountUsages.reduce(
      (sum, u) => sum + u.savedAmount,
      0
    );

    // 7. Data-driven business recommendations (MSD Requirement: Based on actual recorded data)
    const insights = [];
    if (tableUtilizationRate > 75) {
      insights.push(
        'High table utilization right now! Consider shortening default seating turnover or expanding booth capacity.'
      );
    } else if (tableUtilizationRate < 30 && totalBookings > 0) {
      insights.push(
        'Table utilization is quiet. Launch a weekday lunch discount offer to boost afternoon footfall.'
      );
    }

    if (cancelledBookings.length / (totalBookings || 1) > 0.2) {
      insights.push(
        'Cancellation rate exceeds 20%. Consider requesting a minimal advance notice or sending booking reminders.'
      );
    } else {
      insights.push('Healthy reservation attendance rate with low no-shows.');
    }

    const restaurant = await Restaurant.findById(restaurantId);

    res.status(200).json({
      success: true,
      data: {
        restaurantProfile: {
          name: restaurant.name,
          email: restaurant.email,
          area: restaurant.address.area,
          averageRating: restaurant.averageRating,
          totalReviews: restaurant.totalReviews,
          ratingsBreakdown: restaurant.ratingsBreakdown,
        },
        kpis: {
          totalBookings,
          completedBookings: completedBookings.length,
          cancelledBookings: cancelledBookings.length,
          activeToday: confirmedToday.length,
          currentlySeated: currentlySeated.length,
          totalRevenue: Math.round(totalRevenue),
          totalTables: allTables.length,
          totalSeats: totalCapacity,
          tableUtilizationRate,
          totalDiscountSavingsGiven: Math.round(totalDiscountSavingsGiven),
        },
        popularItems,
        recentFeedback,
        activeOffers,
        businessInsights: insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Owner's Menu Items
 * @route   GET /api/restaurant-portal/menu
 * @access  Private (Restaurant Owner)
 */
exports.getMyMenu = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.user._id }).sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a dish to menu
 * @route   POST /api/restaurant-portal/menu
 * @access  Private (Restaurant Owner)
 */
exports.addMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      dietaryType,
      isChefSpecial,
      imageUrl,
      preparationTimeMinutes,
    } = req.body;

    const item = await MenuItem.create({
      restaurantId: req.user._id,
      name,
      description,
      category,
      price: parseFloat(price),
      dietaryType,
      isChefSpecial: Boolean(isChefSpecial),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      preparationTimeMinutes: parseInt(preparationTimeMinutes || 20),
    });

    res.status(201).json({ success: true, message: 'Menu item added successfully', data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a menu item
 * @route   PUT /api/restaurant-portal/menu/:id
 * @access  Private (Restaurant Owner)
 */
exports.updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    Object.assign(item, req.body);
    await item.save();

    res.status(200).json({ success: true, message: 'Menu item updated', data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a menu item
 * @route   DELETE /api/restaurant-portal/menu/:id
 * @access  Private (Restaurant Owner)
 */
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, restaurantId: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.status(200).json({ success: true, message: 'Menu item removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Owner's Tables
 * @route   GET /api/restaurant-portal/tables
 * @access  Private (Restaurant Owner)
 */
exports.getMyTables = async (req, res, next) => {
  try {
    const tables = await Table.find({ restaurantId: req.user._id }).sort({ tableNumber: 1 });
    res.status(200).json({ success: true, count: tables.length, data: tables });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add Table
 * @route   POST /api/restaurant-portal/tables
 * @access  Private (Restaurant Owner)
 */
exports.addTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, zone } = req.body;

    const existing = await Table.findOne({ restaurantId: req.user._id, tableNumber });
    if (existing) {
      return res.status(400).json({ success: false, error: 'A table with this number already exists.' });
    }

    const table = await Table.create({
      restaurantId: req.user._id,
      tableNumber,
      capacity: parseInt(capacity),
      zone: zone || 'Indoor AC',
    });

    res.status(201).json({ success: true, message: 'Table added', data: table });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Table
 * @route   DELETE /api/restaurant-portal/tables/:id
 * @access  Private (Restaurant Owner)
 */
exports.deleteTable = async (req, res, next) => {
  try {
    await Table.findOneAndDelete({ _id: req.params.id, restaurantId: req.user._id });
    res.status(200).json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Owner's Bookings
 * @route   GET /api/restaurant-portal/bookings
 * @access  Private (Restaurant Owner)
 */
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = { restaurantId: req.user._id };
    if (status) filter.status = status;
    if (date) filter.bookingDate = date;

    const bookings = await Booking.find(filter)
      .populate('customerId', 'fullName phone email avatarUrl loyaltyPoints segment')
      .populate('tableId', 'tableNumber zone capacity')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

