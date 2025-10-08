import Booking from "../models/bookings.model.js"

export const newBooking = async (data, req, res) => {
    const booking = await Booking.create(data);
    return booking;
}

export const getAllBookingsServices = async () => {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return bookings;
};