import User from "../models/user.model.js";
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

    if (user.favoritePackages.includes(packageId)) {
      return res.status(400).json({ success: false, message: 'Package already in favourites' });
    }

    user.favoritePackages.push(packageId);
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

    if (!user.favoritePackages || !user.favoritePackages.includes(packageId)) {
      return res.status(400).json({ success: false, message: 'Package not found in favourites' });
    }

    user.favoritePackages = user.favoritePackages.filter(
      (id) => id.toString() !== packageId.toString()
    );
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

// Update User Avatar
export const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No avatar file provided' });
    }

    // Delete old avatar if exists
    if (user.avatar && user.avatar.includes('/uploads/')) {
      const { getFilenameFromUrl, deleteFile } = await import('../middleware/multerConfig.js');
      const oldFilename = getFilenameFromUrl(user.avatar);
      if (oldFilename) {
        const path = await import('path');
        const oldFilePath = path.join(process.cwd(), 'uploads', 'avatars', oldFilename);
        deleteFile(oldFilePath);
      }
    }

    // Set new avatar
    const { getFileUrl } = await import('../middleware/multerConfig.js');
    user.avatar = getFileUrl(req, req.file.filename, 'avatars');
    await user.save();

    const updatedUser = await User.findById(req.user._id).select('-password -otp -otpExpireAt -resetPasswordOtp -resetPasswordOtpExpireAt');

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ===== REFERRAL PROGRAM FUNCTIONS =====

// Get referral information
export const getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('referral.referredUsers.user', 'name email createdAt')
      .select('referral name email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const referralStats = {
      referralCode: user.referral.referralCode,
      totalReferrals: user.referral.totalReferrals,
      totalRewards: user.referral.totalRewards,
      availableRewards: user.referral.availableRewards,
      referredUsers: user.referral.referredUsers,
      rewardHistory: user.referral.rewardHistory,
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
      rewardAmount: referralBonus,
    });

    referrer.referral.totalReferrals += 1;
    referrer.referral.availableRewards += referralBonus;
    referrer.referral.totalRewards += referralBonus;

    // Add reward to referrer's history
    referrer.referral.rewardHistory.push({
      type: 'referral_bonus',
      amount: referralBonus,
      description: `Referral bonus for inviting ${newUser.name}`,
      status: 'credited'
    });

    // Give signup bonus to new user
    newUser.referral.availableRewards += signupBonus;
    newUser.referral.totalRewards += signupBonus;
    newUser.referral.rewardHistory.push({
      type: 'signup_bonus',
      amount: signupBonus,
      description: 'Welcome bonus for joining via referral',
      status: 'credited'
    });

    await referrer.save();
    await newUser.save();

    return { success: true, message: 'Referral applied successfully' };
  } catch (error) {
    console.error('Apply referral code error:', error);
    return { success: false, message: 'Error applying referral code' };
  }
};

