import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { generateReferralCode, getReferralSettings, getReferralStats, getUserReferrals } from '../controllers/referral.controller.js';
import { applyReferralCode } from '../controllers/user.controller.js';

const referralRoute = express.Router();

referralRoute.post('/generate', isAuthenticated, generateReferralCode);
referralRoute.get('/', isAuthenticated, getUserReferrals);
referralRoute.post('/apply', isAuthenticated, applyReferralCode);
referralRoute.get('/stats', isAuthenticated, getReferralStats);
referralRoute.get('/referral-settings', getReferralSettings);

export default referralRoute;