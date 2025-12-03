import Booking from "../models/bookings.model.js";
import Referral from "../models/referal.model.js";
import User from "../models/user.model.js";
import Package from "../models/package.model.js";

export const generateLast12MonthsData = async (model, options = {}) => {
  const { filter = {}, dateField = "createdAt", months = 12 } = options;

  const now = new Date();

  const monthPromises = Array.from({ length: months }, (_, i) => {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);

    const endOfMonth =
      i === 0
        ? new Date()
        : new Date(dt.getFullYear(), dt.getMonth() + 1, 1);

    return model
      .countDocuments({
        ...filter,
        [dateField]: { $gte: startOfMonth, $lt: endOfMonth },
      })
      .then((count) => ({
        month: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`,
        count,
      }));
  });

  let results = await Promise.all(monthPromises);

  // Reverse so oldest → newest
  results = results.reverse();

  // Add growth, cumulative, trend
  let cumulative = 0;
  results = results.map((data, i, arr) => {
    cumulative += data.count;

    const prevCount = i > 0 ? arr[i - 1].count : 0;
    const growth = prevCount === 0 ? 100 : ((data.count - prevCount) / prevCount) * 100;

    let trend = "no-change";
    if (data.count > prevCount) trend = "up";
    else if (data.count < prevCount) trend = "down";

    return {
      ...data,
      growth: Number(growth.toFixed(2)),
      cumulative,
      trend,
    };
  });

  return { last12Months: results };
};

export const getBasicModelAnalytics = async (model, options = {}) => {
  const { last12Months } = await generateLast12MonthsData(model, options);
  const total = await model.countDocuments(options.filter || {});
  return { last12Months, total };
};

export const getAdvancedBookingAnalytics = async () => {
  try {
    const now = new Date();
    const last12Months = new Date(now.getFullYear(), now.getMonth() - 12, 1);

    // Monthly trends data for line chart
    const monthlyData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: last12Months },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          avgTravelers: { $avg: "$travelers" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format monthly data with month names
    const formattedMonthlyData = monthlyData.map((item) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        bookings: item.totalBookings,
        revenue: parseFloat(item.totalRevenue.toFixed(2)),
        confirmed: item.confirmedBookings,
        cancelled: item.cancelledBookings,
        completed: item.completedBookings,
        avgTravelers: parseFloat(item.avgTravelers.toFixed(2)),
      };
    });

    // Status distribution
    const statusDistribution = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Revenue by payment method
    const revenueByPaymentMethod = await Booking.aggregate([
      {
        $match: {
          "payment_info.status": "completed",
        },
      },
      {
        $group: {
          _id: "$payment_info.method",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Top performing packages
    const topPackages = await Booking.aggregate([
      {
        $group: {
          _id: "$packageId",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "_id",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: { path: "$package", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          packageName: { $ifNull: ["$package.name", "Unknown Package"] },
          bookings: 1,
          revenue: 1,
          avgRevenue: { $divide: ["$revenue", "$bookings"] },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Summary statistics
    const totalStats = await Booking.aggregate([
      {
        $facet: {
          total: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
                avgBookingValue: { $avg: "$totalAmount" },
              },
            },
          ],
          lastMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                  $lt: new Date(now.getFullYear(), now.getMonth(), 1),
                },
              },
            },
            {
              $group: {
                _id: null,
                bookings: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
              },
            },
          ],
          currentMonth: [
            {
              $match: {
                createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
              },
            },
            {
              $group: {
                _id: null,
                bookings: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
              },
            },
          ],
        },
      },
    ]);

    const summary = totalStats[0];
    const totalData = summary.total[0] || { totalBookings: 0, totalRevenue: 0, avgBookingValue: 0 };
    const lastMonthData = summary.lastMonth[0] || { bookings: 0, revenue: 0 };
    const currentMonthData = summary.currentMonth[0] || { bookings: 0, revenue: 0 };

    // Calculate growth rates
    const bookingGrowth = lastMonthData.bookings > 0
      ? (((currentMonthData.bookings - lastMonthData.bookings) / lastMonthData.bookings) * 100).toFixed(2)
      : 0;

    const revenueGrowth = lastMonthData.revenue > 0
      ? (((currentMonthData.revenue - lastMonthData.revenue) / lastMonthData.revenue) * 100).toFixed(2)
      : 0;

    return {
      monthlyTrends: formattedMonthlyData,
      statusDistribution,
      revenueByPaymentMethod,
      topPackages,
      summary: {
        totalBookings: totalData.totalBookings,
        totalRevenue: parseFloat(totalData.totalRevenue.toFixed(2)),
        avgBookingValue: parseFloat(totalData.avgBookingValue.toFixed(2)),
        currentMonthBookings: currentMonthData.bookings,
        currentMonthRevenue: parseFloat(currentMonthData.revenue.toFixed(2)),
        bookingGrowth: parseFloat(bookingGrowth),
        revenueGrowth: parseFloat(revenueGrowth),
      },
    };
  } catch (error) {
    console.error("Error in getAdvancedBookingAnalytics:", error);
    throw error;
  }
};


export const getAdvancedUserAnalytics = async () => {
  try {
    const now = new Date();
    const last12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: last12Months } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedMonthly = monthlySignups.map((it) => ({
      month: `${it._id.year}-${String(it._id.month).padStart(2, '0')}`,
      count: it.count,
    }));
    // Top users by number of bookings and total spent
    const topUsers = await User.aggregate([
      { $project: { name: 1, email: 1, totalBookings: { $ifNull: ["$stats.totalBookings", 0] }, totalSpent: { $ifNull: ["$stats.totalSpent", 0] } } },
      { $sort: { totalBookings: -1, totalSpent: -1 } },
      { $limit: 10 },
    ]);

    // Role distribution
    const roleDist = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    return {
      monthlySignups: formattedMonthly,
      topUsers,
      roleDistribution: roleDist.map((r) => ({ role: r._id, count: r.count })),
    };
  } catch (error) {
    console.error('Error in getAdvancedUserAnalytics:', error);
    throw error;
  }
};

export const getCompletePackageAnalytics = async () => {
  try {
    const basic = await getBasicModelAnalytics(Package);

    const topByBookings = await Booking.aggregate([
      {
        $group: {
          _id: "$packageId",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "_id",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          packageName: { $ifNull: ["$package.title", "Unknown"] },
          bookings: 1,
          revenue: 1,
        },
      },
      { $sort: { bookings: -1, revenue: -1 } },
      { $limit: 20 },
    ]);

    const priceBuckets = await Booking.aggregate([
      {
        $bucket: {
          groupBy: "$totalAmount",
          boundaries: [0, 10000, 25000, 50000, 100000, 99999999],
          default: "Other",
          output: {
            count: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
      },
    ]);
    const byDestination = await Booking.aggregate([
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$package.destination",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 20 },
    ]);

    return {
      basic: {
        total: basic.total,
        last12Months: basic.last12Months,
      },
      advanced: {
        topByBookings,
        priceBuckets,
        byDestination,
      },
    };
  } catch (error) {
    console.error("Error in getCompletePackageAnalytics:", error);
    throw error;
  }
};

export const getAdvancedReferralAnalytics = async () => {
  try {
    const now = new Date();
    const last12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // ---------------------------
    // MONTHLY AGGREGATION
    // ---------------------------
    const monthlyData = await Referral.aggregate([
      {
        $match: {
          createdAt: { $gte: last12Months },
        },
      },
      {
        $addFields: {
          isExpired: { $lt: ["$expiryDate", new Date()] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalReferrals: { $sum: 1 },
          completedReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pendingReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          expiredReferrals: {
            $sum: { $cond: ["$isExpired", 1, 0] },
          },
          totalRewards: { $sum: "$reward" },
          avgReward: { $avg: "$reward" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedMonthlyData = monthlyData.map((item) => {
      const total = item.totalReferrals || 0;
      const completed = item.completedReferrals || 0;
      const pending = item.pendingReferrals || 0;

      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        referrals: total,
        completed,
        pending,
        expired: item.expiredReferrals || 0,
        rewards: Number(item.totalRewards?.toFixed(2)),
        avgReward: Number(item.avgReward?.toFixed(2)),
        conversionRate: total ? Number(((completed / total) * 100).toFixed(2)) : 0,
        pendToCompleteRatio: completed ? Number((pending / completed).toFixed(2)) : 0,
      };
    });

    // ---------------------------
    // STATUS DISTRIBUTION
    // ---------------------------
    const statusDistribution = await Referral.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRewards: { $sum: "$reward" },
        },
      },
    ]);

    // ---------------------------
    // TOP REFERRERS
    // ---------------------------
    const topReferrers = await Referral.aggregate([
      {
        $group: {
          _id: "$referrer",
          totalReferrals: { $sum: 1 },
          completedReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalRewards: { $sum: "$reward" },
          avgReward: { $avg: "$reward" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          userName: { $ifNull: ["$user.name", "Unknown User"] },
          userEmail: { $ifNull: ["$user.email", "N/A"] },
          conversionRate: {
            $cond: [
              { $gt: ["$totalReferrals", 0] },
              {
                $multiply: [
                  { $divide: ["$completedReferrals", "$totalReferrals"] },
                  100,
                ],
              },
              0,
            ],
          },
          rewardEfficiency: {
            $cond: [
              { $gt: ["$completedReferrals", 0] },
              { $divide: ["$totalRewards", "$completedReferrals"] },
              0,
            ],
          },
        },
      },
      { $sort: { totalRewards: -1 } },
      { $limit: 10 },
    ]);

    // ---------------------------
    // SUMMARY STATISTICS
    // ---------------------------
    const summaryStats = await Referral.aggregate([
      {
        $facet: {
          total: [
            {
              $group: {
                _id: null,
                totalReferrals: { $sum: 1 },
                totalRewards: { $sum: "$reward" },
                avgReward: { $avg: "$reward" },
                completedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
              },
            },
          ],
          lastMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                  $lt: new Date(now.getFullYear(), now.getMonth(), 1),
                },
              },
            },
            {
              $group: {
                _id: null,
                referrals: { $sum: 1 },
                rewards: { $sum: "$reward" },
              },
            },
          ],
          currentMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                },
              },
            },
            {
              $group: {
                _id: null,
                referrals: { $sum: 1 },
                rewards: { $sum: "$reward" },
              },
            },
          ],
        },
      },
    ]);

    const totalData = summaryStats[0].total[0] || {
      totalReferrals: 0,
      totalRewards: 0,
      avgReward: 0,
      completedCount: 0,
    };

    const lastMonth = summaryStats[0].lastMonth[0] || { referrals: 0, rewards: 0 };
    const currentMonth = summaryStats[0].currentMonth[0] || { referrals: 0, rewards: 0 };

    // Growth
    const referralGrowth =
      lastMonth.referrals > 0
        ? Number((((currentMonth.referrals - lastMonth.referrals) / lastMonth.referrals) * 100).toFixed(2))
        : 0;

    const rewardGrowth =
      lastMonth.rewards > 0
        ? Number((((currentMonth.rewards - lastMonth.rewards) / lastMonth.rewards) * 100).toFixed(2))
        : 0;

    return {
      monthlyTrends: formattedMonthlyData,
      statusDistribution,
      topReferrers,
      summary: {
        totalReferrals: totalData.totalReferrals,
        totalRewards: Number(totalData.totalRewards.toFixed(2)),
        avgReward: Number(totalData.avgReward.toFixed(2)),
        completedReferrals: totalData.completedCount,
        conversionRate:
          totalData.totalReferrals > 0
            ? Number(((totalData.completedCount / totalData.totalReferrals) * 100).toFixed(2))
            : 0,
        currentMonthReferrals: currentMonth.referrals,
        currentMonthRewards: Number(currentMonth.rewards.toFixed(2)),
        referralGrowth,
        rewardGrowth,
      },
    };
  } catch (error) {
    console.error("Error in getAdvancedReferralAnalytics:", error);
    throw error;
  }
};