// Redeem rewards
export const redeemRewards = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (amount > user.referral.availableRewards) {
      return res.status(400).json({ success: false, message: 'Insufficient rewards balance' });
    }

    // Check min redeem amount from settings
    const settings = await ReferralSettings.findOne({}) || {};
    const minRedeem = typeof settings.minRedeemAmount === 'number' ? settings.minRedeemAmount : 50;
    const maxRedeem = typeof settings.maxRedeemAmount === 'number' ? settings.maxRedeemAmount : 10000;

    if (amount < minRedeem) {
      return res.status(400).json({ success: false, message: `Minimum redemption amount is ₹${minRedeem}` });
    }
    if (amount > maxRedeem) {
      return res.status(400).json({ success: false, message: `Maximum redemption amount is ₹${maxRedeem}` });
    }

    // Check if user has bank details
    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please update your bank details before redeeming rewards',
        requiresBankDetails: true
      });
    }

    if (!user.isAccountVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'You need to verify your account before redeeming rewards',
        requiresBankVerification: true
      });
    }

    // Deduct available rewards and create a pending redemption request
    user.referral.availableRewards -= amount;

    const historyEntry = {
      type: 'redeem',
      amount: amount,
      description: `Redeem request for ₹${amount}`,
      status: 'pending',
      requestedAt: new Date()
    };

    user.referral.rewardHistory.push(historyEntry);

    await user.save();

    // Notify admins or user (implement sendRewardRedemptionNotification to inform admins if desired)
    await sendRewardRedemptionNotification(user._id, amount);

    res.status(200).json({
      success: true,
      message: `Redeem request submitted for ₹${amount}. Awaiting admin approval.`,
      availableRewards: user.referral.availableRewards,
      request: historyEntry
    });
  } catch (error) {
    console.error('Redeem rewards error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Admin: list pending redeem requests across users
export const getRedeemRequests = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    // Find users that have pending redeem entries
    const users = await User.find({ 'referral.rewardHistory.status': 'pending' })
      .select('name email referral')
      .lean();

    const requests = [];
    users.forEach((u) => {
      const pending = (u.referral?.rewardHistory || []).filter((h) => h.status === 'pending');
      pending.forEach((h) => {
        requests.push({
          userId: u._id,
          name: u.name,
          email: u.email,
          amount: h.amount,
          description: h.description,
          requestedAt: h.requestedAt || h.createdAt || null,
          historyId: h._id,
        });
      });
    });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('Get redeem requests error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Admin: process a redeem request (approve or reject)
export const processRedeemRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const { userId, historyId, action, depositReference, adminNote } = req.body;
    if (!userId || !historyId || !action) {
      return res.status(400).json({ success: false, message: 'userId, historyId and action are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const entry = user.referral?.rewardHistory?.id(historyId);
    if (!entry) return res.status(404).json({ success: false, message: 'Redeem request not found' });
    if (entry.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });

    if (action === 'approve') {
      entry.status = 'paid';
      entry.processedAt = new Date();
      entry.processedBy = req.user._id;
      entry.depositReference = depositReference || null;
      entry.adminNote = adminNote || null;

      await user.save();

      // Optionally notify user about payment
      // await sendPaymentProcessedNotification(user._id, entry.amount);

      return res.status(200).json({ success: true, message: 'Redeem request approved and marked as paid', entry });
    }

    if (action === 'reject') {
      entry.status = 'rejected';
      entry.processedAt = new Date();
      entry.processedBy = req.user._id;
      entry.adminNote = adminNote || null;

      // Return amount back to user's availableRewards
      user.referral.availableRewards = (user.referral.availableRewards || 0) + (entry.amount || 0);

      await user.save();

      // Optionally notify user about rejection
      // await sendPaymentRejectedNotification(user._id, entry.amount);

      return res.status(200).json({ success: true, message: 'Redeem request rejected and amount returned to user', entry, availableRewards: user.referral.availableRewards });
    }

    return res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error('Process redeem request error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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

// Advanced Admin Referral Management Functions

export const getAdminReferralStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const users = await User.find({
      createdAt: { $gte: startDate }
    });

    const totalReferrals = users.reduce((sum, user) => sum + user.referral.totalReferrals, 0);
    const activeReferrers = users.filter(user => user.referral.totalReferrals > 0).length;
    const totalRewards = users.reduce((sum, user) => sum + user.referral.totalRewards, 0);
    const totalUsers = users.length;
    const conversionRate = totalUsers > 0 ? ((totalReferrals / totalUsers) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        activeReferrers,
        totalRewards,
        conversionRate: parseFloat(conversionRate),
        totalUsers
      }
    });
  } catch (error) {
    console.error('Get admin referral stats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get admin recent referrals activity
export const getAdminRecentReferrals = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    // Find users who have referred users recently
    const recentReferrals = await User.find({
      'referral.referredUsers': { $exists: true, $ne: [] }
    })
      .select('name email referral')
      // populate the referred user info to get referee name/email when available
      .populate({ path: 'referral.referredUsers.user', select: 'name email' })
      .limit(parseInt(limit) * 3); // fetch more to allow for sorting across users

    // Extract and format referral activities from referredUsers subdocs
    const referralActivities = [];

    recentReferrals.forEach(user => {
      const referred = user.referral?.referredUsers || [];
      referred.forEach(activity => {
        referralActivities.push({
          referrerName: user.name,
          referrerEmail: user.email,
          refereeName: activity.user?.name || activity.refereeName || 'Pending',
          refereeEmail: activity.user?.email || activity.refereeEmail || 'Not registered',
          status: activity.conversionStatus || 'pending',
          reward: activity.rewardAmount || 0,
          date: activity.joinedAt || activity.firstBookingDate || new Date(),
          activityId: activity._id
        });
      });
    });

    // Sort by date (most recent first) and limit
    referralActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedActivities = referralActivities.slice(0, parseInt(limit));

    res.status(200).json({ success: true, data: limitedActivities });
  } catch (error) {
    console.error('Get admin recent referrals error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getAdminReferralUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'referral.referralCode': { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query['referral.totalReferrals'] = { $gt: 0 };
      query['referral.isReferralActive'] = true;
    } else if (status === 'inactive') {
      query['referral.isReferralActive'] = false;
    } else if (status === 'high-performer') {
      query['referral.totalReferrals'] = { $gte: 5 };
    }

    const users = await User.find(query)
      .select('name email referral createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'referral.totalReferrals': -1 });

    const total = await User.countDocuments(query);

    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referral.referralCode,
      referralCount: user.referral.totalReferrals,
      totalEarnings: user.referral.totalRewards,
      isActive: user.referral.isReferralActive,
      createdAt: user.createdAt,
      referralTier: user.referral.referralTier,
      conversionRate: user.referral.referralStats?.conversionRate || 0
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get admin referral users error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getAdminReferralAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const users = await User.find({
      createdAt: { $gte: startDate }
    });

    // Calculate analytics
    const totalUsers = users.length;
    const activeReferrers = users.filter(u => u.referral.totalReferrals > 0);
    const totalReferrals = users.reduce((sum, u) => sum + u.referral.totalReferrals, 0);
    const totalRewards = users.reduce((sum, u) => sum + u.referral.totalRewards, 0);
    const totalClicks = users.reduce((sum, u) => sum + (u.referral.referralStats?.totalClicks || 0), 0);
    const totalSignups = users.reduce((sum, u) => sum + (u.referral.referralStats?.totalSignups || 0), 0);
    const totalConversions = users.reduce((sum, u) => sum + (u.referral.referralStats?.totalConversions || 0), 0);

    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;
    const avgReferralsPerUser = activeReferrers.length > 0 ? (totalReferrals / activeReferrers.length).toFixed(1) : 0;
    const revenuePerReferral = totalConversions > 0 ? (totalRewards / totalConversions).toFixed(2) : 0;
    const programROI = totalRewards > 0 ? (((totalRewards * 2) - totalRewards) / totalRewards * 100).toFixed(1) : 0;

    // Top performers
    const topPerformers = users
      .filter(u => u.referral.totalReferrals > 0)
      .sort((a, b) => b.referral.totalReferrals - a.referral.totalReferrals)
      .slice(0, 10)
      .map(u => ({
        name: u.name,
        email: u.email,
        referralCount: u.referral.totalReferrals,
        conversionRate: u.referral.referralStats?.conversionRate || 0,
        revenueGenerated: u.referral.referralStats?.revenueGenerated || 0,
        rewardsEarned: u.referral.totalRewards
      }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          conversionRate: parseFloat(conversionRate),
          avgReferralsPerUser: parseFloat(avgReferralsPerUser),
          revenuePerReferral: parseFloat(revenuePerReferral),
          programROI: parseFloat(programROI),
          linksShared: totalClicks,
          linkClicks: totalClicks,
          signups: totalSignups,
          conversions: totalConversions
        },
        topPerformers,
        trends: {
          conversionRate: Math.random() * 10 - 5, // Mock trend data
          avgReferralsPerUser: Math.random() * 2 - 1,
          revenuePerReferral: Math.random() * 50 - 25,
          programROI: Math.random() * 20 - 10
        }
      }
    });
  } catch (error) {
    console.error('Get admin referral analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const adminReferralUserAction = async (req, res) => {
  try {
    const { userId, action } = req.body;
    
    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        message: 'User ID and action are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    switch (action) {
      case 'activate':
        user.referral.isReferralActive = true;
        break;
      case 'deactivate':
        user.referral.isReferralActive = false;
        break;
      case 'reset_rewards':
        user.referral.availableRewards = 0;
        user.referral.rewardHistory = [];
        break;
      case 'upgrade_tier':
        const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
        const currentTierIndex = tiers.indexOf(user.referral.referralTier);
        if (currentTierIndex < tiers.length - 1) {
          user.referral.referralTier = tiers[currentTierIndex + 1];
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${action} successful`
    });
  } catch (error) {
    console.error('Admin referral user action error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Track social sharing for referral link
export const trackShare = async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required'
      });
    }

    const result = await trackSocialShare(req.user._id, platform);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Track share error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get detailed referral analytics
export const getReferralAnalytics = async (req, res) => {
  try {
    const result = await getUserReferralAnalytics(req.user._id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get referral analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Generate custom referral URL
export const generateCustomReferralUrlController = async (req, res) => {
  try {
    const { customUrl } = req.body;
    
    if (!customUrl) {
      return res.status(400).json({
        success: false,
        message: 'Custom URL is required'
      });
    }

    const result = await generateCustomReferralUrl(req.user._id, customUrl);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Generate custom referral URL error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// Bank details sairam!
// Update user bank details
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

