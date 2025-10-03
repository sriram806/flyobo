import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';
import { getAllUsersServices } from '../services/user.services.js';

// User Info
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otpExpireAt -resetPasswordOtp -resetPasswordOtpExpireAt');
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
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (name) {
            user.name = name;
        }
        if (phone) {
            user.phone = phone;
        }
        if (bio) {
            user.bio = bio;
        }
        await user.save();
        const safeUser = await User.findById(req.user.id).select('-password -otp -otpExpireAt -resetPasswordOtp -resetPasswordOtpExpireAt');
        res.status(200).json({ success: true, message: "Successful Updated", user: safeUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update USER Avatar
export const updateProfileAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({ success: false, message: "No avatar provided" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.avatar?.public_id) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }

        const uploadResult = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
            crop: "scale",
        });

        user.avatar = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
        };
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user
        });

    } catch (error) {
        console.error("Update avatar error:", error);
        res.status(500).json({ success: false, message: "Failed to update profile picture" });
    }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
  try {
    const targetId = req.params?.id;
    const idToDelete = (targetId && req.user?.role === 'admin') ? targetId : req.user?._id;
    if (!idToDelete) {
      return res.status(400).json({ success: false, message: 'User id is required' });
    }

    const user = await User.findByIdAndDelete(idToDelete);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all users and Access only for admin
export const getAllUsers = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    try {
        const users = await getAllUsersServices();
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}