import express from 'express';
import {
  generateReferralCode,
  getUserReferrals,
  applyReferralCode,
  getReferralStats,
} from '../controllers/referal.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const referalRoute = express.Router();

referalRoute.post('/generate', isAuthenticated, generateReferralCode);
referalRoute.get('/', isAuthenticated, getUserReferrals);
referalRoute.post('/apply', isAuthenticated, applyReferralCode);
referalRoute.get('/stats', isAuthenticated, getReferralStats);

export default referalRoute;
