"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  Gift,
  Trophy,
  Users,
  Eye,
  RefreshCw,
  Download,
  Star,
  Calendar,
  DollarSign
} from "lucide-react";

const AdminReferrals = () => {
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalRewards: 0,
    activeUsers: 0,
    totalUsers: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch leaderboard (contains referral stats)
      const leaderboardRes = await axios.get(`${API_URL}/user/referral-leaderboard`);
      setLeaderboard(leaderboardRes.data.data);

      // Calculate stats from leaderboard data
      const totalReferrals = leaderboardRes.data.data.reduce((sum, user) => sum + user.totalReferrals, 0);
      const totalRewards = leaderboardRes.data.data.reduce((sum, user) => sum + user.totalRewards, 0);
      const activeUsers = leaderboardRes.data.data.filter(user => user.totalReferrals > 0).length;

      setStats({
        totalReferrals,
        totalRewards,
        activeUsers,
        totalUsers: leaderboardRes.data.data.length
      });

      // Mock recent referrals for demonstration
      setRecentReferrals([
        {
          id: 1,
          referrer: "John Doe",
          referred: "Jane Smith",
          reward: 100,
          date: new Date().toISOString(),
          status: "completed"
        },
        {
          id: 2,
          referrer: "Alice Johnson",
          referred: "Bob Wilson",
          reward: 100,
          date: new Date(Date.now() - 86400000).toISOString(),
          status: "completed"
        }
      ]);

    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success("Data refreshed");
  };

  const exportData = () => {
    const data = leaderboard.map(user => ({
      Name: user.name,
      'Total Referrals': user.totalReferrals,
      'Total Rewards': user.totalRewards,
      'Rank': leaderboard.indexOf(user) + 1
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'referral-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage the referral program performance
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sky-100 text-sm">Total Referrals</p>
              <p className="text-3xl font-bold">{stats.totalReferrals}</p>
            </div>
            <Users className="h-12 w-12 text-sky-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Rewards</p>
              <p className="text-3xl font-bold">₹{stats.totalRewards.toLocaleString()}</p>
            </div>
            <DollarSign className="h-12 w-12 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Referrers</p>
              <p className="text-3xl font-bold">{stats.activeUsers}</p>
            </div>
            <Gift className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold">
                {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <Trophy className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Referrers
            </h3>
            <span className="text-sm text-gray-500">{leaderboard.length} active users</span>
          </div>

          <div className="space-y-4">
            {leaderboard.slice(0, 10).map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.totalReferrals} referrals • ₹{user.totalRewards} earned
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {index < 3 && <Star className="inline h-4 w-4 text-yellow-500 mb-1" />}
                  <button className="block text-sky-600 hover:text-sky-700 text-sm">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>

          <div className="space-y-4">
            {recentReferrals.map((referral) => (
              <div key={referral.id} className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {referral.referrer}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      referred {referral.referred}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(referral.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-bold text-sm">+₹{referral.reward}</p>
                    <span className="text-xs text-green-500 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                      {referral.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentReferrals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent referral activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Program Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Program Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Referral Reward</h4>
            <p className="text-2xl font-bold text-blue-600">₹100</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Per successful referral</p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Signup Bonus</h4>
            <p className="text-2xl font-bold text-green-600">₹50</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">For new users</p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Min. Redemption</h4>
            <p className="text-2xl font-bold text-purple-600">₹50</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minimum withdrawal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReferrals;