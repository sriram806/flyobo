import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  isAccountVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatar: {
    public_id: String,
    url: String,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpireAt: {
    type: Date,
    default: null,
  },
  resetPasswordOtp: {
    type: String,
    default: null,
  },
  resetPasswordOtpExpireAt: {
    type: Date,
    default: null,
  },
  // Track packages booked by the user
  packages: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
      }
    ],
    default: [],
  },
  // User preferences and settings
  preferences: {
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  // User statistics
  stats: {
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    favoriteDestinations: [String],
    lastBookingDate: Date,
    wishlistCount: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
