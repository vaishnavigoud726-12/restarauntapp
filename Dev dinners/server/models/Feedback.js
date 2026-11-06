const mongoose = require('mongoose');

/**
 * Feedback Schema (Verified Reviews Only)
 * In CraveWise, reviews are strictly verified by requiring a valid 'completed' booking ID.
 * Features 4-factor ratings: food, service, ambience, and overall experience.
 */
const feedbackSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One verified feedback per completed reservation
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    ratings: {
      food: { type: Number, min: 1, max: 5, required: true },
      service: { type: Number, min: 1, max: 5, required: true },
      ambience: { type: Number, min: 1, max: 5, required: true },
      overall: { type: Number, min: 1, max: 5, required: true },
    },
    reviewTitle: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      trim: true,
    },
    ownerReply: {
      replyText: { type: String, default: null },
      repliedAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ['approved', 'flagged', 'hidden'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);

