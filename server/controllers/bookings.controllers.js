import Booking from "../models/bookings.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import sendMail from "../config/nodemailer.js";
import Package from "../models/package.model.js";
import { getAllBookingsServices, newBooking } from "../services/booking.services.js";

export const createBooking = async (req, res) => {
    try {
        const { packageId, payment_info } = req.body;

        // Fetch user and check if package already exists in user's packages
        const user = await User.findById(req.user._id);
        const PackageExistInUser = user.packages.some((pkg) => pkg._id.toString() === packageId);
        if (PackageExistInUser) {
            return res.status(400).json({
                success: false,
                message: "You have already booked this package."
            });
        }

        // Fetch package details
        const pkg = await Package.findById(packageId);
        if (!pkg) {
            return res.status(400).json({
                success: false,
                message: "Package not Found!"
            });
        }
        const data = {
            packageId: pkg._id,
            userId: user._id,
            payment_info
        };

        // Create the booking
        const booking = await newBooking(data, req, res);

        const mailData = {
            user: {
                name: user.name || 'Traveler'
            },
            booking: {
                _id: booking._id.toString().slice(0, 6),
                name: pkg.title || 'Your Package',
                price: pkg.price || 'N/A',
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                description: pkg.description || 'No description available.',
                viewUrl: `${process.env.FRONTEND_URL || 'https://flyobo.com'}/bookings/${booking._id}`
            }
        };

        if (user) {
            // Send booking confirmation email
            await sendMail({
                email: user.email,
                subject: "Your Flyobo Travel Booking Confirmation",
                template: "conformbooking",
                data: mailData,
            });
        }

        // Add booking to user's packages
        user.packages.push(pkg._id);
        await user.save();

        // Create notification
        await Notification.create({
            user: user._id,
            title: "New Booking",
            message: `You have a new booking for ${pkg.title}`
        });

        res.status(201).json({
            success: true,
            booking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in Server (Create Booking)",
            error: error.message
        });
    }
}

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await getAllBookingsServices();
    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}