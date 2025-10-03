import User from "../models/user.model.js";

export const getUserById = async (id, res) => {
    const user = await User.findById(id).select('-password -otp -otpExpireAt -resetPasswordOtp -resetPasswordOtpExpireAt -__v');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
};

export const getAllUsersServices = async () => {
    const users = await User.find()
        .sort({ createdAt: -1 })
        .select('_id name email phone role createdAt updatedAt');
    return users;
};

export const updateUserRoleService = async (res, id, role) => {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true })
        .select('_id name email phone role createdAt updatedAt');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
};