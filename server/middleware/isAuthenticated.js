import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import User from "../models/user.model.js";

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    try {
        let token = null;
        
        // Strategy 1: Try to get token from cookies (primary method)
        token = req.cookies.token;
        console.log('🍪 Cookie token:', token ? 'PRESENT' : 'NONE');
        
        // Strategy 2: Try Authorization header (fallback)
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                console.log('🔑 Bearer token:', token ? 'PRESENT' : 'NONE');
            }
        }
        
        // Strategy 3: Try custom auth header (additional fallback)
        if (!token && req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
            console.log('🎫 Custom auth token:', token ? 'PRESENT' : 'NONE');
        }
        
        if (!token) {
            console.log('❌ No token found in request:', {
                cookies: Object.keys(req.cookies || {}),
                authHeader: req.headers.authorization ? 'PRESENT' : 'NONE',
                origin: req.headers.origin,
                userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
            });
            
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. No token provided. Please login." 
            });
        }
        
        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    message: "Token expired. Please login again." 
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid token. Please login again." 
                });
            }
            throw jwtError;
        }

        // Find the user
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ 
                success: false, 
                message: "User associated with this token no longer exists." 
            });
        }

        // Attach user to request
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