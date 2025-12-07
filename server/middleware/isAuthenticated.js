import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import User from "../models/user.model.js";

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    try {
        let token = null;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        const origin = req.headers.origin || req.headers.referer || req.ip || 'unknown';
        const tokenSource = token ? (req.cookies?.token ? "cookie" : "header") : "none";

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided. Please login.",
            });
        }
        

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please login again.",
                });
            } else if (err.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token. Please login again.",
                });
            }
            throw err;
        }

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: "User associated with this token no longer exists.",
            });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication.",
        });
    }
});

export default isAuthenticated;
