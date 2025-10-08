import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  updateWishlistItem,
  checkWishlistStatus,
  getWishlistAnalytics
} from '../controllers/wishlist.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import isAdmin from '../middleware/isAdmin.js';

const wishlistRoute = express.Router();

// User routes (require authentication)
wishlistRoute.post('/add', isAuthenticated, addToWishlist);
wishlistRoute.delete('/remove/:packageId', isAuthenticated, removeFromWishlist);
wishlistRoute.get('/my-wishlist', isAuthenticated, getUserWishlist);
wishlistRoute.put('/update/:packageId', isAuthenticated, updateWishlistItem);
wishlistRoute.get('/check/:packageId', isAuthenticated, checkWishlistStatus);

// Admin routes (require authentication and admin role)
wishlistRoute.get('/analytics', isAuthenticated, isAdmin, getWishlistAnalytics);

export default wishlistRoute;