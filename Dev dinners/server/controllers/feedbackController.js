const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');

/**
 * Recalculate and update a restaurant's average rating & factor breakdown
 */
async function recalculateRestaurantRating(restaurantId) {
  const reviews = await Feedback.find({ restaurantId, status: 'approved' });

  if (reviews.length === 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: 0,
      totalReviews: 0,
    });
    return;
  }

  const totals = reviews.reduce(
    (acc, rev) => {
      acc.food += rev.ratings.food;
      acc.service += rev.ratings.service;
      acc.ambience += rev.ratings.ambience;
      acc.overall += rev.ratings.overall;
      return acc;
    },
    { food: 0, service: 0, ambience: 0, overall: 0 }
  );

  const count = reviews.length;
  const avgOverall = parseFloat((totals.overall / count).toFixed(1));
  const avgFood = parseFloat((totals.food / count).toFixed(1));
  const avgService = parseFloat((totals.service / count).toFixed(1));
  const avgAmbience = parseFloat((totals.ambience / count).toFixed(1));

  await Restaurant.findByIdAndUpdate(restaurantId, {
    averageRating: avgOverall,
    totalReviews: count,
    ratingsBreakdown: {
      food: avgFood,
      service: avgService,
      ambience: avgAmbience,
      overall: avgOverall,
    },
  });
}

/**
 * @desc    Submit verified review (Only if booking status is 'completed')
 * @route   POST /api/feedback
 * @access  Private (Customer)
 */
exports.submitVerifiedReview = async (req, res, next) => {
  try {
    const { bookingId, ratings, reviewTitle, comment } = req.body;
    const customerId = req.user._id;

    if (!bookingId || !ratings || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Please provide bookingId, ratings (food, service, ambience, overall), and review comment.',
      });
    }

    // 1. Verify that booking exists, belongs to this customer, and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking reservation not found.' });
    }

    if (booking.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to review a reservation made by another diner.',
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: `Verified reviews can only be submitted after completing your dining experience. Current status: ${booking.status}.`,
      });
    }

    if (booking.isFeedbackSubmitted) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted a verified review for this completed dining visit.',
      });
    }

    // 2. Create Verified Feedback
    const feedback = await Feedback.create({
      bookingId: booking._id,
      customerId,
      restaurantId: booking.restaurantId,
      ratings: {
        food: Math.min(5, Math.max(1, Number(ratings.food || 5))),
        service: Math.min(5, Math.max(1, Number(ratings.service || 5))),
        ambience: Math.min(5, Math.max(1, Number(ratings.ambience || 5))),
        overall: Math.min(5, Math.max(1, Number(ratings.overall || 5))),
      },
      reviewTitle: reviewTitle || 'Dine-In Experience',
      comment,
      status: 'approved',
    });

    // 3. Mark booking as reviewed
    booking.isFeedbackSubmitted = true;
    await booking.save();

    // 4. Update restaurant average metrics
    await recalculateRestaurantRating(booking.restaurantId);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been published.',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all verified reviews for a restaurant
 * @route   GET /api/feedback/restaurant/:restaurantId
 * @access  Public
 */
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Feedback.find({
      restaurantId: req.params.restaurantId,
      status: 'approved',
    })
      .populate('customerId', 'fullName avatarUrl segment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restaurant owner replies to a review
 * @route   POST /api/feedback/:id/reply
 * @access  Private (Restaurant Owner)
 */
exports.ownerReplyToReview = async (req, res, next) => {
  try {
    const { replyText } = req.body;
    const review = await Feedback.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.restaurantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Cannot reply to reviews of other restaurants.' });
    }

    review.ownerReply = {
      replyText,
      repliedAt: new Date(),
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Official response posted to review.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Super Admin moderates review (flag or hide)
 * @route   PUT /api/feedback/:id/moderate
 * @access  Private (Super Admin)
 */
exports.moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved', 'flagged', 'hidden'
    const review = await Feedback.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    review.status = status || 'hidden';
    await review.save();

    // Recalculate rating without hidden review
    await recalculateRestaurantRating(review.restaurantId);

    res.status(200).json({
      success: true,
      message: `Review status updated to ${review.status}`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

