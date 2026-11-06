const mongoose = require('mongoose');

/**
 * Group Dining Plan Schema
 * Facilitates social dining coordination:
 * Generates a lightweight share code for friends to vote on shortlisted restaurants
 * without requiring high overhead or complex websockets.
 */
const groupDiningPlanSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    groupSize: {
      type: Number,
      required: true,
      min: 2,
    },
    targetBudgetPerPerson: {
      type: Number,
      required: true,
    },
    preferredCuisines: [String],
    shortlistedRestaurants: [
      {
        restaurantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Restaurant',
          required: true,
        },
        votes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
          },
        ],
      },
    ],
    winningRestaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },
    shareCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['voting', 'finalized', 'booked'],
      default: 'voting',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GroupDiningPlan', groupDiningPlanSchema);

