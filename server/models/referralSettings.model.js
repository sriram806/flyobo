import mongoose from "mongoose";

const ReferralSettingsSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },

    referralBonus: {
      type: Number,
      default: 100,
      min: [0, "Referral bonus cannot be negative"],
    },

    signupBonus: {
      type: Number,
      default: 50,
      min: [0, "Signup bonus cannot be negative"],
    },

    minRedeemAmount: {
      type: Number,
      default: 50,
      min: [0, "Minimum redeem amount cannot be negative"],
    },

    maxRedeemAmount: {
      type: Number,
      default: 1,
      min: [0, "Maximum redeem amount cannot be negative"],
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP", "AED"],
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, 
  }
);

// Auto-update updatedAt before saving
ReferralSettingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});


const ReferralSettings = mongoose.model("ReferralSettings", ReferralSettingsSchema);

export default ReferralSettings;
