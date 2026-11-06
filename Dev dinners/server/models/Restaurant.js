const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Restaurant Schema
 * Represents dining establishments in CraveWise.
 * Uses GeoJSON Point format with a 2dsphere index for MongoDB spatial proximity queries.
 * Holds business details, cuisine classifications, operating hours, and average ratings.
 */
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide restaurant name'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide owner/business email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'restaurant_owner',
      immutable: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    cuisineTypes: {
      type: [String],
      required: true, // e.g. ["Hyderabadi", "Mughlai", "Biryani"]
    },
    diningStyle: {
      type: String,
      enum: ['Casual Dining', 'Fine Dining', 'Café', 'Rooftop', 'Family Restaurant', 'Bistro'],
      default: 'Casual Dining',
    },
    priceForTwo: {
      type: Number,
      required: [true, 'Please enter average price for two diners in ₹'],
    },
    address: {
      street: { type: String, default: '' },
      area: { type: String, required: true }, // e.g., "Jubilee Hills", "Banjara Hills", "Gachibowli"
      city: { type: String, default: 'Hyderabad' },
      state: { type: String, default: 'Telangana' },
      pincode: { type: String, default: '500081' },
    },
    // GeoJSON Point location for $geoNear queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    openingTime: {
      type: String,
      default: '11:00', // 24-hr format HH:mm
    },
    closingTime: {
      type: String,
      default: '23:00',
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      ],
    },
    features: {
      type: [String],
      default: ['Air Conditioned', 'Valet Parking', 'Free Wi-Fi', 'Card Accepted'],
    },
    averageRating: {
      type: Number,
      default: 4.2,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    ratingsBreakdown: {
      food: { type: Number, default: 4.2 },
      service: { type: Number, default: 4.0 },
      ambience: { type: Number, default: 4.3 },
      overall: { type: Number, default: 4.2 },
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'frozen'],
      default: 'approved',
    },
    isAcceptingReservations: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB 2dsphere index for geospatial proximity calculations
restaurantSchema.index({ location: '2dsphere' });

// Encrypt password before saving
restaurantSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

restaurantSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);

