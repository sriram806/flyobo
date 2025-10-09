import User from '../models/user.model.js';
import Booking from '../models/bookings.model.js';
import cloudinary from 'cloudinary';
import { getAllUsersServices } from '../services/user.services.js';

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpireAt -resetPasswordOtp -resetPasswordOtpExpireAt').lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;

    await user.save();

    const safeUser = await User.findById(req.user._id).select('-password -otp -otpExpireAt -resetPasswordOtp -resetPasswordOtpExpireAt').lean();

    res.status(200).json({ success: true, message: 'Successfully updated', user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update User Avatar
export const updateProfileAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) return res.status(400).json({ success: false, message: 'No avatar provided' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.avatar?.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }

    const uploadResult = await cloudinary.v2.uploader.upload(avatar, {
      folder: 'avatar',
      width: 150,
      crop: 'scale',
    });

    user.avatar = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile picture' });
  }
};

// Delete User Account
export const deleteUserAccount = async (req, res) => {
  try {
    const targetId = req.params?.id;
    const idToDelete =
      targetId && req.user?.role === 'admin'
        ? targetId
        : req.user?._id || req.user?.id;

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

// Get User's Bookings
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

// Get All Users (Admin Only)
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

// Add Favourite Package
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

// Remove Favourite Package
export const removeFavouritePackage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { packageId } = req.body;

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
