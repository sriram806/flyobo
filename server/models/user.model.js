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
    enum: ['user', 'manager', 'admin'],
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

  packages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    }
  ],

  favoritePackages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    }
  ],

  stats: {
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    favoriteDestinations: { type: [String], default: [] },
  },

  bankDetails: {
    accountHolderName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    bankName: { type: String, default: null },
    ifscCode: { type: String, default: null }
  },

  // ================= SIMPLE REFERRAL SYSTEM =================
  referral: {
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    referredUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        hasBooked: {
          type: Boolean,
          default: false,
        },
        firstBookingDate: {
          type: Date,
          default: null,
        }
      }
    ],

    totalReferrals: {
      type: Number,
      default: 0
    },

    expiryDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date;
      }
    }
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },

  reward: {
    type: Number,
    default: 0,
    min: 0,
  },

  referralWithdrawals: [
    {
      amount: { type: Number, required: true },
      status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
      requestedAt: { type: Date, default: Date.now },
      processedAt: { type: Date, default: null },
      notes: { type: String, default: '' }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

}, { timestamps: true });


// ========== SIMPLE REFERRAL CODE GENERATOR ==========
userSchema.methods.generateReferralCode = function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FLY';
  for (let i = 0; i < 9; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

userSchema.pre('save', async function (next) {
  if (this.isNew && !this.referral.referralCode) {
    let code;
    let unique = false;

    while (!unique) {
      code = this.generateReferralCode();
      const exists = await this.constructor.findOne({ 'referral.referralCode': code });
      if (!exists) unique = true;
    }

    this.referral.referralCode = code;
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
