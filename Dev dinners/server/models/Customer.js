const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Customer Schema
 * Represents dining customers registered on CraveWise.
 * Stores personal profile, dietary lifestyle preferences, dining passport statistics,
 * loyalty points balance, and dynamic customer segmentation.
 */
const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'customer',
      immutable: true,
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    // User's default or saved home/work location for proximity calculations
    savedLocation: {
      address: { type: String, default: 'Hitec City, Hyderabad' },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [78.3846, 17.4486],
      },
    },
    // Dietary preferences for personalized menu matching and "TasteMatch" compatibility
    dietaryPreferences: [
      {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Vegan', 'Halal', 'Jain', 'Keto', 'Gluten-Free'],
      },
    ],
    favouriteCuisines: {
      type: [String],
      default: ['Hyderabadi', 'North Indian', 'Continental'],
    },
    budgetPreference: {
      type: String,
      enum: ['Budget', 'Mid-Range', 'Fine Dining'],
      default: 'Mid-Range',
    },
    // Dining Passport stats & loyalty points
    loyaltyPoints: {
      type: Number,
      default: 100, // 100 points welcome bonus upon registration
    },
    totalSavings: {
      type: Number,
      default: 0, // Cumulative ₹ saved across completed reservations
    },
    totalCompletedVisits: {
      type: Number,
      default: 0,
    },
    dateOfBirth: {
      type: Date,
    },
    // Dynamic customer segment for the personalized discount engine
    segment: {
      type: String,
      enum: ['all', 'new', 'regular', 'loyal', 'inactive', 'birthday', 'high_spending', 'budget_conscious'],
      default: 'new',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving customer to database
customerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare input password with hashed password in database
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
