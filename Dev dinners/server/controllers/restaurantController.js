const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Discount = require('../models/Discount');
const Feedback = require('../models/Feedback');
const { calculateHaversineDistance } = require('../services/recommendationService');

/**
 * @desc    Get nearby restaurants using MongoDB $geoNear aggregation
 * @route   GET /api/restaurants/nearby
 * @access  Public
 */
exports.getNearbyRestaurants = async (req, res, next) => {
  try {
    const {
      lng = 78.3846, // Default Hyderabad coordinates (Hitec City)
      lat = 17.4486,
      maxDistance = 25, // in km
      cuisine,
      diningStyle,
      minRating,
      maxPriceForTwo,
    } = req.query;

    const userLng = parseFloat(lng);
    const userLat = parseFloat(lat);
    const maxDistMeters = parseFloat(maxDistance) * 1000;

    // Build aggregation pipeline using GeoJSON 2dsphere index
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [userLng, userLat],
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistMeters,
          spherical: true,
          query: { approvalStatus: 'approved' },
        },
      },
    ];

    // Optional Filter Match stages
    const matchFilters = {};
    if (cuisine) {
      matchFilters.cuisineTypes = { $in: [new RegExp(cuisine, 'i')] };
    }
    if (diningStyle) {
      matchFilters.diningStyle = diningStyle;
    }
    if (minRating) {
      matchFilters.averageRating = { $gte: parseFloat(minRating) };
    }
    if (maxPriceForTwo) {
      matchFilters.priceForTwo = { $lte: parseFloat(maxPriceForTwo) };
    }

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters });
    }

    const restaurants = await Restaurant.aggregate(pipeline);

    // Format distance in km and attach active discount preview
    const activeDiscounts = await Discount.find({ isActive: true });

    const formatted = restaurants.map((r) => {
      const distanceKm = parseFloat((r.distanceMeters / 1000).toFixed(2));
      const restaurantDiscounts = activeDiscounts.filter(
        (d) => !d.restaurantId || d.restaurantId.toString() === r._id.toString()
      );

      return {
        ...r,
        distanceKm,
        activeOffersCount: restaurantDiscounts.length,
        featuredOffer: restaurantDiscounts[0] ? restaurantDiscounts[0].title : null,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      userLocation: { lng: userLng, lat: userLat },
      data: formatted,
    });
  } catch (error) {
    // Graceful fallback if MongoDB 2dsphere index query experiences any coordinate error
    console.warn('[Fallback Near Query]', error.message);
    const all = await Restaurant.find({ approvalStatus: 'approved' });
    const userLng = parseFloat(req.query.lng || 78.3846);
    const userLat = parseFloat(req.query.lat || 17.4486);

    const mapped = all.map((r) => {
      const dist = calculateHaversineDistance(userLat, userLng, r.location.coordinates[1], r.location.coordinates[0]);
      return {
        ...r.toObject(),
        distanceKm: dist,
        distanceMeters: dist * 1000,
        activeOffersCount: 1,
      };
    });

    res.status(200).json({
      success: true,
      count: mapped.length,
      fallbackUsed: true,
      data: mapped,
    });
  }
};

/**
 * @desc    Search and filter all restaurants
 * @route   GET /api/restaurants
 * @access  Public
 */
exports.getAllRestaurants = async (req, res, next) => {
  try {
    const { keyword, area, cuisine, sort = 'rating' } = req.query;

    const query = { approvalStatus: 'approved' };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { cuisineTypes: { $in: [new RegExp(keyword, 'i')] } },
        { 'address.area': { $regex: keyword, $options: 'i' } },
      ];
    }

    if (area) {
      query['address.area'] = new RegExp(area, 'i');
    }

    if (cuisine) {
      query.cuisineTypes = { $in: [new RegExp(cuisine, 'i')] };
    }

    let sortOptions = { averageRating: -1 };
    if (sort === 'price_asc') sortOptions = { priceForTwo: 1 };
    if (sort === 'price_desc') sortOptions = { priceForTwo: -1 };
    if (sort === 'name') sortOptions = { name: 1 };

    const restaurants = await Restaurant.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single restaurant details with menu, tables, and verified reviews
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const menuItems = await MenuItem.find({ restaurantId: restaurant._id, isAvailable: true });
    const tables = await Table.find({ restaurantId: restaurant._id, isActive: true });
    const reviews = await Feedback.find({ restaurantId: restaurant._id, status: 'approved' })
      .populate('customerId', 'fullName avatarUrl')
      .sort({ createdAt: -1 });

    const activeOffers = await Discount.find({
      isActive: true,
      $or: [{ restaurantId: null }, { restaurantId: restaurant._id }],
    });

    res.status(200).json({
      success: true,
      data: {
        restaurant,
        menuItems,
        tablesCount: tables.length,
        totalCapacity: tables.reduce((acc, t) => acc + t.capacity, 0),
        reviews,
        activeOffers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compare multiple restaurants side-by-side
 * @route   POST /api/restaurants/compare
 * @access  Public
 */
exports.compareRestaurants = async (req, res, next) => {
  try {
    const { restaurantIds = [], userLng = 78.3846, userLat = 17.4486 } = req.body;

    if (!restaurantIds || restaurantIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least 2 restaurants to compare.',
      });
    }

    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } });

    const comparisons = await Promise.all(
      restaurants.map(async (r) => {
        const topDishes = await MenuItem.find({ restaurantId: r._id })
          .sort({ popularityScore: -1 })
          .limit(3)
          .select('name price category dietaryType');

        const offers = await Discount.find({
          isActive: true,
          $or: [{ restaurantId: null }, { restaurantId: r._id }],
        }).select('code title discountType discountValue');

        const dist = calculateHaversineDistance(
          userLat,
          userLng,
          r.location.coordinates[1],
          r.location.coordinates[0]
        );

        return {
          _id: r._id,
          name: r.name,
          images: r.images,
          area: r.address.area,
          distanceKm: dist,
          averageRating: r.averageRating,
          totalReviews: r.totalReviews,
          ratingsBreakdown: r.ratingsBreakdown,
          priceForTwo: r.priceForTwo,
          approxPerPerson: r.priceForTwo / 2,
          cuisineTypes: r.cuisineTypes,
          diningStyle: r.diningStyle,
          topDishes,
          availableOffers: offers,
          features: r.features,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: comparisons.length,
      data: comparisons,
    });
  } catch (error) {
    next(error);
  }
};

