const mongoose = require('mongoose');

/**
 * Activity Log Schema
 * System-wide audit log for platform super-administrators to monitor
 * administrative actions, moderation events, and critical security operations.
 */
const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    actorName: {
      type: String,
      default: 'System',
    },
    actorRole: {
      type: String,
      default: 'system',
    },
    action: {
      type: String,
      required: true, // e.g. "RESTAURANT_APPROVED", "DISCOUNT_CREATED"
    },
    targetEntity: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);

