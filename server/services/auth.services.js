import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, FRONTEND_URL } from "../config/env.js";

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
    // Derive a cookie domain when frontend is deployed on a sibling host (e.g. www.flyobo.com)
    let cookieDomain;
    try {
        const raw = process.env.COOKIE_DOMAIN || FRONTEND_URL;
        if (raw) {
            // strip protocol and path
            const host = raw.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
            // ensure cookie is set for root domain (example: .flyobo.com)
            cookieDomain = host.startsWith('www.') ? `.${host.replace(/^www\./, '')}` : `.${host}`;
        }
    } catch (e) {
        cookieDomain = undefined;
    }

    const cookieOptions = {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: parseExpiryToMs(JWT_EXPIRES_IN),
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    };
    res.cookie("token", token, cookieOptions);
    const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAccountVerified: user.isAccountVerified,
        avatar: user.avatar,
        createdAt: user.createdAt
    };
    res.status(statusCode).json({
        success: true,
        message: message,
        token, 
        data: {
            user: safeUser
        }
    });
}