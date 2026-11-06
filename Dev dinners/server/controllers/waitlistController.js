const Waitlist = require('../models/Waitlist');
const Restaurant = require('../models/Restaurant');
const Notification = require('../models/Notification');

/**
 * @desc    Join waitlist for a fully-booked time slot
 * @route   POST /api/waitlist/join
 * @access  Private (Customer)
 */
exports.joinWaitlist = async (req, res, next) => {
  try {
    const { restaurantId, guestCount, date, timeSlot } = req.body;
    const customerId = req.user._id;

    // Check existing active queue items for this customer at the same slot
    const existing = await Waitlist.findOne({
      restaurantId,
      customerId,
      date,
      timeSlot,
      status: 'waiting',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: `You are already in line for this slot (Position #${existing.queuePosition}).`,
      });
    }

    // Determine position in queue
    const queueCount = await Waitlist.countDocuments({
      restaurantId,
      date,
      timeSlot,
      status: 'waiting',
    });

    const position = queueCount + 1;
    const estimatedWaitMinutes = position * 15; // 15 mins per waiting party

    const entry = await Waitlist.create({
      restaurantId,
      customerId,
      guestCount: parseInt(guestCount || 2),
      date,
      timeSlot,
      queuePosition: position,
      estimatedWaitMinutes,
      status: 'waiting',
    });

    const restaurant = await Restaurant.findById(restaurantId);

    // Notify customer
    await Notification.create({
      recipientId: customerId,
      recipientRole: 'customer',
      title: 'Joined Dining Waitlist',
      message: `You are #${position} in line at ${restaurant?.name || 'the restaurant'} for ${date} (${timeSlot}). Est. wait: ${estimatedWaitMinutes} mins.`,
      type: 'waitlist',
    });

    res.status(201).json({
      success: true,
      message: `You have been added to the waitlist! Position: #${position}`,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer's current waitlist tickets
 * @route   GET /api/waitlist/my-status
 * @access  Private (Customer)
 */
exports.getMyWaitlistStatus = async (req, res, next) => {
  try {
    const list = await Waitlist.find({
      customerId: req.user._id,
      status: { $in: ['waiting', 'notified'] },
    })
      .populate('restaurantId', 'name address phone images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restaurant owner views waitlist queue
 * @route   GET /api/waitlist/restaurant-queue
 * @access  Private (Restaurant Owner)
 */
exports.getRestaurantWaitlist = async (req, res, next) => {
  try {
    const list = await Waitlist.find({
      restaurantId: req.user._id,
      status: { $in: ['waiting', 'notified'] },
    })
      .populate('customerId', 'fullName phone email loyaltyPoints')
      .sort({ queuePosition: 1 });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restaurant owner notifies next customer that a table is ready
 * @route   PUT /api/waitlist/:id/notify
 * @access  Private (Restaurant Owner)
 */
exports.notifyWaitlistCustomer = async (req, res, next) => {
  try {
    const waitlistEntry = await Waitlist.findById(req.params.id);
    if (!waitlistEntry) {
      return res.status(404).json({ success: false, error: 'Waitlist record not found' });
    }

    waitlistEntry.status = 'notified';
    await waitlistEntry.save();

    await Notification.create({
      recipientId: waitlistEntry.customerId,
      recipientRole: 'customer',
      title: 'Table Ready! Please Proceed to Restaurant',
      message: `Great news! Your table is now ready. Please check in with the host within 10 minutes.`,
      type: 'waitlist',
    });

    res.status(200).json({
      success: true,
      message: 'Customer notified successfully.',
      data: waitlistEntry,
    });
  } catch (error) {
    next(error);
  }
};

