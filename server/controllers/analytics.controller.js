import Booking from "../models/bookings.model.js";
import Package from "../models/package.model.js";
import User from "../models/user.model.js";
import Referral from "../models/referal.model.js";
import { 
  generateLast12MonthsData, 
  getAdvancedBookingAnalytics,
  getAdvancedReferralAnalytics,
  getUserDepartmentBreakdown,
  getAdvancedUserAnalytics,
  getAdvancedPackageAnalytics,
} from "../services/analytics.services.js";

export const getUserAnalytics = async (req, res) => {
  try {
    const last12MonthsData = await generateLast12MonthsData(User, { filter: { status: "active" } });

    const totalUsers = await User.countDocuments();

    // Department / role breakdown (if department field exists, grouped by it; otherwise by role)
    let departments = [];
    try {
      departments = await getUserDepartmentBreakdown();
    } catch (err) {
      console.warn('Could not compute department breakdown:', err.message || err);
      departments = [];
    }

    res.status(200).json({
      success: true,
      message: "User analytics fetched successfully",
      data: {
        last12MonthsData: last12MonthsData.last12Months,
        total: totalUsers,
        departments,
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
    const last12MonthsData = await generateLast12MonthsData(Package);

    const totalPackages = await Package.countDocuments();

    res.status(200).json({
      success: true,
      message: "Package analytics fetched successfully",
      data: {
        last12MonthsData: last12MonthsData.last12Months,
        total: totalPackages,
      },
    });
  } catch (error) {
    console.error("Error generating package analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBookingsAnalytics = async (req, res) => {
  try {
    const last12MonthsData = await generateLast12MonthsData(Booking, { filter: { status: "active" } });

    const totalBookings = await Booking.countDocuments();

    res.status(200).json({
      success: true,
      message: "Bookings analytics fetched successfully",
      data: {
        last12MonthsData: last12MonthsData.last12Months,
        total: totalBookings,
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

    res.status(200).json({
      success: true,
      message: "Advanced referral analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error generating advanced referral analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
