import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import isAdmin from '../middleware/isAdmin.js';
import { 
  createBooking, 
  getAllBookings, 
  adminCreateBooking, 
  getUserBookings,
  getBookingAnalytics,
  getBookingTrends,
  getCustomerSegments
} from '../controllers/bookings.controllers.js';

const bookingsRouter = express.Router();

// User routes
bookingsRouter.post('/', isAuthenticated, createBooking);
bookingsRouter.get('/', isAuthenticated, getAllBookings);
bookingsRouter.get('/user/:id', isAuthenticated, getUserBookings);

// Admin routes
bookingsRouter.post('/admin', isAuthenticated, isAdmin, adminCreateBooking);

// Analytics routes (Admin only)
bookingsRouter.get('/analytics/overview', isAuthenticated, isAdmin, getBookingAnalytics);
bookingsRouter.get('/analytics/trends', isAuthenticated, isAdmin, getBookingTrends);
bookingsRouter.get('/analytics/segments', isAuthenticated, isAdmin, getCustomerSegments);

export default bookingsRouter;
