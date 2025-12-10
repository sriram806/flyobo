import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import User from "../models/user.model.js";

const extractToken = (req) => {
    // Cookie
    if (req.cookies?.token) {
        return { token: req.cookies.token, source: "cookie" };
    }

    // Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return { token: authHeader.split(" ")[1], source: "header" };
    }

    // Query param
    if (req.query?.token) {
        return { token: req.query.token, source: "query" };
    }

    return { token: null, source: "none" };
};

/** Simple masking for JWT logging */
const maskToken = (token) => {
    if (!token) return "null";
    return token.length > 10
        ? `${token.slice(0, 6)}...${token.slice(-6)}`
        : token;
};

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    try {
        const { token, source } = extractToken(req);

        const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
        const origin = req.headers.origin || req.headers.referer || "unknown";

        console.log("------ AUTH CHECK START ------");
        console.log("Request Path:", req.originalUrl);
        console.log("Token Source:", source);
        console.log("Masked Token:", maskToken(token));
        console.log("IP:", ip);
        console.log("Origin:", origin);

        if (!token) {
            console.log("❌ No token provided");
            console.log("------ AUTH CHECK END ------");
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, JWT_SECRET);
            console.log("Token Decoded Successfully. User ID:", decoded.id);
        } catch (err) {
            console.error("❌ JWT Verification Error:", err.name);

            const message =
                err.name === "TokenExpiredError"
                    ? "Token expired. Please login again."
                    : err.name === "JsonWebTokenError"
                    ? "Invalid token. Please login again."
                    : "Unauthorized access.";

            console.log("------ AUTH CHECK END ------");
            return res.status(401).json({ success: false, message });
        }

        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            console.log("❌ User not found for ID:", decoded.id);
            console.log("------ AUTH CHECK END ------");
            return res.status(401).json({
                success: false,
                message: "User associated with this token no longer exists.",
            });
        }

        console.log("✔ Authenticated User:", currentUser.email);
        console.log("------ AUTH CHECK END ------");

        req.user = currentUser;
        req.tokenSource = source;

        next();
    } catch (error) {
        console.error("🔥 Authentication middleware error:", error);
        console.log("------ AUTH CHECK END (ERROR) ------");
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication.",
        });
    }
});

export default isAuthenticated;
