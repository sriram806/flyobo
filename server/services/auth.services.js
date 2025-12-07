import jwt from "jsonwebtoken";
import {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
} from "../config/env.js";


// Convert "7d" → milliseconds
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


// Sign JWT
export const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};


// Create & Send Cookie + Token
export const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);

    // Normalize NODE_ENV - handle any string value safely
    const nodeEnv = String(NODE_ENV || process.env.NODE_ENV || '').toLowerCase().trim();
    const isProd = nodeEnv === "production";

    let cookieDomainRaw = process.env.COOKIE_DOMAIN || process.env.FRONTEND_URL || null;
    let cookieDomain;
    try {
        if (cookieDomainRaw) {
            const host = cookieDomainRaw.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
            // Do not set domain for localhost or raw IP addresses — browsers reject these and won't store cookies
            const isLocalhost = host === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
            if (!isLocalhost) {
                cookieDomain = host.startsWith('www.') ? `.${host.replace(/^www\./, '')}` : `.${host}`;
            } else {
                cookieDomain = undefined;
            }
        } else if (isProd) {
            cookieDomain = '.flyobo.com';
        }
    } catch (e) {
        cookieDomain = undefined;
    }

    let sameSiteVal = 'lax';
    if (isProd && cookieDomain) {
        sameSiteVal = 'none';
    }

    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: sameSiteVal,
        maxAge: parseExpiryToMs(JWT_EXPIRES_IN),
        path: "/",
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    };

    try {
        res.cookie("token", token, cookieOptions);
    } catch (cookieErr) {
        console.error('createSendToken: cookie set failed -', cookieErr?.message, '| Options:', JSON.stringify(cookieOptions));
        // Safe fallback that should always work
        try {
            const fallback = { 
                httpOnly: true, 
                secure: isProd, 
                sameSite: 'lax', 
                maxAge: cookieOptions.maxAge, 
                path: '/' 
            };
            res.cookie("token", token, fallback);
        } catch (err2) {
            console.error('createSendToken: fallback cookie set also failed:', err2?.message);
        }
    }

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
