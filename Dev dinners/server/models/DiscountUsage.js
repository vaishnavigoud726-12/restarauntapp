const mongoose = require('mongoose');

/**
 * Discount Usage Schema
 * Records every successful redemption of a discount by a customer.
 * Prevents exceeding per-customer usage limits and tracks user savings.
 */
const discountUsageSchema = new mongoose.Schema(
  {
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    savedAmount: {
      type: Number,
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to count usages per customer for a given coupon
discountUsageSchema.index({ discountId: 1, customerId: 1 });

module.exports = mongoose.model('DiscountUsage', discountUsageSchema);

