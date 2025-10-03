import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { createBooking, getAllBookings } from '../controllers/bookings.controllers.js';

const bookingsRouter = express.Router();

// User routes
bookingsRouter.post('/',isAuthenticated, createBooking);

bookingsRouter.get('/',isAuthenticated, getAllBookings);

export default bookingsRouter;
