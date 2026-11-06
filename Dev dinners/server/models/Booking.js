const mongoose = require('mongoose');

/**
 * Booking Schema
 * Records table reservations made by customers.
 * Includes a 4-digit checkInCode to simulate physical check-in at the restaurant.
 * Compound index prevents double-booking the same table for identical date and time slot.
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
      min: 1,
    },
    bookingDate: {
      type: String, // Stored as ISO date string: YYYY-MM-DD
      required: true,
    },
    timeSlot: {
      type: String, // e.g. "12:00 - 14:00", "19:00 - 21:00"
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'seated', 'completed', 'cancelled', 'no-show'],
      default: 'confirmed',
    },
    specialRequests: {
      type: String,
      default: '',
    },
    // 4-digit secret code verified by restaurant owner on arrival
    checkInCode: {
      type: String,
      required: true,
    },
    billEstimatedAmount: {
      type: Number,
      default: 0,
    },
    actualBillAmount: {
      type: Number,
      default: 0,
    },
    discountSaved: {
      type: Number,
      default: 0,
    },
    appliedDiscountCode: {
      type: String,
      default: null,
    },
    isFeedbackSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help query table availability quickly
bookingSchema.index({ restaurantId: 1, bookingDate: 1, timeSlot: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

