const mongoose = require('mongoose');

/**
 * Discount Schema
 * Business rules for CraveWise's Personalized Discount Engine.
 * Supports targeted customer segments, min spend criteria, and personalized explanations.
 */
const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true, // e.g. 20 for 20% or 150 for ₹150 off
      min: 1,
    },
    minBillAmount: {
      type: Number,
      default: 0, // in ₹
    },
    maxDiscountAmount: {
      type: Number,
      default: 500, // in ₹ for percentage discounts
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    targetSegment: {
      type: String,
      enum: ['all', 'new', 'regular', 'loyal', 'inactive', 'birthday', 'high_spending', 'budget_conscious'],
      default: 'all',
    },
    // Optional restaurant scope: null = valid across all platform restaurants
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },
    whyExplanation: {
      type: String,
      required: true, // e.g., "Exclusive 20% off welcome gift for your first dine-in reservation!"
    },
    usageLimitPerCustomer: {
      type: Number,
      default: 1,
    },
    totalUsageLimit: {
      type: Number,
      default: 500,
    },
    currentUsageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Discount', discountSchema);

