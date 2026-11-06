const mongoose = require('mongoose');

/**
 * Loyalty Transaction Schema
 * Complete ledger of points earned and redeemed for the Dining Passport system.
 * Points are awarded exclusively upon completed dining visits.
 */
const loyaltyTransactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    points: {
      type: Number,
      required: true, // positive for credit, negative for debit
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    reason: {
      type: String,
      required: true, // e.g. "Completed Dine-In at Jewel of Nizam (+50 pts)"
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);

