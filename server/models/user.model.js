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
  packages: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
      }
    ],
    default: [],
  },
  favoritePackages: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
      }
    ],
    default: [],
  },
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    wishlistCount: {
      type: Number,
      default: 0
    },
    favoriteDestinations: {
      type: [String],
      default: []
    }
  },
  referral: {
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referredUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      rewardClaimed: {
        type: Boolean,
        default: false,
      },
      rewardAmount: {
        type: Number,
        default: 0,
      },
      conversionStatus: {
        type: String,
        enum: ['pending', 'converted', 'inactive'],
        default: 'pending'
      },
      firstBookingDate: {
        type: Date,
        default: null
      },
      totalBookingValue: {
        type: Number,
        default: 0
      }
    }],
    totalReferrals: {
      type: Number,
      default: 0,
    },
    totalRewards: {
      type: Number,
      default: 0,
    },
    availableRewards: {
      type: Number,
      default: 0,
    },
    rewardHistory: [{
      type: {
        type: String,
        enum: ['referral_bonus', 'signup_bonus', 'booking_bonus', 'milestone_bonus', 'tier_bonus'],
      },
      amount: Number,
      description: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['pending', 'credited', 'used', 'expired'],
        default: 'pending',
      },
      expiryDate: {
        type: Date,
        default: null
      }
    }],
    // Advanced Referral Features
    referralTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    referralStats: {
      totalClicks: {
        type: Number,
        default: 0
      },
      totalSignups: {
        type: Number,
        default: 0
      },
      totalConversions: {
        type: Number,
        default: 0
      },
      conversionRate: {
        type: Number,
        default: 0
      },
      revenueGenerated: {
        type: Number,
        default: 0
      },
      lastActivityDate: {
        type: Date,
        default: null
      }
    },
    milestones: [{
      milestone: {
        type: String,
        enum: ['first_referral', '5_referrals', '10_referrals', '25_referrals', '50_referrals', '100_referrals']
      },
      achieved: {
        type: Boolean,
        default: false
      },
      achievedAt: {
        type: Date,
        default: null
      },
      reward: {
        type: Number,
        default: 0
      }
    }],
    socialSharing: {
      facebookShares: {
        type: Number,
        default: 0
      },
      twitterShares: {
        type: Number,
        default: 0
      },
      whatsappShares: {
        type: Number,
        default: 0
      },
      emailShares: {
        type: Number,
        default: 0
      }
    },
    customReferralUrl: {
      type: String,
      default: null
    },
    isReferralActive: {
      type: Boolean,
      default: true
    },
    referralNotes: {
      type: String,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Generate unique referral code
userSchema.methods.generateReferralCode = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FLY';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Pre-save hook to generate referral code
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referral.referralCode) {
    let referralCode;
    let isUnique = false;
    
    while (!isUnique) {
      referralCode = this.generateReferralCode();
      const existingUser = await this.constructor.findOne({ 'referral.referralCode': referralCode });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    this.referral.referralCode = referralCode;
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
