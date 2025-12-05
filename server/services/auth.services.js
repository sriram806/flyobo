import jwt from "jsonwebtoken";
import {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
} from "../config/env.js";


// -----------------------------
// Convert "7d" → milliseconds
// -----------------------------
export const parseExpiryToMs = (expiresIn) => {
    const def = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (!expiresIn || typeof expiresIn !== "string") return def;

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return def;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case "s": return value * 1000;
        case "m": return value * 60 * 1000;
        case "h": return value * 60 * 60 * 1000;
        case "d": return value * 24 * 60 * 60 * 1000;
        default: return def;
    }
};


// -----------------------------
// Sign JWT
// -----------------------------
export const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};


// -----------------------------
// Create & Send Cookie + Token
// -----------------------------
export const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);

    const isProd = NODE_ENV === "production";
    
    const cookieOptions = {
        httpOnly: true,
        secure: isProd,                           
        sameSite: isProd ? "none" : "lax",       
        maxAge: parseExpiryToMs(JWT_EXPIRES_IN), 
        path: "/",
    };

    // Set cookie
    res.cookie("token", token, cookieOptions);

    // Prepare sanitized user object
    const userObj = user.toObject ? user.toObject() : { ...user };

    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpireAt;
    delete userObj.resetPasswordOtp;
    delete userObj.resetPasswordOtpExpireAt;

    const safeUser = {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        isAccountVerified: userObj.isAccountVerified,
        avatar: userObj.avatar,
        createdAt: userObj.createdAt,
        phone: userObj.phone || null,
        bio: userObj.bio || null,
        referral: userObj.referral || null,
        bankDetails: userObj.bankDetails || null,
    };

    return res.status(statusCode).json({
        success: true,
        message,
        token,
        data: { user: safeUser },
    });
};
