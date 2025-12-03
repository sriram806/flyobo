import Booking from "../models/bookings.model.js";
import User from "../models/user.model.js";
import {
  getAdvancedBookingAnalytics,
  getAdvancedReferralAnalytics,
  getAdvancedUserAnalytics,
  getBasicModelAnalytics,
  getCompletePackageAnalytics,
} from "../services/analytics.services.js";

export const getUserAnalytics = async (req, res) => {
  try {
    const userBasic = await getBasicModelAnalytics(User, { filter: { status: "active" } });

    const topUsers = await User.aggregate([
      { $project: { name: 1, email: 1, totalBookings: { $ifNull: ["$stats.totalBookings", 0] }, totalSpent: { $ifNull: ["$stats.totalSpent", 0] } } },
      { $sort: { totalBookings: -1, totalSpent: -1 } },
      { $limit: 10 },
    ]);

    const roleDist = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);

    res.status(200).json({
      success: true,
      message: "User analytics fetched successfully",
      data: {
        last12MonthsData: userBasic.last12Months,
        total: userBasic.total,
        topUsers,
        roleDistribution: roleDist,
      },
    });
  } catch (error) {
    console.error("Error generating user analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getPackageAnalytics = async (req, res) => {
  try {
    const analytics = await getCompletePackageAnalytics();

    res.status(200).json({
      success: true,
      message: "Complete package analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error generating package analytics:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getBookingsAnalytics = async (req, res) => {
  try {
    const bookingBasic = await getBasicModelAnalytics(Booking, { filter: { status: "active" } });
    res.status(200).json({
      success: true,
      message: "Bookings analytics fetched successfully",
      data: {
        last12MonthsData: bookingBasic.last12Months,
        total: bookingBasic.total,
      },
    });
  } catch (error) {
    console.error("Error generating bookings analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAdvancedBookingsAnalytics = async (req, res) => {
  try {
    const analytics = await getAdvancedBookingAnalytics();

    res.status(200).json({
      success: true,
      message: "Advanced bookings analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error generating advanced bookings analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAdvancedUsersAnalytics = async (req, res) => {
  try {
    const analytics = await getAdvancedUserAnalytics();
    res.status(200).json({ success: true, message: 'Advanced user analytics fetched successfully', data: analytics });
  } catch (error) {
    console.error('Error generating advanced user analytics:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const getAdvancedPackagesAnalytics = async (req, res) => {
  try {
    const analytics = await getAdvancedPackageAnalytics();
    res.status(200).json({ success: true, message: 'Advanced package analytics fetched successfully', data: analytics });
  } catch (error) {
    console.error('Error generating advanced package analytics:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const getAdvancedReferralAnalyticsData = async (req, res) => {
  try {
    const analytics = await getAdvancedReferralAnalytics();

    return res.status(200).json({
      success: true,
      message: "Advanced referral analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error generating advanced referral analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
