"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  RefreshCw,
  Target,
  UserPlus,
} from "lucide-react";

const AdvancedReferralAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    };
  };

  const fetchAnalytics = async () => {
    if (!API_URL) {
      toast.error("API URL not configured");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/analytics/referrals/advanced`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
    const isPositive = change >= 0;
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {change !== undefined && (
              <div
                className={`flex items-center mt-2 text-sm font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {isPositive ? "+" : ""}
                {change}% vs last month
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-50`}>
            <Icon className={`h-8 w-8 text-${color}-600`} />
          </div>
        </div>
      </div>
    );
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { summary, monthlyTrends, statusDistribution, topReferrers } = analytics;

  const COLORS = {
    pending: "#f59e0b",
    completed: "#10b981",
    expired: "#ef4444",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Referral Analytics</h2>
          <p className="text-gray-600 mt-1">Track referral performance and rewards</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Referrals"
          value={summary.totalReferrals.toLocaleString()}
          change={summary.referralGrowth}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Rewards"
          value={formatCurrency(summary.totalRewards)}
          change={summary.rewardGrowth}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          icon={Target}
          color="purple"
        />
        <StatCard
          title="Avg Reward"
          value={formatCurrency(summary.avgReward)}
          icon={Award}
          color="orange"
        />
      </div>

      {/* Referrals Trend - Line Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Referral Trends (Last 12 Months)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="referrals"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 5 }}
              name="Total Referrals"
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 4 }}
              name="Pending"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rewards and Conversion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rewards Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rewards Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rewards"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 5 }}
                name="Total Rewards"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Rate (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => `${value}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="conversionRate"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 5 }}
                name="Conversion Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusDistribution.map((status) => {
            const statusInfo = {
              pending: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200" },
              completed: { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
              expired: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
            };

            const info = statusInfo[status._id] || { bg: "bg-gray-50", text: "text-gray-800", border: "border-gray-200" };

            return (
              <div
                key={status._id}
                className={`${info.bg} rounded-lg p-6 border ${info.border}`}
              >
                <p className={`text-sm font-medium ${info.text} uppercase tracking-wide`}>
                  {status._id}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{status.count}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Total Rewards</p>
                  <p className={`text-lg font-semibold ${info.text} mt-1`}>
                    {formatCurrency(status.totalRewards)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Referrers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Total Referrals
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Completed
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Conversion
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Total Rewards
                </th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((referrer, index) => (
                <tr
                  key={referrer._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{referrer.userName}</p>
                      <p className="text-sm text-gray-500">{referrer.userEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">
                    {referrer.totalReferrals}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-green-600">
                    {referrer.completedReferrals}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {referrer.conversionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-green-600">
                    {formatCurrency(referrer.totalRewards)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <UserPlus className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">New Referrals</span>
              <span className="text-2xl font-bold text-blue-600">
                {summary.currentMonthReferrals}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Rewards Paid</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.currentMonthRewards)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <Award className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Completed Referrals</span>
              <span className="text-2xl font-bold text-green-600">
                {summary.completedReferrals}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Success Rate</span>
              <span className="text-2xl font-bold text-purple-600">
                {summary.conversionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReferralAnalytics;
