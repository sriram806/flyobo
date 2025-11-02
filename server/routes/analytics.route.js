import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { 
  getBookingsAnalytics, 
  getPackageAnalytics, 
  getUserAnalytics,
  getAdvancedBookingsAnalytics,
  getAdvancedReferralAnalyticsData,
  getAdvancedUsersAnalytics,
  getAdvancedPackagesAnalytics,
} from '../controllers/analytics.controller.js';

const analyticsRoute = express.Router();

analyticsRoute.get('/users', isAuthenticated, getUserAnalytics);
analyticsRoute.get('/packages', isAuthenticated, getPackageAnalytics);
analyticsRoute.get('/bookings', isAuthenticated, getBookingsAnalytics);
analyticsRoute.get('/bookings/advanced', isAuthenticated, getAdvancedBookingsAnalytics);
analyticsRoute.get('/referrals/advanced', isAuthenticated, getAdvancedReferralAnalyticsData);
analyticsRoute.get('/users/advanced', isAuthenticated, getAdvancedUsersAnalytics);
analyticsRoute.get('/packages/advanced', isAuthenticated, getAdvancedPackagesAnalytics);

export default analyticsRoute;
