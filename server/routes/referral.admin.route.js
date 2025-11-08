import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import isAdmin from '../middleware/isAdmin.js';
import {
  getReferralSettings,
  updateReferralSettings
} from '../controllers/referralSettings.controller.js';
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

const router = express.Router();

/* ===============================
   📌 USER & ADMIN REFERRAL SETTINGS
   =============================== */

// Get referral settings (any authenticated user)
router.get('/settings', isAuthenticated, getReferralSettings);

// Update referral settings (admin only)
router.put('/settings', isAuthenticated, isAdmin, updateReferralSettings);


/* ===============================
   👑 ADMIN REFERRAL MANAGEMENT
   =============================== */

// Get all pending referral rewards (admin only)
router.get('/pending-rewards', isAuthenticated, isAdmin, getPendingReferralRewards);

// Approve a referral reward (admin only)
router.post('/approve-reward', isAuthenticated, isAdmin, approveReferralReward);

// Mark a referral reward as paid (admin only)
router.post('/mark-paid', isAuthenticated, isAdmin, markReferralRewardPaid);

// Get payout reports for referrals (admin only)
router.get('/payout-report', isAuthenticated, isAdmin, getReferralPayoutReport);

// Export referral data (admin only)
router.get('/export', isAuthenticated, isAdmin, exportReferralData);

// Enhanced analytics & statistics for referral performance
router.get('/stats', isAuthenticated, isAdmin, getEnhancedReferralStats);

// Fetch top referrals for leaderboard display
router.get('/top-referrals', isAuthenticated, isAdmin, getTopReferrals);

// Deposit reward manually to a referral user
router.post('/deposit-reward', isAuthenticated, isAdmin, depositReferralReward);

// Get specific user's referral history
router.get('/user-history/:userId', isAuthenticated, isAdmin, getUserReferralHistory);


export default router;
