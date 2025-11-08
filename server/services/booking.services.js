import Booking from "../models/bookings.model.js"
import User from "../models/user.model.js"
import { processAutomaticReferralReward } from "./referral.services.js"

export const newBooking = async (data, req, res) => {
    const booking = await Booking.create(data);
    return booking;
}

export const getAllBookingsServices = async () => {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return bookings;
};

// Process referral rewards when a booking is completed
export const processReferralReward = async (bookingId) => {
    try {
        // Use the automatic referral reward processing service
        const result = await processAutomaticReferralReward(bookingId);
        return result;
    } catch (error) {
        console.error('Error processing referral reward:', error);
        return { success: false, message: 'Error processing referral reward', error: error.message };
    }
};