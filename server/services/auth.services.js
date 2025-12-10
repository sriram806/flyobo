import jwt from "jsonwebtoken";
import {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
} from "../config/env.js";

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

export const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

export const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);

    const nodeEnv = String(NODE_ENV || process.env.NODE_ENV || "").toLowerCase().trim();
    const isProd = nodeEnv === "production";

    let cookieDomain = process.env.COOKIE_DOMAIN || null;

    // Normalize cookieDomain if provided
    if (cookieDomain) {
        // remove leading protocol if someone mis-set it
        cookieDomain = cookieDomain.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];

        // ensure single leading dot for subdomain support
        if (!cookieDomain.startsWith(".")) {
            cookieDomain = `.${cookieDomain}`;
        }

        // don't allow weird double-dot like "..vercel.app"
        cookieDomain = cookieDomain.replace(/^\.+/, ".");
    }

    // If domain ends up useless, drop it
    if (!cookieDomain || cookieDomain === "." || cookieDomain === ".localhost") {
        cookieDomain = undefined;
    }

    // For Vercel + custom domain, sameSite=lax is enough and avoids library issues
    const sameSiteVal = "lax";

    const cookieOptions = {
        httpOnly: true,
        secure: isProd,          // Vercel is always HTTPS in prod
        sameSite: sameSiteVal,   // always "lax" (no "none" to avoid errors)
        maxAge: parseExpiryToMs(JWT_EXPIRES_IN),
        path: "/",
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    };

    try {
        res.cookie("token", token, cookieOptions);
    } catch (cookieErr) {
        console.error(
            "createSendToken: cookie set failed -",
            cookieErr?.message,
            "| Options:",
            JSON.stringify(cookieOptions)
        );
        // In case something bizarre happens, try ultra-simple fallback
        try {
            res.cookie("token", token, {
                httpOnly: true,
                secure: isProd,
                sameSite: "lax",
                maxAge: cookieOptions.maxAge,
                path: "/",
            });
        } catch (err2) {
            console.error("createSendToken: fallback cookie set also failed:", err2?.message);
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
        favoritePackages: userObj.favoritePackages || userObj.favouritePackages || [],
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
