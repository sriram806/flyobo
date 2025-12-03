import Referral from '../models/referal.model.js';
import ReferralSettings from '../models/referralSettings.model.js';
import User from '../models/user.model.js';
import { generateCode } from '../services/referral.services.js';


export const generateReferralCode = async (req, res) => {
  try {
    const referral = new Referral({
      referrer: req.user._id,
      code: generateCode(),
      status: 'pending',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const savedReferral = await referral.save();
    res.status(201).json(savedReferral);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referred', 'name email')
      .sort('-createdAt');

    res.json(referrals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const applyReferralCode = async (req, res) => {
  try {
    const { code } = req.body;

    const referral = await Referral.findOne({
      code,
      status: 'pending',
      expiryDate: { $gt: new Date() }
    });

    if (!referral) {
      return res.status(400).json({ message: 'Invalid or expired referral code' });
    }

    if (referral.referrer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot use your own referral code' });
    }

    // mark complete
    referral.referred = req.user._id;
    referral.status = 'completed';
    referral.reward = 100;
    await referral.save();

    // add reward to the referrer
    await User.findByIdAndUpdate(referral.referrer, {
      $inc: { rewardPoints: referral.reward }
    });

    res.json({ message: 'Referral code applied successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getReferralStats = async (req, res) => {
  try {
    const stats = await Referral.aggregate([
      {
        $match: { referrer: req.user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalReward: { $sum: '$reward' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getReferralSettings = async (req, res) => {
  try {
    let settings = await ReferralSettings.findOne();
    if (!settings) {
      settings = await ReferralSettings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch referral settings",
      error: error.message,
    });
  }
};