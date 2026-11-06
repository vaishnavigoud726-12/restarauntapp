const mongoose = require('mongoose');

/**
 * Table Schema
 * Represents physical seating units within a restaurant.
 * Enables table capacity matching and real-time double-booking prevention.
 */
const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Please provide table number or label'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify seating capacity'],
      min: 1,
      max: 30,
    },
    zone: {
      type: String,
      enum: ['Indoor AC', 'Outdoor / Garden', 'Rooftop', 'Family Booth', 'Private Dining'],
      default: 'Indoor AC',
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

// Compound index to ensure uniqueness of table number per restaurant
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);

