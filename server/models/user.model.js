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
  profile: {
    birthDate: {
      type: Date,
      default: null
    }
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
  bankDetails: {
    accountHolderName: {
      type: String,
      default: null
    },
    accountNumber: {
      type: String,
      default: null
    },
    bankName: {
      type: String,
      default: null
    },
    ifscCode: {
      type: String,
      default: null
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
        enum: ['referral_bonus', 'signup_bonus', 'booking_bonus', 'milestone_bonus', 'tier_bonus', 'redeem'],
      },
      amount: Number,
      description: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['pending', 'credited', 'used', 'expired', 'paid', 'rejected'],
        default: 'pending',
      },
      expiryDate: {
        type: Date,
        default: null
      },
      requestedAt: {
        type: Date,
        default: null
      },
      processedAt: {
        type: Date,
        default: null
      },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      depositReference: {
        type: String,
        default: null
      },
      adminNote: {
        type: String,
        default: null
      },
      bankDetails: {
        accountHolderName: { type: String, default: null },
        accountNumber: { type: String, default: null },
        bankName: { type: String, default: null },
        ifscCode: { type: String, default: null }
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
userSchema.methods.generateReferralCode = function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FLY';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Pre-save hook to generate referral code
userSchema.pre('save', async function (next) {
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

// Method to check if user has achieved a milestone
userSchema.methods.checkMilestones = function () {
  const totalReferrals = this.referral.totalReferrals;
  const milestones = this.referral.milestones;

  // Define milestone rewards
  const milestoneRewards = {
    'first_referral': { target: 1, reward: 50 },
    '5_referrals': { target: 5, reward: 100 },
    '10_referrals': { target: 10, reward: 250 },
    '25_referrals': { target: 25, reward: 500 },
    '50_referrals': { target: 50, reward: 1000 },
    '100_referrals': { target: 100, reward: 2500 }
  };

  // Check each milestone
  Object.keys(milestoneRewards).forEach(milestoneKey => {
    const milestoneData = milestoneRewards[milestoneKey];
    const milestone = milestones.find(m => m.milestone === milestoneKey);

    if (milestone && !milestone.achieved && totalReferrals >= milestoneData.target) {
      milestone.achieved = true;
      milestone.achievedAt = new Date();
      milestone.reward = milestoneData.reward;

      // Add reward to user
      this.referral.availableRewards += milestoneData.reward;
      this.referral.totalRewards += milestoneData.reward;

      // Add to reward history
      this.referral.rewardHistory.push({
        type: 'milestone_bonus',
        amount: milestoneData.reward,
        description: `Milestone bonus for ${milestoneKey}`,
        status: 'credited'
      });
    }
  });

  return this;
};

// Method to update referral tier based on total referrals
userSchema.methods.updateReferralTier = function () {
  const totalReferrals = this.referral.totalReferrals;

  if (totalReferrals >= 100) {
    this.referral.referralTier = 'diamond';
  } else if (totalReferrals >= 50) {
    this.referral.referralTier = 'platinum';
  } else if (totalReferrals >= 25) {
    this.referral.referralTier = 'gold';
  } else if (totalReferrals >= 10) {
    this.referral.referralTier = 'silver';
  } else if (totalReferrals >= 1) {
    this.referral.referralTier = 'bronze';
  }

  return this;
};

const User = mongoose.model('User', userSchema);
export default User;