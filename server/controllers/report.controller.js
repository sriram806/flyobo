import User from "../models/user.model.js";
import Booking from "../models/bookings.model.js";
import Destination from "../models/destinations.model.js";
import Package from "../models/package.model.js";

const monthLabels = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const UserReport = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const roleAgg = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const roles = { admin: 0, manager: 0, user: 0 };
    roleAgg.forEach(r => { if (r._id) roles[r._id] = r.count; });

    const monthsBack = 11;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyAgg = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } } },
      { $group: { _id: { year: '$year', month: '$month' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyMap = {};
    monthlyAgg.forEach(it => {
      const key = `${it._id.year}-${it._id.month}`;
      monthlyMap[key] = it.count;
    });

    const monthlyUsers = [];
    const now = new Date();
    for (let i = monthsBack; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${m}`;
      monthlyUsers.push({
        year: y,
        month: m,
        monthLabel: `${monthLabels[m - 1]} ${y}`,
        count: monthlyMap[key] || 0
      });
    }

    const topBookingUsers = await Booking.aggregate([
      { $group: { _id: '$userId', bookingsCount: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
      { $sort: { bookingsCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { userId: '$_id', bookingsCount: 1, totalSpent: 1, name: '$user.name', email: '$user.email', role: '$user.role' } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        roles,
        monthlyUsers,
        topBookingUsers
      }
    });
  } catch (error) {
    console.error('UserReport error:', error);
    return res.status(500).json({ success: false, message: 'Error generating user report' });
  }
};

// Destination report
export const DestinationReport = async (req, res) => {
  try {
    const totalDestinations = await Destination.countDocuments();

    // Domestic: country contains 'india' (case-insensitive). International = rest
    const domesticCount = await Destination.countDocuments({ country: { $regex: /india/i } });
    const internationalCount = Math.max(0, totalDestinations - domesticCount);

    // Popular destinations count
    const popularCount = await Destination.countDocuments({ popular: true });

    // Top countries
    // TOP COUNTRIES
    const topCountriesAgg = await Destination.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $or: [{ $eq: ["$country", null] }, { $eq: ["$country", ""] }] },
              "Unknown",
              "$country"
            ]
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topCountries = topCountriesAgg.map(item => ({
      country: item._id,
      count: item.count,
    }));


    // TOP STATES
    const topStatesAgg = await Destination.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $or: [{ $eq: ["$state", null] }, { $eq: ["$state", ""] }] },
              "Unknown",
              "$state"
            ]
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topStates = topStatesAgg.map(item => ({
      state: item._id,
      count: item.count,
    }));
    const monthsBack = 11;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyAgg = await Destination.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } } },
      { $group: { _id: { year: '$year', month: '$month' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyMap = {};
    monthlyAgg.forEach(it => {
      const key = `${it._id.year}-${it._id.month}`;
      monthlyMap[key] = it.count;
    });

    const monthlyDestinations = [];
    const now = new Date();
    for (let i = monthsBack; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${m}`;
      monthlyDestinations.push({ year: y, month: m, monthLabel: `${monthLabels[m - 1]} ${y}`, count: monthlyMap[key] || 0 });
    }

    return res.status(200).json({
      success: true,
      data: {
        totalDestinations,
        domesticCount,
        internationalCount,
        popularCount,
        topCountries,
        topStates,
        monthlyDestinations
      }
    });
  } catch (error) {
    console.error('DestinationReport error:', error);
    return res.status(500).json({ success: false, message: 'Error generating destination report' });
  }
};

// Package report
export const PackageReport = async (req, res) => {
  try {
    const totalPackages = await Package.countDocuments();

    const featuredCount = await Package.countDocuments({ featured: true });

    const statusAgg = await Package.aggregate([
      { $group: { _id: '$Status', count: { $sum: 1 } } }
    ]);
    const statusCounts = { active: 0, draft: 0 };
    statusAgg.forEach(s => { if (s._id) statusCounts[s._id] = s.count; });

    // Domestic packages: destination.country contains 'india' (case-insensitive)
    const domesticAgg = await Package.aggregate([
      { $lookup: { from: 'destinations', localField: 'destination', foreignField: '_id', as: 'dest' } },
      { $unwind: { path: '$dest', preserveNullAndEmptyArrays: true } },
      { $match: { 'dest.country': { $regex: /india/i } } },
      { $count: 'count' }
    ]);
    const domesticCount = (domesticAgg[0] && domesticAgg[0].count) ? domesticAgg[0].count : 0;
    const internationalCount = Math.max(0, totalPackages - domesticCount);

    // Top packages by bookings
    const topPackagesAgg = await Booking.aggregate([
      { $group: { _id: '$packageId', bookingsCount: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
      { $sort: { bookingsCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'packages', localField: '_id', foreignField: '_id', as: 'package' } },
      { $unwind: { path: '$package', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'destinations', localField: 'package.destination', foreignField: '_id', as: 'destination' } },
      { $unwind: { path: '$destination', preserveNullAndEmptyArrays: true } },
      { $project: {
          packageId: '$_id',
          bookingsCount: 1,
          totalSpent: 1,
          title: '$package.title',
          destination: '$destination.place',
          destinationCountry: '$destination.country',
          featured: '$package.featured',
          status: '$package.Status'
      } }
    ]);

    // Monthly packages created in last 12 months
    const monthsBack = 11;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyAgg = await Package.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } } },
      { $group: { _id: { year: '$year', month: '$month' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyMap = {};
    monthlyAgg.forEach(it => {
      const key = `${it._id.year}-${it._id.month}`;
      monthlyMap[key] = it.count;
    });

    const monthlyPackages = [];
    const now = new Date();
    for (let i = monthsBack; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${m}`;
      monthlyPackages.push({ year: y, month: m, monthLabel: `${monthLabels[m - 1]} ${y}`, count: monthlyMap[key] || 0 });
    }

    return res.status(200).json({
      success: true,
      data: {
        totalPackages,
        featuredCount,
        statusCounts,
        domesticCount,
        internationalCount,
        topPackages: topPackagesAgg,
        monthlyPackages
      }
    });
  } catch (error) {
    console.error('PackageReport error:', error);
    return res.status(500).json({ success: false, message: 'Error generating package report' });
  }
};

export const BookingReport = async (req, res) => {
  try {
    // totals
    const totalBookings = await Booking.countDocuments();
    const revenueAgg = await Booking.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } } } }
    ]);
    const totalRevenue = (revenueAgg[0] && revenueAgg[0].totalRevenue) || 0;

    // bookings by user role (agent = admin|manager, user = user)
    const bookingsByRoleAgg = await Booking.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: { $ifNull: ['$user.role', 'Unknown'] },
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$totalAmount', 0] } }
      } }
    ]);
    const bookingsByRole = { admin: 0, manager: 0, user: 0, Unknown: 0, agent: 0 };
    bookingsByRoleAgg.forEach(r => {
      const role = r._id || 'Unknown';
      bookingsByRole[role] = r.count;
    });
    // agent = admin + manager (derived)
    bookingsByRole.agent = (bookingsByRole.admin || 0) + (bookingsByRole.manager || 0);

    // bookings by payment method (e.g., stripe)
    const paymentAgg = await Booking.aggregate([
      { $group: { _id: { $ifNull: ['$paymentMethod', 'Unknown'] }, count: { $sum: 1 }, revenue: { $sum: { $ifNull: ['$totalAmount', 0] } } } },
      { $sort: { count: -1 } }
    ]);
    const paymentMethods = paymentAgg.map(p => ({ method: p._id, count: p.count, revenue: p.revenue }));

    // bookings by status (handle possible fields 'Status' or 'status')
    const statusAgg = await Booking.aggregate([
      { $group: { _id: { $ifNull: ['$Status', '$status'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const statusCounts = {};
    statusAgg.forEach(s => { statusCounts[s._id || 'Unknown'] = s.count; });

    // monthly bookings for last 12 months
    const monthsBack = 11;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } } },
      { $group: { _id: { year: '$year', month: '$month' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const monthlyMap = {};
    monthlyAgg.forEach(it => { monthlyMap[`${it._id.year}-${it._id.month}`] = it.count; });

    const monthlyBookings = [];
    const now = new Date();
    for (let i = monthsBack; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${m}`;
      monthlyBookings.push({
        year: y,
        month: m,
        monthLabel: `${monthLabels[m - 1]} ${y}`,
        count: monthlyMap[key] || 0
      });
    }

    // top booking users (top 5)
    const topBookingUsers = await Booking.aggregate([
      { $group: { _id: '$userId', bookingsCount: { $sum: 1 }, totalSpent: { $sum: { $ifNull: ['$totalAmount', 0] } } } },
      { $sort: { bookingsCount: -1, totalSpent: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { userId: '$_id', bookingsCount: 1, totalSpent: 1, name: '$user.name', email: '$user.email', role: '$user.role' } }
    ]);

    // top packages by bookings (top 5) + destination info
    const topPackages = await Booking.aggregate([
      { $group: { _id: '$packageId', bookingsCount: { $sum: 1 }, totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } } } },
      { $sort: { bookingsCount: -1, totalRevenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'packages', localField: '_id', foreignField: '_id', as: 'package' } },
      { $unwind: { path: '$package', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'destinations', localField: 'package.destination', foreignField: '_id', as: 'destination' } },
      { $unwind: { path: '$destination', preserveNullAndEmptyArrays: true } },
      { $project: {
          packageId: '$_id',
          bookingsCount: 1,
          totalRevenue: 1,
          title: '$package.title',
          featured: '$package.featured',
          status: '$package.Status',
          destination: '$destination.place',
          destinationCountry: '$destination.country'
      } }
    ]);

    // top destinations by bookings (top 5)
    const topDestinations = await Booking.aggregate([
      { $lookup: { from: 'packages', localField: 'packageId', foreignField: '_id', as: 'package' } },
      { $unwind: { path: '$package', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'destinations', localField: 'package.destination', foreignField: '_id', as: 'destination' } },
      { $unwind: { path: '$destination', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { place: { $ifNull: ['$destination.place', 'Unknown'] }, country: { $ifNull: ['$destination.country', 'Unknown'] } }, count: { $sum: 1 }, revenue: { $sum: { $ifNull: ['$totalAmount', 0] } } } },
      { $sort: { count: -1, revenue: -1 } },
      { $limit: 5 },
      { $project: { place: '$_id.place', country: '$_id.country', count: 1, revenue: 1 } }
    ]);

    // average booking value
    const avgBookingValue = totalBookings > 0 ? (totalRevenue / totalBookings) : 0;

    // recent bookings (5)
    const recentBookings = await Booking.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'packages', localField: 'packageId', foreignField: '_id', as: 'package' } },
      { $unwind: { path: '$package', preserveNullAndEmptyArrays: true } },
      { $project: {
          bookingId: '$_id',
          createdAt: 1,
          totalAmount: 1,
          paymentMethod: 1,
          status: { $ifNull: ['$Status', '$status'] },
          user: { name: '$user.name', email: '$user.email', role: '$user.role' },
          package: { id: '$package._id', title: '$package.title' }
      } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        avgBookingValue,
        bookingsByRole,      // includes agent (admin+manager) and individual roles
        paymentMethods,
        statusCounts,
        monthlyBookings,
        topBookingUsers,
        topPackages,
        topDestinations,
        recentBookings
      }
    });
  } catch (error) {
    console.error('BookingReport error:', error);
    return res.status(500).json({ success: false, message: 'Error generating booking report' });
  }
};

// Assumes you have imported models at top:
// const User = require('../models/User');
// const Booking = require('../models/Booking');
// const Package = require('../models/Package');
// const Destination = require('../models/Destination');

export const DashboardReport = async (req, res) => {
  try {
    // Totals
    const totalUsers = await User.countDocuments();
    const totalManagers = await User.countDocuments({ role: 'manager' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalPackages = await Package.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalDestinations = await Destination.countDocuments();

    // Total revenue (sum of totalAmount)
    const revenueAgg = await Booking.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } } } }
    ]);
    const totalRevenue = (revenueAgg[0] && revenueAgg[0].totalRevenue) || 0;

    // Basic statuses and extras
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' }); // note: used `status` lowercase
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    const featuredPackages = await Package.countDocuments({ featured: true });
    const activePackages = await Package.countDocuments({ status: 'active' });

    const recentBookingsCount = await Booking.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // --- Weekly charts (last 7 days) ---
    // Build window: start 7 days ago (inclusive) to now
    const now = new Date();
    const windowStart = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // include today and 6 previous days => 7 days total
    // Normalize windowStart to 00:00:00 local time if you want day-buckets in local timezone:
    windowStart.setHours(0, 0, 0, 0);

    // Labels ordered Sun..Sat
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const zeroArray = () => Array(7).fill(0);

    // Helper to convert aggregation day index (1=Sunday ... 7=Saturday) to 0-6 index
    const toIndex = (dayOfWeek) => {
      // Mongo $dayOfWeek: 1 (Sunday) .. 7 (Saturday)
      return (dayOfWeek + 6) % 7; // maps 1->0, 2->1, ..., 7->6
    };

    // Bookings: counts and revenues grouped by dayOfWeek
    const bookingsAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: windowStart } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$totalAmount', 0] } }
        }
      }
    ]);

    const bookingCounts = zeroArray();
    const bookingRevenues = zeroArray();
    bookingsAgg.forEach((r) => {
      const idx = toIndex(r._id);
      bookingCounts[idx] = r.count || 0;
      bookingRevenues[idx] = r.revenue || 0;
    });

    // Users created per day of week (in the same 7-day window)
    const usersAgg = await User.aggregate([
      { $match: { createdAt: { $gte: windowStart } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    const usersByDay = zeroArray();
    usersAgg.forEach((r) => {
      usersByDay[toIndex(r._id)] = r.count || 0;
    });

    // Packages created per day
    const packagesAgg = await Package.aggregate([
      { $match: { createdAt: { $gte: windowStart } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    const packagesByDay = zeroArray();
    packagesAgg.forEach((r) => {
      packagesByDay[toIndex(r._id)] = r.count || 0;
    });

    // Destinations created per day
    const destinationsAgg = await Destination.aggregate([
      { $match: { createdAt: { $gte: windowStart } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    const destinationsByDay = zeroArray();
    destinationsAgg.forEach((r) => {
      destinationsByDay[toIndex(r._id)] = r.count || 0;
    });

    // --- Recent activity ---
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id name email role createdAt')
      .lean();

    // recent bookings with populated packageId.title and userId basic info
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'packageId', select: '_id title' })
      .populate({ path: 'userId', select: '_id name email' })
      .lean();

    // Format totals object to match frontend expectation (wrapped in `totals`)
    const totals = {
      totalUsers,
      totalManagers,
      totalAdmins,
      totalPackages,
      totalBookings,
      totalDestinations,
      totalRevenue,
      activeBookings,
      pendingBookings,
      featuredPackages,
      activePackages,
      recentBookingsCount
    };

    return res.status(200).json({
      success: true,
      data: {
        totals,
        weeklyCharts: {
          dayLabels,
          users: usersByDay,
          packages: packagesByDay,
          destinations: destinationsByDay,
          bookings: {
            counts: bookingCounts,
            revenues: bookingRevenues
          }
        },
        recentActivity: {
          recentUsers,
          recentBookings
        }
      }
    });
  } catch (error) {
    console.error('DashboardReport error:', error);
    return res.status(500).json({ success: false, message: 'Error generating dashboard report' });
  }
};


export const ReferralReports = async (req, res) => {
  try {
    const totalReferrers = await User.countDocuments({ referredUsers: { $exists: true, $not: { $size: 0 } } });
    const totalReferredUsers = await User.countDocuments({ referredBy: { $exists: true, $ne: null } });
    const activeReferralAgg = await User.aggregate([
      { $match: { referredBy: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'userId',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          hasActiveBooking: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$bookings',
                    as: 'b',
                    cond: { $eq: ['$$b.status', 'confirmed'] }
                  }
                }
              },
              0
            ]
          }
        }
      },
      { $match: { hasActiveBooking: true } },
      { $count: 'activeReferrals' }
    ]);
    const totalActiveReferrals = activeReferralAgg[0]?.activeReferrals || 0;

    // Total reward: sum of referralReward for all users (or use your own logic)
    const rewardAgg = await User.aggregate([
      { $group: { _id: null, totalReward: { $sum: { $ifNull: ['$referralReward', 0] } } } }
    ]);
    const totalReward = rewardAgg[0]?.totalReward || 0;

    // Conversion rate: active referrals / total referred users
    const conversionRate = totalReferredUsers > 0 ? (totalActiveReferrals / totalReferredUsers) * 100 : 0;

    // Month-wise report for last 12 months
    const monthsBack = 11;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Users referred per month
    const monthlyRefAgg = await User.aggregate([
      { $match: { referredBy: { $exists: true, $ne: null }, createdAt: { $gte: startDate } } },
      { $project: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } } },
      { $group: { _id: { year: '$year', month: '$month' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const monthlyRefMap = {};
    monthlyRefAgg.forEach(it => {
      const key = `${it._id.year}-${it._id.month}`;
      monthlyRefMap[key] = it.count;
    });

    // Active referrals per month (referred users who booked in that month)
    const monthlyActiveAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'confirmed' } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $match: { 'user.referredBy': { $exists: true, $ne: null } } },
      { $project: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } } },
      { $group: { _id: { year: '$year', month: '$month' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const monthlyActiveMap = {};
    monthlyActiveAgg.forEach(it => {
      const key = `${it._id.year}-${it._id.month}`;
      monthlyActiveMap[key] = it.count;
    });

    const monthlyReport = [];
    const now = new Date();
    for (let i = monthsBack; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${m}`;
      monthlyReport.push({
        year: y,
        month: m,
        monthLabel: `${monthLabels[m - 1]} ${y}`,
        referredUsers: monthlyRefMap[key] || 0,
        activeReferrals: monthlyActiveMap[key] || 0,
        conversionRate: (monthlyRefMap[key] || 0) > 0
          ? ((monthlyActiveMap[key] || 0) / (monthlyRefMap[key] || 1)) * 100
          : 0
      });
    }

    // Advanced analytics
    // Top referrers (by number of successful referrals)
    const topReferrersAgg = await User.aggregate([
      { $match: { referredUsers: { $exists: true, $not: { $size: 0 } } } },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          referredCount: { $size: '$referredUsers' },
          referralReward: 1
        }
      },
      { $sort: { referredCount: -1 } },
      { $limit: 5 }
    ]);

    // Most valuable referrals (users whose referrals generated most bookings)
    const valuableReferrersAgg = await User.aggregate([
      { $match: { referredUsers: { $exists: true, $not: { $size: 0 } } } },
      {
        $lookup: {
          from: 'bookings',
          localField: 'referredUsers',
          foreignField: 'userId',
          as: 'refBookings'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          referredCount: { $size: '$referredUsers' },
          bookingsCount: { $size: '$refBookings' },
          totalRevenue: { $sum: '$refBookings.totalAmount' }
        }
      },
      { $sort: { bookingsCount: -1, totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalReferrers,
        totalReferredUsers,
        totalActiveReferrals,
        totalReward,
        conversionRate,
        monthlyReport,
        topReferrers: topReferrersAgg,
        mostValuableReferrers: valuableReferrersAgg
      }
    });
  } catch (error) {
    console.error('ReferralReports error:', error);
    return res.status(500).json({ success: false, message: 'Error generating referral report' });
  }
};