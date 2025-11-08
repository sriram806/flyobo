import mongoose from 'mongoose';

const ReferralSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  referralBonus: { type: Number, default: 100 }, // amount given to referrer when someone signs up with their code
  signupBonus: { type: Number, default: 50 }, // amount given to new user on signup via referral
  minRedeemAmount: { type: Number, default: 50 },
  maxRedeemAmount: { type: Number, default: 10000 },
  currency: { type: String, default: 'INR' },
  updatedAt: { type: Date, default: Date.now }
});

const ReferralSettings = mongoose.models.ReferralSettings || mongoose.model('ReferralSettings', ReferralSettingsSchema);
export default ReferralSettings;
