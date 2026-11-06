const mongoose = require('mongoose');

/**
 * Waitlist Schema
 * Allows customers to join an automated queue when a restaurant's tables
 * are fully booked for a requested slot.
 */
const waitlistSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'seated', 'cancelled'],
      default: 'waiting',
    },
    queuePosition: {
      type: Number,
      default: 1,
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 25,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for real-time queue ordering per restaurant/date/slot
waitlistSchema.index({ restaurantId: 1, date: 1, timeSlot: 1, status: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);

