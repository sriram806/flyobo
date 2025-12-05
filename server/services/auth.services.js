import jwt from "jsonwebtoken";
import {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
} from "../config/env.js";


export const parseExpiryToMs = (expiresIn) => {
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case "s": return value * 1000;
        case "m": return value * 60 * 1000;
        case "h": return value * 60 * 60 * 1000;
        case "d": return value * 24 * 60 * 60 * 1000;
        default: return 7 * 24 * 60 * 60 * 1000;
    }
};

export const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

export const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);
    const cookieDomain = NODE_ENV === "production" ? ".flyobo.com" || "https://admin-five-gold.vercel.app" : undefined;
    const cookieOptions = {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: parseExpiryToMs(JWT_EXPIRES_IN),
        path: "/",
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    };

    res.cookie("token", token, cookieOptions);
    let userObj = user.toObject ? user.toObject() : { ...user };

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
