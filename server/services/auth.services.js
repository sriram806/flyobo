import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../config/env.js";

export const parseExpiryToMs = (expiresIn) => {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const [_, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
        case 's': return num * 1000;
        case 'm': return num * 60 * 1000;
        case 'h': return num * 60 * 60 * 1000;
        case 'd': return num * 24 * 60 * 60 * 1000;
        default: return num * 1000;
    }
};

export const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

export const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);
    const cookieOptions = {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: parseExpiryToMs(JWT_EXPIRES_IN),
        path: '/',
        domain: NODE_ENV === "production" ? undefined : undefined // Let browser handle domain
    };
    
    // Set cookie
    res.cookie("token", token, cookieOptions);
    
    // Clean user data
    user.password = undefined;
    user.otp = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpireAt = undefined;
    
    res.status(statusCode).json({
        success: true,
        message: message,
        token,
        data: {
            user
        }
    });
}