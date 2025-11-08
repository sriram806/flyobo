import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import isAdmin from '../middleware/isAdmin.js';
import {
    getPendingReferralRewards,
    approveReferralReward,
    markReferralRewardPaid,
    getReferralPayoutReport,
    exportReferralData,
    getEnhancedReferralStats,
    getTopReferrals,
    depositReferralReward,
    getUserReferralHistory
} from '../controllers/referral.admin.controller.js';

const referralAdminRoute = express.Router();

// Admin routes for referral management
referralAdminRoute.get('/pending-rewards', isAuthenticated, isAdmin, getPendingReferralRewards);
referralAdminRoute.post('/approve-reward', isAuthenticated, isAdmin, approveReferralReward);
referralAdminRoute.post('/mark-paid', isAuthenticated, isAdmin, markReferralRewardPaid);
referralAdminRoute.get('/payout-report', isAuthenticated, isAdmin, getReferralPayoutReport);
referralAdminRoute.get('/export', isAuthenticated, isAdmin, exportReferralData);
referralAdminRoute.get('/stats', isAuthenticated, isAdmin, getEnhancedReferralStats);
referralAdminRoute.get('/top-referrals', isAuthenticated, isAdmin, getTopReferrals);
referralAdminRoute.post('/deposit-reward', isAuthenticated, isAdmin, depositReferralReward);
referralAdminRoute.get('/user-history/:userId', isAuthenticated, isAdmin, getUserReferralHistory);

export default referralAdminRoute;