import Booking from "../models/bookings.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import sendMail from "../config/nodemailer.js";
import Package from "../models/package.model.js";
import { getAllBookingsServices, newBooking, processReferralReward } from "../services/booking.services.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// Helper: compute total amount with add-ons and discounts
const computeTotals = (basePrice, travelers = 1, addOns = [], discount) => {
    const travelersCount = Math.max(1, Number(travelers) || 1);
    const addOnsTotal = Array.isArray(addOns)
        ? addOns.reduce((sum, a) => sum + (Number(a?.price) || 0) * (Number(a?.quantity) || 1), 0)
        : 0;
    const subtotal = (Number(basePrice) || 0) * travelersCount + addOnsTotal;
    let total = subtotal;
    if (discount) {
        const amountOff = Number(discount.amount) || 0;
        const pctOff = Number(discount.percentage) || 0;
        total = subtotal - amountOff - (pctOff > 0 ? (subtotal * pctOff) / 100 : 0);
    }
    return Math.max(0, Math.round(total));
};

export const createBooking = async (req, res) => {
    try {
        const {
            packageId,
            travelers,
            startDate,
            endDate,
            customerInfo,
            addOns,
            discountApplied,
            payment_info,
        } = req.body;

        const user = await User.findById(req.user._id);
        const PackageExistInUser = user.packages.some((pkg) => pkg._id.toString() === packageId);
        if (PackageExistInUser) {
            return res.status(400).json({
                success: false,
                message: "You have already booked this package."
            });
        }

        const pkg = await Package.findById(packageId);
        if (!pkg) {
            return res.status(400).json({
                success: false,
                message: "Package not Found!"
            });
        }
        // Basic validations
        if (!travelers || !startDate || !customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: travelers, startDate, customerInfo(name,email,phone)"
            });
        }

        const totalAmount = computeTotals(pkg.price, travelers, addOns, discountApplied);
        const normalizedPayment = {
            amount: Number(payment_info?.amount) || totalAmount,
            currency: payment_info?.currency || 'INR',
            method: payment_info?.method || 'card',
            status: payment_info?.status || 'pending',
            transactionId: payment_info?.transactionId,
            paidAt: payment_info?.paidAt,
        };

        const data = {
            packageId: pkg._id,
            userId: user._id,
            travelers: Number(travelers),
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            customerInfo,
            addOns: Array.isArray(addOns) ? addOns : [],
            discountApplied: discountApplied || undefined,
            totalAmount,
            payment_info: normalizedPayment,
            source: 'website',
            status: 'pending',
        };

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
            await sendMail({
                email: user.email,
                subject: "Your Flyobo Travel Booking Confirmation",
                template: "conformbooking",
                data: mailData,
            });
        }

        user.packages.push(pkg._id);
        await user.save();
        
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
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await getAllBookingsServices();
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const adminCreateBooking = async (req, res) => {
    try {
        const {
            userId,
            packageId,
            travelers,
            startDate,
            endDate,
            customerInfo,
            addOns,
            discountApplied,
            payment_info,
            source,
            status,
        } = req.body;
        if (!userId || !packageId || !travelers || !startDate || !customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
            return res.status(400).json({ success: false, message: "Missing required fields: userId, packageId, travelers, startDate, customerInfo(name,email,phone)" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const pkg = await Package.findById(packageId);
        if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

        const already = user.packages?.some((p) => p.toString() === pkg._id.toString());
        if (already) {
            return res.status(400).json({ success: false, message: "User already has this package" });
        }

        const totalAmount = computeTotals(pkg.price, travelers, addOns, discountApplied);
        const normalizedPayment = {
            amount: Number(payment_info?.amount) || totalAmount,
            currency: payment_info?.currency || 'INR',
            method: payment_info?.method || 'cash', // default offline
            status: payment_info?.status || 'pending',
            transactionId: payment_info?.transactionId,
            paidAt: payment_info?.paidAt,
        };

        const data = {
            packageId: pkg._id,
            userId: user._id,
            travelers: Number(travelers),
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            customerInfo,
            addOns: Array.isArray(addOns) ? addOns : [],
            discountApplied: discountApplied || undefined,
            totalAmount,
            payment_info: normalizedPayment,
            source: source || 'agent',
            status: status || 'pending',
        };
        const booking = await newBooking(data, req, res);

        await Notification.create({
            user: user._id,
            title: "New Booking (Admin)",
            message: `An admin created a booking for ${pkg.title}`
        });

        try {
            await sendMail({
                email: user.email,
                subject: "Your Flyobo Travel Booking (Created by Admin)",
                template: "conformbooking",
                data: {
                    user: { name: user.name || 'Traveler' },
                    booking: {
                        _id: booking._id.toString().slice(0, 6),
                        name: pkg.title || 'Your Package',
                        price: pkg.price || 'N/A',
                        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        description: pkg.description || 'No description available.',
                        viewUrl: `${process.env.FRONTEND_URL || 'https://flyobo.com'}/bookings/${booking._id}`
                    }
                }
            });
        } catch {}

        user.packages.push(pkg._id);
        await user.save();

        return res.status(201).json({ success: true, booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getUserBookings = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: "User id is required" });
        }
        const bookings = await Booking.find({ userId: id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, bookings });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Advanced Booking Analytics
export const getBookingAnalytics = catchAsyncErrors(async (req, res) => {
    try {
        const { timeRange = '12months', groupBy = 'month' } = req.query;
        
        // Calculate date range
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '3months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case '6months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                break;
            case '12months':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
                break;
        }

        // Revenue analytics
        const revenueAnalytics = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    'payment_info.status': 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        ...(groupBy === 'day' && { day: { $dayOfMonth: '$createdAt' } })
                    },
                    totalRevenue: { $sum: '$totalAmount' },
                    bookingCount: { $sum: 1 },
                    averageBookingValue: { $avg: '$totalAmount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, ...(groupBy === 'day' && { '_id.day': 1 }) }
            }
        ]);

        // Booking status distribution
        const statusDistribution = await Booking.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Top destinations
        const topDestinations = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    'payment_info.status': 'completed'
                }
            },
            {
                $lookup: {
                    from: 'packages',
                    localField: 'packageId',
                    foreignField: '_id',
                    as: 'package'
                }
            },
            {
                $unwind: '$package'
            },
            {
                $group: {
                    _id: '$package.destination',
                    bookingCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averagePrice: { $avg: '$totalAmount' }
                }
            },
            {
                $sort: { bookingCount: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Customer analytics
        const customerAnalytics = await Booking.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: '$userId',
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    averageBookingValue: { $avg: '$totalAmount' },
                    lastBooking: { $max: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    userId: '$_id',
                    userName: '$user.name',
                    userEmail: '$user.email',
                    totalBookings: 1,
                    totalSpent: 1,
                    averageBookingValue: 1,
                    lastBooking: 1,
                    customerType: {
                        $cond: [
                            { $gte: ['$totalBookings', 5] }, 'VIP',
                            { $cond: [{ $gte: ['$totalBookings', 3] }, 'Loyal', 'Regular'] }
                        ]
                    }
                }
            },
            {
                $sort: { totalSpent: -1 }
            },
            {
                $limit: 20
            }
        ]);

        // Booking source analytics
        const sourceAnalytics = await Booking.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Monthly comparison
        const monthlyComparison = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 2, 1) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ['$payment_info.status', 'completed'] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Calculate growth rates
        let growthRates = {};
        if (monthlyComparison.length >= 2) {
            const current = monthlyComparison[monthlyComparison.length - 1];
            const previous = monthlyComparison[monthlyComparison.length - 2];
            
            growthRates = {
                bookingsGrowth: previous.bookings > 0 ? 
                    ((current.bookings - previous.bookings) / previous.bookings * 100).toFixed(2) : 0,
                revenueGrowth: previous.revenue > 0 ? 
                    ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(2) : 0
            };
        }

        // Summary statistics
        const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } });
        const completedBookings = await Booking.countDocuments({
            createdAt: { $gte: startDate },
            'payment_info.status': 'completed'
        });
        const totalRevenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    'payment_info.status': 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const avgBookingValue = totalRevenue[0]?.total && completedBookings > 0 ? 
            (totalRevenue[0].total / completedBookings).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalBookings,
                    completedBookings,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    averageBookingValue: avgBookingValue,
                    conversionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(2) : 0,
                    growthRates
                },
                revenueAnalytics,
                statusDistribution,
                topDestinations,
                customerAnalytics,
                sourceAnalytics,
                monthlyComparison
            }
        });
    } catch (error) {
        console.error("Booking analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking analytics"
        });
    }
});

