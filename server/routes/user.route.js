import express from 'express';
import {
    getProfile, updateProfile, updateProfileAvatar,
    deleteUserAccount,
    getAllUsers,
    getUserBookings,
    addFavouritePackage,
    removeFavouritePackage
} from '../controllers/user.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const userRoute = express.Router();

userRoute.get('/profile', isAuthenticated, getProfile);
userRoute.put('/profile', isAuthenticated, updateProfile);
userRoute.post('/profile-avatar', isAuthenticated, updateProfileAvatar);
userRoute.put('/favourite-packages', isAuthenticated, addFavouritePackage);
userRoute.delete('/favourite-packages/:id', isAuthenticated, removeFavouritePackage);
userRoute.delete('/:id', isAuthenticated, deleteUserAccount);

// User bookings
userRoute.get('/my-bookings', isAuthenticated, getUserBookings);

userRoute.get('/get-all-users', isAuthenticated, getAllUsers);

export default userRoute;