import express from 'express';
import {
    getProfile, updateProfile,
    deleteUserAccount,
    getAllUsers,
    getUserBookings,
    addFavouritePackage,
    removeFavouritePackage,
    changePassword,
    updateAvatar,
    getReferralInfo,
    redeemRewards,
    getReferralLeaderboard,
    getAdminReferralStats,
    getAdminRecentReferrals,
    getAdminReferralUsers,
    getAdminReferralAnalytics,
    adminReferralUserAction,
    getRedeemRequests,
    processRedeemRequest,
    trackShare,
    getReferralAnalytics,
    generateCustomReferralUrlController as generateCustomReferralUrl,
    updateBankDetails,
    getBankDetails
} from '../controllers/user.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { uploadAvatar } from '../middleware/multerConfig.js';

const userRoute = express.Router();

userRoute.get('/profile', isAuthenticated, getProfile);
userRoute.put('/profile', isAuthenticated, updateProfile);
userRoute.put('/profile-avatar', isAuthenticated, uploadAvatar, updateAvatar);
userRoute.put('/change-password', isAuthenticated, changePassword);
userRoute.put('/favourite-packages', isAuthenticated, addFavouritePackage);
userRoute.delete('/favourite-packages/:packageId', isAuthenticated, removeFavouritePackage);
userRoute.delete('/:id', isAuthenticated, deleteUserAccount);

// User bookings
userRoute.get('/my-bookings', isAuthenticated, getUserBookings);

// Referral program routes
userRoute.get('/referral-info', isAuthenticated, getReferralInfo);
userRoute.post('/redeem-rewards', isAuthenticated, redeemRewards);
userRoute.post('/track-share', isAuthenticated, trackShare);
userRoute.get('/referral-analytics', isAuthenticated, getReferralAnalytics);
userRoute.post('/generate-custom-referral-url', isAuthenticated, generateCustomReferralUrl);

// Bank details routes
userRoute.put('/bank-details', isAuthenticated, updateBankDetails);
userRoute.get('/bank-details', isAuthenticated, getBankDetails);

// Admin referral management routes
userRoute.get('/admin/referral-stats', isAuthenticated, getAdminReferralStats);
userRoute.get('/admin/recent-referrals', isAuthenticated, getAdminRecentReferrals);
userRoute.get('/admin/referral-users', isAuthenticated, getAdminReferralUsers);
userRoute.get('/admin/referral-analytics', isAuthenticated, getAdminReferralAnalytics);
userRoute.post('/admin/referral-user-action', isAuthenticated, adminReferralUserAction);

// Admin redeem requests
userRoute.get('/admin/redeem-requests', isAuthenticated, getRedeemRequests);
userRoute.post('/admin/process-redeem', isAuthenticated, processRedeemRequest);

userRoute.get('/referral-leaderboard', getReferralLeaderboard);

// for admin
userRoute.get('/get-all-users', isAuthenticated, getAllUsers);

export default userRoute;