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
    
    // Enhanced cookie options for better compatibility
    const cookieOptions = {
        httpOnly: true,
        secure: NODE_ENV === "production", // Only use secure in production
        sameSite: NODE_ENV === "production" ? "none" : "lax", // "none" for cross-origin in production
        maxAge: parseExpiryToMs(JWT_EXPIRES_IN),
        path: '/',
        // Don't set domain in production - let browser handle it
    };
    
    console.log('🍪 Setting cookie with options:', {
        ...cookieOptions,
        token: token ? `${token.substring(0, 20)}...` : 'NONE'
    });
    
    // Set cookie
    res.cookie("token", token, cookieOptions);
    
    // Clean user data
    const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAccountVerified: user.isAccountVerified,
        avatar: user.avatar,
        createdAt: user.createdAt
    };
    
    console.log('✅ Token created successfully for user:', user.email);
    
    res.status(statusCode).json({
        success: true,
        message: message,
        token, // Include token in response for client-side storage
        data: {
            user: safeUser
        }
    });
}