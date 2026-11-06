const mongoose = require('mongoose');

/**
 * Favourite Schema
 * Stores customer bookmarked dining venues.
 */
const favouriteSchema = new mongoose.Schema(
  {
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
    },
  },
  {
    timestamps: true,
  }
);

favouriteSchema.index({ customerId: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);

