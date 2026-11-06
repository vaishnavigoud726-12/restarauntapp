const mongoose = require('mongoose');

/**
 * Menu Item Schema
 * Represents individual dishes served at registered restaurants.
 * Used heavily by the Smart Meal Builder for combinatorial budget meal recommendations.
 */
const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide dish name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Starters', 'Main Course', 'Breads & Rice', 'Desserts', 'Beverages'],
      required: [true, 'Please choose a category'],
    },
    price: {
      type: Number,
      required: [true, 'Please specify price in ₹'],
      min: [0, 'Price cannot be negative'],
    },
    dietaryType: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Vegan', 'Egg'],
      required: true,
    },
    isChefSpecial: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    popularityScore: {
      type: Number,
      default: 60, // 0-100 scale for recommendation ranking
    },
    preparationTimeMinutes: {
      type: Number,
      default: 20,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);

