import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import isAdmin from '../middleware/isAdmin.js';
import {
  getAllBookings,
  adminCreateBooking,
  getBookingAnalytics,
  getBookingTrends,
  getCustomerSegments,
  updateBookingStatus,
  AdminOrManagerCreateBooking,
  stripeUserBooking,
  getBooking
} from '../controllers/bookings.controllers.js';

const bookingsRouter = express.Router();


// Admin routes
bookingsRouter.post('/admin', isAuthenticated, isAdmin, adminCreateBooking);
bookingsRouter.put('/admin/:bookingId', isAuthenticated, isAdmin, updateBookingStatus);

// Analytics routes (Admin only)
bookingsRouter.get('/analytics/overview', isAuthenticated, isAdmin, getBookingAnalytics);
bookingsRouter.get('/analytics/trends', isAuthenticated, isAdmin, getBookingTrends);
bookingsRouter.get('/analytics/segments', isAuthenticated, isAdmin, getCustomerSegments);


// New Routes
bookingsRouter.post('/agent/booking/', isAuthenticated, AdminOrManagerCreateBooking);
bookingsRouter.post('/user/booking/', isAuthenticated, stripeUserBooking);
bookingsRouter.get('/bookings', isAuthenticated, getAllBookings);
bookingsRouter.get('/bookings/:id', isAuthenticated, getBooking);

export default bookingsRouter;