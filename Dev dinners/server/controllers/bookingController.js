const Booking = require('../models/Booking');
const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const Customer = require('../models/Customer');
const Discount = require('../models/Discount');
const DiscountUsage = require('../models/DiscountUsage');
const Notification = require('../models/Notification');
const { awardPointsForVisit } = require('../services/loyaltyService');

/**
 * Generate a clean unique booking reference code (e.g. CW-7489)
 */
function generateBookingRef() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CW-${random}`;
}

/**
 * Generate a 4-digit check-in code for restaurant owner physical arrival verification
 */
function generateCheckInCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * @desc    Get real-time table availability for a restaurant, date, and party size
 * @route   GET /api/bookings/available-tables
 * @access  Public
 */
exports.getAvailableTables = async (req, res, next) => {
  try {
    const { restaurantId, date, timeSlot, guestCount = 2 } = req.query;

    if (!restaurantId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Please provide restaurantId, date (YYYY-MM-DD), and timeSlot.',
      });
    }

    const guests = parseInt(guestCount);

    // 1. Fetch all active tables at the restaurant that can accommodate the party size
    const candidateTables = await Table.find({
      restaurantId,
      isActive: true,
      capacity: { $gte: guests },
    }).sort({ capacity: 1 });

    if (candidateTables.length === 0) {
      return res.status(200).json({
        success: true,
        availableCount: 0,
        isFullyBooked: true,
        message: 'No tables with sufficient capacity exist for this party size. Waitlist available.',
        tables: [],
      });
    }

    // 2. Fetch existing confirmed or seated bookings for this exact date & slot
    const existingBookings = await Booking.find({
      restaurantId,
      bookingDate: date,
      timeSlot,
      status: { $in: ['confirmed', 'seated'] },
    });

    const bookedTableIds = new Set(existingBookings.map((b) => b.tableId.toString()));

    // 3. Filter out tables already occupied
    const availableTables = candidateTables.filter(
      (t) => !bookedTableIds.has(t._id.toString())
    );

    res.status(200).json({
      success: true,
      availableCount: availableTables.length,
      isFullyBooked: availableTables.length === 0,
      tables: availableTables,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new table reservation (Strict double-booking prevention)
 * @route   POST /api/bookings
 * @access  Private (Customer)
 */
exports.createBooking = async (req, res, next) => {
  try {
    const {
      restaurantId,
      guestCount,
      bookingDate,
      timeSlot,
      specialRequests = '',
      discountCode = null,
      billEstimatedAmount = 1000,
    } = req.body;

    const customerId = req.user._id;
    const guests = parseInt(guestCount || 2);

    // 1. Find suitable active tables at the restaurant
    const candidateTables = await Table.find({
      restaurantId,
      isActive: true,
      capacity: { $gte: guests },
    }).sort({ capacity: 1 });

    if (candidateTables.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No tables capable of seating this party size exist at this venue.',
      });
    }

    // 2. Query already booked tables for this date & slot
    const conflictingBookings = await Booking.find({
      restaurantId,
      bookingDate,
      timeSlot,
      status: { $in: ['confirmed', 'seated'] },
    });

    const bookedTableIds = new Set(conflictingBookings.map((b) => b.tableId.toString()));

    // 3. Find first available table (Double-Booking Prevention Guard)
    const assignedTable = candidateTables.find(
      (t) => !bookedTableIds.has(t._id.toString())
    );

    if (!assignedTable) {
      return res.status(409).json({
        success: false,
        error: 'All tables are fully booked for this time slot. Would you like to join the waitlist?',
        isWaitlistEligible: true,
      });
    }

    // 4. Handle discount application if provided
    let discountSaved = 0;
    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
      });
      if (discount) {
        if (discount.discountType === 'percentage') {
          const raw = (billEstimatedAmount * discount.discountValue) / 100;
          discountSaved = Math.min(raw, discount.maxDiscountAmount || 500);
        } else {
          discountSaved = Math.min(discount.discountValue, billEstimatedAmount);
        }
      }
    }

    // 5. Create Booking
    const booking = await Booking.create({
      bookingReference: generateBookingRef(),
      customerId,
      restaurantId,
      tableId: assignedTable._id,
      guestCount: guests,
      bookingDate,
      timeSlot,
      status: 'confirmed',
      specialRequests,
      checkInCode: generateCheckInCode(),
      billEstimatedAmount,
      discountSaved,
      appliedDiscountCode: discountCode ? discountCode.toUpperCase() : null,
    });

    // 6. Record discount usage if applied
    if (discountCode && discountSaved > 0) {
      const discount = await Discount.findOne({ code: discountCode.toUpperCase() });
      if (discount) {
        await DiscountUsage.create({
          discountId: discount._id,
          customerId,
          bookingId: booking._id,
          savedAmount: discountSaved,
        });
        discount.currentUsageCount = (discount.currentUsageCount || 0) + 1;
        await discount.save();
      }
    }

    // 7. Send notification to customer
    const restaurant = await Restaurant.findById(restaurantId);
    await Notification.create({
      recipientId: customerId,
      recipientRole: 'customer',
      title: 'Table Reservation Confirmed!',
      message: `Your table at ${restaurant?.name || 'the restaurant'} is reserved for ${bookingDate} at ${timeSlot}. Check-in code: ${booking.checkInCode}`,
      type: 'booking',
    });

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully!',
      data: {
        booking,
        tableNumber: assignedTable.tableNumber,
        zone: assignedTable.zone,
        restaurantName: restaurant?.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer's personal bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private (Customer)
 */
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('restaurantId', 'name address images cuisineTypes phone averageRating')
      .populate('tableId', 'tableNumber zone capacity')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (Customer or Owner)
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status === 'completed' || booking.status === 'seated') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel an ongoing or already completed reservation.',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restaurant Owner verifies 4-digit check-in code and marks seated
 * @route   POST /api/bookings/verify-checkin
 * @access  Private (Restaurant Owner)
 */
exports.verifyCheckIn = async (req, res, next) => {
  try {
    const { checkInCode } = req.body;

    const booking = await Booking.findOne({
      restaurantId: req.user._id,
      checkInCode,
      status: 'confirmed',
    }).populate('customerId', 'fullName phone email loyaltyPoints');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired check-in code. Please check customer reservation.',
      });
    }

    booking.status = 'seated';
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Check-in verified! Customer ${booking.customerId?.fullName} is seated.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restaurant Owner completes dining session, records bill, awards loyalty points
 * @route   POST /api/bookings/:id/complete
 * @access  Private (Restaurant Owner)
 */
exports.completeDiningVisit = async (req, res, next) => {
  try {
    const { actualBillAmount = 1200 } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.status = 'completed';
    booking.actualBillAmount = parseFloat(actualBillAmount);
    await booking.save();

    // Award loyalty points to the customer and update stats
    const loyaltyResult = await awardPointsForVisit(
      booking.customerId,
      booking._id,
      parseFloat(actualBillAmount)
    );

    // Notify customer
    await Notification.create({
      recipientId: booking.customerId,
      recipientRole: 'customer',
      title: 'Dining Session Completed! Points Earned',
      message: `Hope you enjoyed dining with us! You earned ${loyaltyResult?.pointsEarned || 50} loyalty points. Please leave a verified review.`,
      type: 'achievement',
    });

    res.status(200).json({
      success: true,
      message: 'Dining visit marked as completed. Loyalty points credited to customer.',
      data: {
        booking,
        pointsEarned: loyaltyResult?.pointsEarned,
      },
    });
  } catch (error) {
    next(error);
  }
};

