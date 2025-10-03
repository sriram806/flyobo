import Package from "../models/package.model.js";
import User from "../models/user.model.js";
import { generateLast12MonthsData } from "../services/analytics.services.js";

export const getUserAnalytics = async (req, res) => {
  try {
    const last12MonthsData = await generateLast12MonthsData(User, { filter: { status: "active" } });

    // Total users count
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      message: "User analytics fetched successfully",
      data: {
        last12MonthsData: last12MonthsData.last12Months,
        total: totalUsers,
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
