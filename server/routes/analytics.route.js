import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { getBookingsAnalytics, getPackageAnalytics, getUserAnalytics } from '../controllers/analytics.controller.js';

const analyticsRoute = express.Router();

analyticsRoute.get('/users', isAuthenticated, getUserAnalytics);
analyticsRoute.get('/packages', isAuthenticated, getPackageAnalytics);
analyticsRoute.get('/bookings', isAuthenticated, getBookingsAnalytics);

export default analyticsRoute;
