import express from 'express';
import {
    getProfile, updateProfile,
    deleteUserAccount,
    getAllUsers,
    getUserBookings,
    addFavouritePackage,
    removeFavouritePackage,
    changePassword,
    getReferralInfo,
    updateBankDetails,
    getBankDetails
} from '../controllers/user.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const userRoute = express.Router();

userRoute.get('/profile', isAuthenticated, getProfile);
userRoute.put('/profile', isAuthenticated, updateProfile);
userRoute.put('/change-password', isAuthenticated, changePassword);
userRoute.put('/favourite-packages', isAuthenticated, addFavouritePackage);
userRoute.delete('/favourite-packages/:packageId', isAuthenticated, removeFavouritePackage);
userRoute.delete('/:id', isAuthenticated, deleteUserAccount);

// User bookings
userRoute.get('/my-bookings', isAuthenticated, getUserBookings);

// Referral program routes
userRoute.get('/referral-info', isAuthenticated, getReferralInfo);

// Bank details routes
userRoute.put('/bank-details', isAuthenticated, updateBankDetails);
userRoute.get('/bank-details', isAuthenticated, getBankDetails);



// for admin
userRoute.get('/get-all-users', isAuthenticated, getAllUsers);

export default userRoute;