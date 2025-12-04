import User from "../models/user.model.js";
import Booking from "../models/bookings.model.js";

const monthLabels = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
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
    startDate.setHours(0,0,0,0);

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

export default { UserReport };
