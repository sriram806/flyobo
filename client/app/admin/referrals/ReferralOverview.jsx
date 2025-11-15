"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  Users,
  Gift,
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Award,
  UserCheck,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

const ReferralOverview = () => {
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrers: 0,
    totalRewards: 0,
    conversionRate: 0,
    pendingRewards: 0,
    paidRewards: 0
  });
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [pendingRewards, setPendingRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("30d");

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchAllData();
  }, [timeFilter]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchReferralStats(),
        fetchRecentReferrals(),
        fetchPendingRewards()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/referral-admin/stats?period=${timeFilter}`, {
        withCredentials: true
      });
      setStats(prev => ({ ...prev, ...data.data }));
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    }
  };

  const fetchRecentReferrals = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user/admin/recent-referrals?limit=10`, {
        withCredentials: true
      });
      setRecentReferrals(data.data || []);
    } catch (error) {
      console.error("Error fetching recent referrals:", error);
    }
  };

  const fetchPendingRewards = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/referral-admin/pending-rewards`, {
        withCredentials: true
      });
      setPendingRewards(data.data || []);
    } catch (error) {
      console.error("Error fetching pending rewards:", error);
    }
  };

  const handleApproveReward = async (userId, rewardId) => {
    try {
      await axios.post(`${API_URL}/referral-admin/approve-reward`, {
        userId,
        rewardId
      }, {
        withCredentials: true
      });
      
      toast.success("Reward approved successfully");
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error("Failed to approve reward");
    }
  };

  const handleMarkPaid = async (userId, rewardId) => {
    try {
      await axios.post(`${API_URL}/referral-admin/mark-paid`, {
        userId,
        rewardId
      }, {
        withCredentials: true
      });
      
      toast.success("Reward marked as paid");
      fetchAllData(); // Refresh data
    } catch (error) {
      toast.error("Failed to mark reward as paid");
    }
  };

  const exportData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/referral-admin/export`, {
        withCredentials: true
      });
      
      // Convert to CSV
      const csvContent = [
        ["Name", "Email", "Referral Code", "Total Referrals", "Total Rewards", "Available Rewards", "Referral Tier"],
        ...data.data.map(item => [
          item.name,
          item.email,
          item.referralCode,
          item.totalReferrals,
          item.totalRewards,
          item.availableRewards,
          item.referralTier
        ])
      ].map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `referrals-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Referral data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Referral System Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your referral program and rewards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReferrals}</p>
            </div>
            <Users className="h-8 w-8 text-sky-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Referrers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeReferrers}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rewards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRewards}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.conversionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Referral Activity
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Referrer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Referee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentReferrals.map((referral, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {referral.referrerName?.[0] || 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {referral.referrerName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {referral.referrerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {referral.refereeName || 'Pending'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {referral.refereeEmail || 'Not registered'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      referral.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : referral.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{referral.reward || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {referral.date || new Date().toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Rewards Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pending Rewards
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reward Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingRewards.map((reward) => (
                <tr key={reward.rewardId} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {reward.userName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {reward.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {reward.rewardType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{reward.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveReward(reward.userId, reward.rewardId)}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMarkPaid(reward.userId, reward.rewardId)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                      >
                        <DollarSign className="h-4 w-4" />
                      </button>
                    </div>
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

export default ReferralOverview;