// Get booking trends
export const getBookingTrends = catchAsyncErrors(async (req, res) => {
    try {
        const { metric = 'bookings', period = 'daily' } = req.query;
        
        let groupStage;
        const now = new Date();
        let matchStage = {};

        // Set date range based on period
        switch (period) {
            case 'daily':
                matchStage.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                groupStage = {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    }
                };
                break;
            case 'weekly':
                matchStage.createdAt = { $gte: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000) };
                groupStage = {
                    _id: {
                        year: { $year: '$createdAt' },
                        week: { $week: '$createdAt' }
                    }
                };
                break;
            case 'monthly':
            default:
                matchStage.createdAt = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) };
                groupStage = {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    }
                };
                break;
        }

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    ...groupStage,
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ['$payment_info.status', 'completed'] }, 1, 0] }
                    },
                    averageValue: { $avg: '$totalAmount' }
                }
            },
            {
                $sort: { 
                    '_id.year': 1, 
                    '_id.month': 1,
                    ...(period === 'daily' && { '_id.day': 1 }),
                    ...(period === 'weekly' && { '_id.week': 1 })
                }
            }
        ];

        const trends = await Booking.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: {
                trends,
                period,
                metric
            }
        });
    } catch (error) {
        console.error("Booking trends error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking trends"
        });
    }
});

