const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Super Admin Schema
 * Represents platform administrators with elevated privileges to moderate restaurants,
 * manage customer segments, audit feedback, and monitor platform health.
 */
const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      default: 'CraveWise Administrator',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'super_admin',
      immutable: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);

