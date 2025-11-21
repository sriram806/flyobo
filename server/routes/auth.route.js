import express from 'express';
import {
  registration, login, logout, VerifyOTP,
  ResendOTP, forgotPassword, resetPassword,
  googleRedirect, googleCallback,
  githubRedirect, githubCallback,
  debugCookieInfo
} from "../controllers/auth.controller.js";
import isAuthenticated from '../middleware/isAuthenticated.js';

const authRoute = express.Router();

authRoute.post('/register', registration);
authRoute.post('/verify-otp', isAuthenticated, VerifyOTP);
authRoute.post('/resend-otp', isAuthenticated, ResendOTP);
authRoute.post('/login', login);
// Debug route to inspect cookie settings
authRoute.get('/debug/cookie-info', debugCookieInfo);
// Allow logout to be called even when the client doesn't have a valid session/token
// so the server can clear any cookies. Do not require authentication middleware here.
authRoute.post('/logout', logout);
authRoute.post('/forgot-password', forgotPassword);
authRoute.post('/reset-password', resetPassword);

// Server-side OAuth endpoints handled in controller
authRoute.get('/oauth/google', googleRedirect);
authRoute.get('/oauth/google/callback', googleCallback);
authRoute.get('/oauth/github', githubRedirect);
authRoute.get('/oauth/github/callback', githubCallback);

export default authRoute;
