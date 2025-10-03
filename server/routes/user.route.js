import express from 'express';
import {
    getProfile, updateProfile, updateProfileAvatar, changePassword,
    deleteUserAccount,
    getAllUsers
} from '../controllers/user.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const userRoute = express.Router();

userRoute.get('/profile', isAuthenticated, getProfile);
userRoute.put('/profile', isAuthenticated, updateProfile);
userRoute.post('/profile-avatar', isAuthenticated, updateProfileAvatar)
userRoute.put('/change-password', isAuthenticated, changePassword);
userRoute.delete('/:id', isAuthenticated, deleteUserAccount);

userRoute.get('/get-all-users', isAuthenticated, getAllUsers);

export default userRoute;