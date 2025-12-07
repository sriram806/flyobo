import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { addFavouritePackage, changePassword, deleteUserAccount, getAllUsers, getBankDetails, getProfile, getReferralInfo, getReferralWithdrawals, getUserBookings, processReferralWithdrawal, removeFavouritePackage, updateBankDetails, updateProfile, UserReferralWithdrawals, validateReferralCode, withdrawReferralRewards } from '../controllers/user.controller.js';

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
userRoute.get('/referral-info', isAuthenticated, getReferralInfo); //get referral info
userRoute.post('/validate-referral', validateReferralCode); //validate referral code
userRoute.get('/referral-withdrawals', isAuthenticated, getReferralWithdrawals); //get all referral withdrawals (admin)
userRoute.post('/referral-withdrawals/process', isAuthenticated, processReferralWithdrawal); //process referral withdrawal
userRoute.post('/withdraw-referral-rewards', isAuthenticated, withdrawReferralRewards); //withdraw referral rewards
userRoute.get('/user-referral-withdrawals', isAuthenticated, UserReferralWithdrawals); //get user's referral withdrawals


// Bank details routes
userRoute.put('/bank-details', isAuthenticated, updateBankDetails);
userRoute.get('/bank-details', isAuthenticated, getBankDetails);


userRoute.get('/get-all-users', isAuthenticated, getAllUsers); //get all users for admin

export default userRoute;