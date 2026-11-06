const GroupDiningPlan = require('../models/GroupDiningPlan');
const Restaurant = require('../models/Restaurant');

function generateShareCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'CW-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * @desc    Create a new group dining plan
 * @route   POST /api/group-dining
 * @access  Private (Customer)
 */
exports.createGroupPlan = async (req, res, next) => {
  try {
    const {
      groupName,
      groupSize,
      targetBudgetPerPerson,
      preferredCuisines = [],
      shortlistedRestaurantIds = [],
    } = req.body;

    const creatorId = req.user._id;

    // Build shortlisted items with initial empty vote arrays
    const shortlistedRestaurants = shortlistedRestaurantIds.map((id) => ({
      restaurantId: id,
      votes: [],
    }));

    const shareCode = generateShareCode();

    const plan = await GroupDiningPlan.create({
      creatorId,
      groupName,
      groupSize: parseInt(groupSize || 4),
      targetBudgetPerPerson: parseFloat(targetBudgetPerPerson || 600),
      preferredCuisines,
      shortlistedRestaurants,
      shareCode,
      status: 'voting',
    });

    const populatedPlan = await GroupDiningPlan.findById(plan._id)
      .populate('shortlistedRestaurants.restaurantId', 'name address priceForTwo cuisineTypes averageRating images')
      .populate('creatorId', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Group Dining Plan created! Share the code or link with your friends to vote.',
      data: populatedPlan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get group dining plan by shareable code
 * @route   GET /api/group-dining/code/:shareCode
 * @access  Public / Optional Auth
 */
exports.getGroupByCode = async (req, res, next) => {
  try {
    const plan = await GroupDiningPlan.findOne({
      shareCode: req.params.shareCode.toUpperCase(),
    })
      .populate('shortlistedRestaurants.restaurantId', 'name address priceForTwo cuisineTypes averageRating images features')
      .populate('winningRestaurantId', 'name address priceForTwo images')
      .populate('creatorId', 'fullName');

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Group dining plan not found with this code.' });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cast a vote for a restaurant in a group dining plan
 * @route   POST /api/group-dining/:id/vote
 * @access  Private (Customer)
 */
exports.voteForRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.body;
    const planId = req.params.id;
    const customerId = req.user._id;

    const plan = await GroupDiningPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    if (plan.status !== 'voting') {
      return res.status(400).json({ success: false, error: 'Voting has already been closed for this plan.' });
    }

    // Remove customer's previous vote across all options in this plan (1 vote per member)
    plan.shortlistedRestaurants.forEach((item) => {
      item.votes = item.votes.filter((v) => v.toString() !== customerId.toString());
    });

    // Add vote to chosen restaurant
    const targetItem = plan.shortlistedRestaurants.find(
      (item) => item.restaurantId.toString() === restaurantId.toString()
    );

    if (!targetItem) {
      return res.status(400).json({ success: false, error: 'Restaurant is not in the shortlist.' });
    }

    targetItem.votes.push(customerId);

    // Determine current leader
    let leader = null;
    let maxVotes = -1;
    plan.shortlistedRestaurants.forEach((item) => {
      if (item.votes.length > maxVotes) {
        maxVotes = item.votes.length;
        leader = item.restaurantId;
      }
    });

    plan.winningRestaurantId = leader;
    await plan.save();

    const updated = await GroupDiningPlan.findById(plan._id)
      .populate('shortlistedRestaurants.restaurantId', 'name address priceForTwo cuisineTypes averageRating images')
      .populate('winningRestaurantId', 'name address priceForTwo');

    res.status(200).json({
      success: true,
      message: 'Vote recorded!',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Finalize voting and lock winning restaurant
 * @route   POST /api/group-dining/:id/finalize
 * @access  Private (Creator Customer)
 */
exports.finalizeGroupPlan = async (req, res, next) => {
  try {
    const plan = await GroupDiningPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    if (plan.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the creator can finalize the group plan.' });
    }

    plan.status = 'finalized';
    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Group plan finalized! You can now proceed to book a table for your party.',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

