import User from "../models/user.model.js";
import Package from '../models/package.model.js';
import mongoose from 'mongoose';
import { 
  trackSocialShare, 
  getUserReferralAnalytics, 
  generateCustomReferralUrl,
  getReferralLeaderboard as getReferralLeaderboardService
} from "../services/referral.services.js";

import Booking from '../models/bookings.model.js';
import { getAllUsersServices } from '../services/user.services.js';
import bcrypt from 'bcryptjs';
import { sendRewardRedemptionNotification } from "../services/notification.services.js";
import ReferralSettings from '../models/referralSettings.model.js';

// 1. Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpireAt -resetPasswordOtp -resetPasswordOtpExpireAt');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;

    await user.save();

    const safeUser = await User.findById(req.user._id).select('-password -otp -otpExpireAt -resetPasswordOtp -resetPasswordOtpExpireAt');

    res.status(200).json({ success: true, message: 'Successfully updated', user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Delete User Account
export const deleteUserAccount = async (req, res) => {
  try {
    const targetId = req.params?.id;
    const idToDelete = targetId && req.user?.role === 'admin' ? targetId : req.user?._id || req.user?.id;

    if (!idToDelete) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findByIdAndDelete(idToDelete);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Get All Users (Admin Only)
export const getAllUsers = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    const users = await getAllUsersServices();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get User's Bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, sortBy = 'createdAt' } = req.query;

    const limitNum = Number(limit) || 10;
    const skip = (Number(page) - 1) * limitNum;

    let query = { userId };
    if (status && status !== 'all') query.status = status;

    let sortOptions = {};
    switch (sortBy) {
      case 'startDate':
        sortOptions = { startDate: -1 };
        break;
      case 'amount':
        sortOptions = { totalAmount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'packageId',
        select: 'title description price estimatedPrice duration destination images Status',
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Booking.countDocuments(query);

    const totalSpent = await Booking.aggregate([
      { $match: { userId, 'payment_info.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const completedBookings = await Booking.countDocuments({ userId, status: 'completed' });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: Number(page),
          totalPages: Math.ceil(total / limitNum),
          count: bookings.length,
          totalItems: total,
        },
        statistics: {
          totalBookings: total,
          completedBookings,
          totalSpent: totalSpent[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user bookings', error: error.message });
  }
};

// 7. Change Password While Logged in
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide old and new password" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during password change" });
  }
}

// 8. Add Favourite Package
export const addFavouritePackage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { packageId } = req.body;

    if (!packageId) return res.status(400).json({ success: false, message: 'Package ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.favoritePackages) user.favoritePackages = [];

    // Resolve packageId: accept ObjectId, slug, or title
    let pkg = null;
    if (mongoose.Types.ObjectId.isValid(String(packageId))) {
      pkg = await Package.findById(packageId);
    }
    if (!pkg) {
      const maybeSlug = String(packageId).toLowerCase();
      pkg = await Package.findOne({ slug: maybeSlug }) || await Package.findOne({ title: packageId });
    }
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const pkgIdStr = String(pkg._id);
    if (user.favoritePackages.some(id => String(id) === pkgIdStr)) {
      return res.status(400).json({ success: false, message: 'Package already in favourites' });
    }

    user.favoritePackages.push(pkg._id);
    await user.save();

    await user.populate('favoritePackages', 'title price destination images');

    res.status(200).json({
      success: true,
      message: 'Package added to favourites',
      favoritePackages: user.favoritePackages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 8. Remove Favourite Package
export const removeFavouritePackage = async (req, res) => {
  try {
    const userId = req.user._id;
    const packageId = req.params.packageId || req.body.packageId;

    if (!packageId) return res.status(400).json({ success: false, message: 'Package ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Resolve package identifier (accept slug/title or ObjectId)
    let pkg = null;
    if (mongoose.Types.ObjectId.isValid(String(packageId))) {
      pkg = await Package.findById(packageId);
    }
    if (!pkg) {
      const maybeSlug = String(packageId).toLowerCase();
      pkg = await Package.findOne({ slug: maybeSlug }) || await Package.findOne({ title: packageId });
    }
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const pkgIdStr = String(pkg._id);
    if (!user.favoritePackages || !user.favoritePackages.some(id => String(id) === pkgIdStr)) {
      return res.status(400).json({ success: false, message: 'Package not found in favourites' });
    }

    user.favoritePackages = user.favoritePackages.filter((id) => String(id) !== pkgIdStr);
    await user.save();

    await user.populate('favoritePackages', 'title price destination images');

    res.status(200).json({
      success: true,
      message: 'Package removed from favourites',
      favoritePackages: user.favoritePackages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ===== REFERRAL PROGRAM FUNCTIONS =====

// Get referral information
export const getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('referral.referredUsers.user', 'name email')
      .select('referral name email reward');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const referralStats = {
      referralCode: user.referral.referralCode,
      totalReferrals: user.referral.totalReferrals,
      totalReward: user.reward || 0,
      referredUsers: user.referral.referredUsers,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${user.referral.referralCode}`
    };

    res.status(200).json({
      success: true,
      data: referralStats
    });
  } catch (error) {
    console.error('Get referral info error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Apply referral code during signup
export const applyReferralCode = async (referralCode, newUserId) => {
  try {
    const referrer = await User.findOne({ 'referral.referralCode': referralCode });
    
    if (!referrer) {
      return { success: false, message: 'Invalid referral code' };
    }

    const newUser = await User.findById(newUserId);
    if (!newUser) {
      return { success: false, message: 'New user not found' };
    }

    // Set referrer for new user
    newUser.referral.referredBy = referrer._id;

    // Load referral settings (use defaults if not set)
    const settings = await ReferralSettings.findOne({}) || {};
    const referralBonus = typeof settings.referralBonus === 'number' ? settings.referralBonus : 100;
    const signupBonus = typeof settings.signupBonus === 'number' ? settings.signupBonus : 50;

    // Add new user to referrer's referred users
    referrer.referral.referredUsers.push({
      user: newUserId,
      joinedAt: new Date(),
    });

    // Increment referrer's total referrals and reward
    referrer.referral.totalReferrals += 1;
    referrer.reward = (referrer.reward || 0) + referralBonus;

    // Give signup bonus to new user
    newUser.reward = (newUser.reward || 0) + signupBonus;

    await referrer.save();
    await newUser.save();

    return { success: true, message: 'Referral applied successfully' };
  } catch (error) {
    console.error('Apply referral code error:', error);
    return { success: false, message: 'Error applying referral code' };
  }
};

// Get referral leaderboard
export const getReferralLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await getReferralLeaderboardService(parseInt(limit));
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Bank details update
export const updateBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, bankName, ifscCode } = req.body;
    
    if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'All bank details are required'
      });
    }
    
    if (!/^\d+$/.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Account number should contain only digits'
      });
    }
    
    if (!/^[A-Z0-9]{11}$/.test(ifscCode.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'IFSC code should be 11 characters alphanumeric'
      });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.bankDetails = {
      accountHolderName,
      accountNumber,
      bankName,
      ifscCode: ifscCode.toUpperCase()
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Bank details updated successfully',
      data: user.bankDetails
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user bank details
export const getBankDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('bankDetails');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.bankDetails
    });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

