import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import sendMail from "../config/nodemailer.js";
import { generateOTP } from "../services/otp.services.js";
import { createSendToken } from "../services/auth.services.js";
import { NODE_ENV, FRONTEND_URL } from "../config/env.js";

// 1. Registration
export const registration = async (req, res) => {
  let createdUser;
  try {
    const { name, email, password, referralCode, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    // Validate referral code if provided
    let referrer = null;
    if (referralCode && referralCode.trim()) {
      referrer = await User.findOne({ 'referral.referralCode': referralCode.trim().toUpperCase() });
      if (!referrer) {
        return res.status(400).json({ success: false, message: "Invalid referral code." });
      }
    }

    const otp = generateOTP();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);

    createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user', 
      otp,
      otpExpireAt
    });

    // Apply referral code if provided
    if (referrer) {
      try {
        const { applyReferralCode } = await import('./user.controller.js');
        await applyReferralCode(referralCode.trim().toUpperCase(), createdUser._id);
      } catch (referralError) {
        console.error("Referral application error:", referralError);
        // Continue with registration even if referral fails
      }
    }

    try {
      await sendMail({
        email: createdUser.email,
        subject: "Activate Your Flyobo Travel Account",
        template: "activation",
        data: { otp, name: createdUser.name, email: createdUser.email }
      });
    } catch (mailError) {
      console.error("Mail error:", mailError);
    }

    const message = referrer 
      ? "Registration successful! OTP sent to your email. You've earned ₹50 welcome bonus!"
      : "Registration successful and OTP sent to your email";

    return createSendToken(createdUser, 201, res, message);
  } catch (error) {
    if (createdUser?._id) {
      try {
        await User.findByIdAndDelete(createdUser._id);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
    }
    return res.status(500).json({ success: false, message: "Server error during registration.", error: error.message });
  }
};

// 2. Verify OTP
export const VerifyOTP = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ success: false, message: "Please provide otp" });
  }

  const user = req.user;
  try {
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid otp" });
    }
    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }
    if (!user.otpExpireAt || user.otpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Otp expired" });
    }

    user.isAccountVerified = true;
    user.otp = undefined;
    user.otpExpireAt = undefined;
    await user.save({ validateBeforeSave: false });

    return createSendToken(user, 200, res, "Account verified successfully");
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during verification" });
  }
}

// 3. Resend OTP
export const ResendOTP = async (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(authUser._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const newOtp = generateOTP();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpireAt = otpExpireAt;
    await user.save({ validateBeforeSave: false });

    try {
      await sendMail({
        email: user.email,
        subject: "Resend OTP for Verify Your Flyobo Account",
        template: "activation",
        data: { otp: newOtp, name: user.name, email: user.email }
      });
    } catch (mailError) {
      console.error("Mail error:", mailError);
    }

    return res.status(200).json({ success: true, message: "Otp resent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during resend" });
  }
}

// 4. Login 
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid User" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    }

    user.password = undefined;
    createSendToken(user, 200, res, "Login successful");
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in login" });
  }
};

// 5. Logout
export const logout = async (req, res) => {
  try {
    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      path: '/'
    };

    res.cookie("token", "", cookieOptions);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// 6. Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetPasswordOtp = generateOTP();
    const resetPasswordOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOtp = resetPasswordOtp;
    user.resetPasswordOtpExpireAt = resetPasswordOtpExpireAt;
    await user.save({ validateBeforeSave: false });

    try {
      await sendMail({
        email: user.email,
        subject: "Reset Your Flyobo Account Password",
        template: "reset-password",
        data: { otp: resetPasswordOtp, name: user.name, email: user.email }
      });
    } catch (mailError) {
      console.error("Mail error:", mailError);
    }

    return res.status(200).json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during password reset" });
  }
}

// 7. Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!otp || !password) {
      return res.status(400).json({ success: false, message: "Please provide otp and password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid otp" });
    }
    if (!user.resetPasswordOtpExpireAt || user.resetPasswordOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Otp expired" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpireAt = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during password reset" });
  }
}

