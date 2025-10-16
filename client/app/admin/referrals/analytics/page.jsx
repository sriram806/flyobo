"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  Target,
  Percent,
  Activity
} from "lucide-react";

const AdminReferralAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {},
    chartData: [],
    conversionFunnel: {},
    topPerformers: [],
    trends: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/user/admin/referral-analytics`, {
        params: { period: timeRange },
        withCredentials: true
      });
      setAnalytics(data.data || {});
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success("Analytics data refreshed");
  };

  const exportAnalytics = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user/admin/export-analytics`, {
        params: { period: timeRange },
        withCredentials: true,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referral-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Analytics data exported successfully");
    } catch (error) {
      toast.error("Failed to export analytics data");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const { overview = {}, topPerformers = [], trends = {} } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Referral Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Deep insights into your referral program performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={refreshAnalytics}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.conversionRate || 0}%
              </p>
            </div>
            <Percent className="h-8 w-8 text-sky-600" />
          </div>
          <div className="mt-2 flex items-center">
            {trends.conversionRate >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ml-1 ${trends.conversionRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trends.conversionRate || 0)}% from last period
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Referrals per User</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.avgReferralsPerUser || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center">
            {trends.avgReferralsPerUser >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ml-1 ${trends.avgReferralsPerUser >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trends.avgReferralsPerUser || 0)} from last period
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue per Referral</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${overview.revenuePerReferral || 0}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-2 flex items-center">
            {trends.revenuePerReferral >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ml-1 ${trends.revenuePerReferral >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(trends.revenuePerReferral || 0)} from last period
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Program ROI</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.programROI || 0}%
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center">
            {trends.programROI >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ml-1 ${trends.programROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trends.programROI || 0)}% from last period
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Referral Performance
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">Integration with Chart.js or similar library needed</p>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversion Funnel
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Referral Links Shared</span>
              <span className="text-lg font-bold text-sky-600">{overview.linksShared || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Link Clicks</span>
              <span className="text-lg font-bold text-blue-600">{overview.linkClicks || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Sign-ups</span>
              <span className="text-lg font-bold text-green-600">{overview.signups || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Converted Users</span>
              <span className="text-lg font-bold text-purple-600">{overview.conversions || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Performing Referrers
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Users generating the most referrals and revenue
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rewards Earned
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topPerformers.slice(0, 10).map((performer, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 && (
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-600'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                      {index >= 3 && (
                        <span className="text-gray-600 dark:text-gray-400 font-medium mr-3">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {performer.name?.[0] || performer.email?.[0] || 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {performer.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {performer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {performer.referralCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {performer.conversionRate || 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${performer.revenueGenerated || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                    ${performer.rewardsEarned || '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralAnalytics;