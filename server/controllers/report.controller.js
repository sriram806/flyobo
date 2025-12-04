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



export default { UserReport, DestinationReport, PackageReport };

