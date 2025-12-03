import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { createSendToken } from "../services/auth.services.js";
import ReferralSettings from "../models/referralSettings.model.js";

export const adminLogin = async (req, res) => {
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

    if (!user.isAccountVerified) {
        return res.status(403).json({ success:false, message: "Account not verified. Please check your email for verification link." });
    }

    if (user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }
    user.password = undefined;
    createSendToken(user, 200, res, "Login successful");
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in login" });
  }
};

export const adminCreateUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email and password are required" });
  }

  // Require authentication + admin role for creating users
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in as admin" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isAccountVerified: true
    });

    user.password = undefined;
    return res.status(201).json({ success: true, message: "User created successfully", data: user });
  } catch (error) {
    console.error("adminCreateUser error:", error);
    return res.status(500).json({ success: false, message: "Error creating user" });
  }
};

export const adminDeleteUser = async (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in as admin" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
  }

  if (!id) {
    return res.status(400).json({ success: false, message: "User id is required" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const requesterId = (req.user.id || req.user._id || "").toString();
    if (user._id.toString() === requesterId) {
      return res.status(400).json({ success: false, message: "Admins cannot delete their own account" });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("adminDeleteUser error:", error);
    return res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

export const adminChangePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in as admin" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
  }

  if (!id || !newPassword) {
    return res.status(400).json({ success: false, message: "User id and newPassword are required" });
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "newPassword must be a string with at least 6 characters" });
  }

  try {
    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    user.password = undefined;
    return res.status(200).json({ success: true, message: "Password updated successfully", data: user });
  } catch (error) {
    console.error("adminChangePassword error:", error);
    return res.status(500).json({ success: false, message: "Error updating password" });
  }
};

export const adminEditUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, isAccountVerified, password } = req.body;

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in as admin" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
  }

  if (!id) {
    return res.status(400).json({ success: false, message: "User id is required" });
  }

  if (password && (typeof password !== "string" || password.length < 6)) {
    return res.status(400).json({ success: false, message: "Password must be a string with at least 6 characters" });
  }

  if (role && !["user", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  // parse isAccountVerified if provided
  let parsedVerified;
  if (typeof isAccountVerified !== "undefined") {
    if (typeof isAccountVerified === "boolean") {
      parsedVerified = isAccountVerified;
    } else if (typeof isAccountVerified === "string") {
      const low = isAccountVerified.toLowerCase();
      if (low === "true") parsedVerified = true;
      else if (low === "false") parsedVerified = false;
      else return res.status(400).json({ success: false, message: "isAccountVerified must be boolean" });
    } else {
      return res.status(400).json({ success: false, message: "isAccountVerified must be boolean" });
    }
  }

  try {
    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent admin from demoting themselves
    const requesterId = (req.user.id || req.user._id || "").toString();
    if (requesterId === user._id.toString() && role && role !== "admin") {
      return res.status(400).json({ success: false, message: "Admins cannot remove their own admin role" });
    }

    // If email is changing, ensure uniqueness
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== id) {
        return res.status(409).json({ success: false, message: "User with this email already exists" });
      }
      user.email = email;
    }

    if (typeof name !== "undefined") user.name = name;
    if (typeof role !== "undefined") user.role = role;
    if (typeof parsedVerified !== "undefined") user.isAccountVerified = parsedVerified;

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    user.password = undefined;
    return res.status(200).json({ success: true, message: "User updated successfully", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating user" });
  }
};

export const adminEditRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in as admin" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
  }

  if (!id || !role) {
    return res.status(400).json({ success: false, message: "User id and role are required" });
  }

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const requesterId = (req.user.id || req.user._id || "").toString();
    if (requesterId === user._id.toString() && role !== "admin") {
      return res.status(400).json({ success: false, message: "Admins cannot remove their own admin role" });
    }

    if (user.role === role) {
      user.password = undefined;
      return res.status(200).json({ success: true, message: "Role unchanged", data: user });
    }

    user.role = role;
    await user.save();

    user.password = undefined;
    return res.status(200).json({ success: true, message: "Role updated successfully", data: user });
  } catch (error) {
    console.error("adminEditRole error:", error);
    return res.status(500).json({ success: false, message: "Error updating role" });
  }
};

export const updateReferralSettings = async (req, res) => {
  try {
    const {
      enabled,
      referralBonus,
      signupBonus,
      minRedeemAmount,
      maxRedeemAmount,
      currency,
    } = req.body;

    // Update settings (there will always be 1 document)
    const settings = await ReferralSettings.findOneAndUpdate(
      {},
      {
        enabled,
        referralBonus,
        signupBonus,
        minRedeemAmount,
        maxRedeemAmount,
        currency,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Referral settings updated successfully",
      settings,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update referral settings",
      error: error.message,
    });
  }
};
