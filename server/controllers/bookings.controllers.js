import Booking from "../models/bookings.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import sendMail from "../config/nodemailer.js";
import Package from "../models/package.model.js";
import mongoose from 'mongoose';
import { getAllBookingsServices, newBooking, processReferralReward } from "../services/booking.services.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { calculateEndDate, getDurationDays } from "../utils/date.utils.js";
import ReferralSettings from "../models/referralSettings.model.js";

const computeTotals = (basePrice, travelers = 1, addOns = [], discount) => {
};

export const createBooking = async (req, res) => {
}

export const adminCreateBooking = async (req, res) => {
}


// Advanced Booking Analytics
export const getBookingAnalytics = catchAsyncErrors(async (req, res) => {
});

// Get booking trends
export const getBookingTrends = catchAsyncErrors(async (req, res) => {
});

// Get customer segments
export const getCustomerSegments = catchAsyncErrors(async (req, res) => {
});

// Update booking (Admin only) - allow editing of several booking fields
export const updateBookingStatus = async (req, res) => {
};

// -----------------------------
// 1️⃣ Admin/Manager Manual Booking
// -----------------------------
export const AdminOrManagerCreateBooking = catchAsyncErrors(async (req, res) => {
    try {
        const agent = req.user;
        if (!agent || !["admin", "manager", "agent"].includes(agent.role)) {
            return res.status(403).json({ success: false, message: "Permission denied" });
        }

        const {
            userId,
            packageId,
            travelers = 1,
            travelerDetails = [],
            discount = 0,
            startDate,
            notes = "",
            payment = {},
            customerInfo
        } = req.body;

        if (!userId || !packageId || !startDate) {
            return res.status(400).json({ success: false, message: "userId, packageId, startDate required" });
        }

        const user = await User.findById(userId);
        const pkg = await Package.findById(packageId);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

        // Calculate end date
        const durationDays = getDurationDays(pkg?.duration);
        const endDate = calculateEndDate(startDate, durationDays);

        const basePrice = Number(pkg.price || 0);
        const totalAmount = Math.max(0, basePrice * travelers - Number(discount || 0));

        const booking = new Booking({
            packageId: pkg._id,
            userId: user._id,
            travelers,
            travelerDetails,
            startDate,
            endDate,
            customerInfo: {
                name: customerInfo?.name || user.name,
                email: customerInfo?.email || user.email,
                phone: customerInfo?.phone || user.phone,
            },
            notes,
            status: "confirmed",
            payment: {
                provider: payment.provider || "cash",
                method: payment.method || "cash",
                status: payment.status || "completed",
                amount: totalAmount,
                transactionId: payment.transactionId || "",
                currency: "INR",
                paidAt: new Date(),
            },
            source: "agent",
            discountApplied: { amount: discount },
            createdByRole: agent.role,
        });

        await booking.save();
        await User.findByIdAndUpdate(user._id, { $push: { bookings: booking._id } }).catch(() => { });

        // Check if this is the user's first booking and apply referral reward
        try {
            const userBookingsCount = await Booking.countDocuments({ userId: user._id });
            
            // If this is their first booking
            if (userBookingsCount === 1) {
                const currentUser = await User.findById(user._id).select('referral');
            
                // Check if user was referred by someone
                if (currentUser?.referral?.referredBy) {
                    const referrerId = currentUser.referral.referredBy;
                    const referrer = await User.findById(referrerId);
                
                    if (referrer) {
                        const referredUserIndex = referrer.referral.referredUsers.findIndex(
                            ru => ru.user.toString() === user._id.toString()
                        );

                        // Only credit if we have the entry and it hasn't been marked as booked yet
                        if (referredUserIndex !== -1 && !referrer.referral.referredUsers[referredUserIndex].hasBooked) {
                            const settings = await ReferralSettings.findOne({}) || {};
                            const referralBonus = typeof settings.referralBonus === 'number' ? settings.referralBonus : 100;

                            // Credit reward to referrer when the referred user actually books
                            referrer.reward = (referrer.reward || 0) + referralBonus;

                            referrer.referral.referredUsers[referredUserIndex].hasBooked = true;
                            referrer.referral.referredUsers[referredUserIndex].firstBookingDate = new Date();
                        
                            await referrer.save();
                            console.log(`Referral reward credited: ${referralBonus} to user ${referrer.email}`);
                        }
                    }
                }
            }
        } catch (referralError) {
            console.error('Error processing referral reward:', referralError);
        }

        return res.status(201).json({ success: true, booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});


// ------------------------------------------------------------------
// 2️⃣ Stripe Booking (User Side)
// ------------------------------------------------------------------
export const stripeUserBooking = catchAsyncErrors(async (req, res) => {
    const user = req.user;

    const {
        packageId,
        travelers = 1,
        travelerDetails = [],
        discount = 0,
        startDate,
        stripePaymentId,
        notes = ""
    } = req.body;

    if (!packageId || !stripePaymentId || !startDate) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    const durationDays = getDurationDays(pkg?.duration);
    const endDate = calculateEndDate(startDate, durationDays);

    const totalAmount = Math.max(0, Number(pkg.price) * travelers - Number(discount || 0));

    const booking = new Booking({
        userId: user._id,
        packageId: pkg._id,
        travelers,
        travelerDetails,
        startDate,
        endDate,
        customerInfo: { name: user.name, email: user.email, phone: user.phone },
        status: "confirmed",
        payment: {
            provider: "stripe",
            method: "card",
            status: "completed",
            amount: totalAmount,
            currency: "INR",
            transactionId: stripePaymentId,
            paidAt: new Date(),
        },
        source: "website",
        notes,
    });

    await booking.save();

    // Check if this is the user's first booking and apply referral reward
    try {
        const userBookingsCount = await Booking.countDocuments({ userId: user._id });
        
        // If this is their first booking
        if (userBookingsCount === 1) {
            const currentUser = await User.findById(user._id).select('referral');
            
            // Check if user was referred by someone
            if (currentUser?.referral?.referredBy) {
                const referrerId = currentUser.referral.referredBy;
                const referrer = await User.findById(referrerId);
                
                if (referrer) {
                    // Update the referred user status in referrer's list
                    const referredUserIndex = referrer.referral.referredUsers.findIndex(
                        ru => ru.user.toString() === user._id.toString()
                    );

                    if (referredUserIndex !== -1 && !referrer.referral.referredUsers[referredUserIndex].hasBooked) {
                        // Load referral settings to get reward amounts
                        const ReferralSettings = (await import('../models/referralSettings.model.js')).default;
                        const settings = await ReferralSettings.findOne({}) || {};
                        const referralBonus = typeof settings.referralBonus === 'number' ? settings.referralBonus : 100;
                        
                        // Credit reward to referrer
                        referrer.reward = (referrer.reward || 0) + referralBonus;
                        
                        referrer.referral.referredUsers[referredUserIndex].hasBooked = true;
                        referrer.referral.referredUsers[referredUserIndex].firstBookingDate = new Date();
                        
                        await referrer.save();
                        console.log(`Referral reward credited: ${referralBonus} to user ${referrer.email}`);
                    }
                }
            }
        }
    } catch (referralError) {
        console.error('Error processing referral reward:', referralError);
        // Don't fail the booking if referral processing fails
    }

    return res.status(201).json({ success: true, booking });
});

export const getAllBookings = catchAsyncErrors(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        status,
        userId,
        packageId,
        startDate,
        endDate,
        q,
        sortBy = "-createdAt"
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const perPage = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * perPage;

    const filter = {};

    if (status) filter.status = status;
    if (userId && mongoose.isValidObjectId(userId)) filter.userId = userId;
    if (packageId && mongoose.isValidObjectId(packageId)) filter.packageId = packageId;
    if (startDate || endDate) {
        filter.startDate = {};
        if (startDate) filter.startDate.$gte = new Date(startDate);
        if (endDate) filter.startDate.$lte = new Date(endDate);
    }
    if (q) {
        const regex = new RegExp(q, "i");
        filter.$or = [
            { "customerInfo.name": regex },
            { "customerInfo.email": regex },
            { notes: regex }
        ];
    }

    const [total, bookings] = await Promise.all([
        Booking.countDocuments(filter),
        Booking.find(filter)
            .populate("userId", "name email phone role")
            .populate("packageId", "title price duration")
            .sort(sortBy)
            .skip(skip)
            .limit(perPage)
    ]);

    return res.status(200).json({
        success: true,
        total,
        page: pageNum,
        pages: Math.ceil(total / perPage),
        bookings
    });
});

export const getBooking = catchAsyncErrors(async (req, res) => {
    const bookingId = req.params.id || req.query.id;
    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
        return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(bookingId)
        .populate("userId", "name email phone")
        .populate("packageId", "title price duration");

    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.status(200).json({ success: true, booking });
});

export const cancelBooking = catchAsyncErrors(async (req, res) => {
    const bookingId = req.params.id;
    const user = req.user;
    const reason = req.body.reason || "Cancelled by user";

    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
        return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(bookingId).populate("userId", "name email");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Authorization: owner or admin/manager/agent can cancel
    const isOwner = user && booking.userId && booking.userId._id.toString() === user._id.toString();
    const isPrivileged = user && ["admin", "manager", "agent"].includes(user.role);
    if (!isOwner && !isPrivileged) {
        return res.status(403).json({ success: false, message: "Permission denied" });
    }

    // Prevent cancelling already finalized bookings
    if (["cancelled", "completed"].includes(booking.status)) {
        return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
    }

    booking.status = "cancelled";
    booking.cancellation = {
        reason,
        cancelledBy: user ? user._id : null,
        cancelledAt: new Date()
    };

    // Simple refund marker for paid bookings (actual refund flow handled elsewhere)
    if (booking.payment && booking.payment.status === "completed") {
        booking.payment.status = "refund_pending";
        booking.payment.refundRequestedAt = new Date();
    }

    await booking.save();

    // Create an in-app notification
    try {
        if (booking.userId && booking.userId._id) {
            await Notification.create({
                userId: booking.userId._id,
                title: "Booking cancelled",
                message: `Your booking (${booking._id}) has been cancelled. Reason: ${reason}`,
                meta: { bookingId: booking._id }
            });
        }
    } catch (err) {
        // ignore notification failures
    }

    // Try to send a simple email notification (best-effort)
    try {
        if (booking.userId && booking.userId.email) {
            await sendMail({
                to: booking.userId.email,
                subject: "Your booking has been cancelled",
                text: `Hello ${booking.userId.name || ""},\n\nYour booking (${booking._id}) has been cancelled.\nReason: ${reason}\n\nIf you have questions contact support.`
            });
        }
    } catch (err) {
        // ignore email failures
    }

    return res.status(200).json({ success: true, booking });
});