// Get customer segments
export const getCustomerSegments = catchAsyncErrors(async (req, res) => {
    try {
        const segments = await Booking.aggregate([
            {
                $group: {
                    _id: '$userId',
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    firstBooking: { $min: '$createdAt' },
                    lastBooking: { $max: '$createdAt' },
                    averageBookingValue: { $avg: '$totalAmount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $addFields: {
                    daysSinceFirstBooking: {
                        $divide: [
                            { $subtract: [new Date(), '$firstBooking'] },
                            1000 * 60 * 60 * 24
                        ]
                    },
                    daysSinceLastBooking: {
                        $divide: [
                            { $subtract: [new Date(), '$lastBooking'] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                $addFields: {
                    segment: {
                        $switch: {
                            branches: [
                                {
                                    case: { 
                                        $and: [
                                            { $gte: ['$totalBookings', 5] },
                                            { $gte: ['$totalSpent', 1000] },
                                            { $lte: ['$daysSinceLastBooking', 90] }
                                        ]
                                    },
                                    then: 'VIP'
                                },
                                {
                                    case: {
                                        $and: [
                                            { $gte: ['$totalBookings', 3] },
                                            { $lte: ['$daysSinceLastBooking', 180] }
                                        ]
                                    },
                                    then: 'Loyal'
                                },
                                {
                                    case: { $lte: ['$daysSinceLastBooking', 365] },
                                    then: 'Active'
                                },
                                {
                                    case: { $gt: ['$daysSinceLastBooking', 365] },
                                    then: 'Inactive'
                                }
                            ],
                            default: 'New'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 },
                    averageBookings: { $avg: '$totalBookings' },
                    averageSpent: { $avg: '$totalSpent' },
                    averageBookingValue: { $avg: '$averageBookingValue' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: segments
        });
    } catch (error) {
        console.error("Customer segments error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch customer segments"
        });
    }
});

// Update booking (Admin only) - allow editing of several booking fields
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const {
            status,
            paymentStatus,
            travelers,
            startDate,
            endDate,
            customerInfo,
            payment_info,
        } = req.body;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        const booking = await Booking.findById(bookingId).populate('userId');
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const previousStatus = booking.status;
        const previousPaymentStatus = booking.payment_info?.status;

        // Update allowed fields
        if (typeof travelers !== 'undefined') booking.travelers = Number(travelers) || booking.travelers;
        if (startDate) booking.startDate = new Date(startDate);
        if (endDate) booking.endDate = new Date(endDate);
        if (customerInfo && typeof customerInfo === 'object') {
            booking.customerInfo = { ...booking.customerInfo, ...customerInfo };
        }

        // Payment info merge
        if (payment_info && typeof payment_info === 'object') {
            booking.payment_info = { ...booking.payment_info, ...payment_info };
        }

        // Backwards-compatible paymentStatus field
        if (paymentStatus) booking.payment_info = { ...booking.payment_info, status: paymentStatus };

        // Status update with validation
        if (status) {
            const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'];
            if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid booking status' });
            booking.status = status;
        }

        await booking.save();

        // Process referral reward when booking becomes completed and payment confirmed
        const nowPaymentStatus = booking.payment_info?.status;
        if ((booking.status === 'completed' && previousStatus !== 'completed') || (nowPaymentStatus === 'completed' && previousPaymentStatus !== 'completed')) {
            if (booking.status === 'completed' && nowPaymentStatus === 'completed') {
                const rewardResult = await processReferralReward(bookingId);
                if (!rewardResult.success) console.error('Referral reward processing failed:', rewardResult.message);
            }
        }

        // Notify user
        try {
            if (booking.userId) {
                await Notification.create({ user: booking.userId._id, title: 'Booking Updated', message: `Your booking has been updated.` });
            }
        } catch (nErr) {
            console.error('Notification error:', nErr);
        }

        res.status(200).json({ success: true, message: 'Booking updated', booking });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update booking', error: error.message });
    }
};