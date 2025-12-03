"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CiTrophy } from "react-icons/ci";
import { IoIosTrendingUp } from "react-icons/io";
import { FaCloudDownloadAlt } from "react-icons/fa";


const ReferralLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const API_URL =  process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/referral-admin/top-referrals?limit=${limit}`, {
        withCredentials: true
      });
      setLeaderboard(data.data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const exportLeaderboard = async () => {
    try {
      // Convert to CSV
      const csvContent = [
        ["Rank", "Name", "Email", "Referral Code", "Total Referrals", "Total Rewards", "Available Rewards", "Referral Tier"],
        ...leaderboard.map((user, index) => [
          index + 1,
          user.name,
          user.email,
          user.referralCode,
          user.totalReferrals,
          user.totalRewards,
          user.availableRewards,
          user.referralTier
        ])
      ].map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `referral-leaderboard-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Leaderboard exported successfully");
    } catch (error) {
      toast.error("Failed to export leaderboard");
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'text-orange-600';
      case 'silver': return 'text-gray-600';
      case 'gold': return 'text-yellow-600';
      case 'platinum': return 'text-purple-600';
      case 'diamond': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTierBg = (tier) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-100';
      case 'silver': return 'bg-gray-100';
      case 'gold': return 'bg-yellow-100';
      case 'platinum': return 'bg-purple-100';
      case 'diamond': return 'bg-blue-100';
      default: return 'bg-gray-100';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Referral Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Top referrers in our community
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="px-3 py-2 border text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="10">Top 10</option>
            <option value="25">Top 25</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
          <button
            onClick={exportLeaderboard}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <FaCloudDownloadAlt className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={fetchLeaderboard}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <IoIosTrendingUp className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                  Referral Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Rewards
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Available Rewards
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((referrer) => (
                <tr key={referrer.userId} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      referrer.rank === 1 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                        : referrer.rank === 2 
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
                        : referrer.rank === 3 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      <span className="font-bold">{referrer.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-medium">
                        {referrer.name?.[0] || 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {referrer.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {referrer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {referrer.referralCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="font-semibold">{referrer.totalReferrals}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{referrer.totalRewards}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{referrer.availableRewards}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierBg(referrer.referralTier)} ${getTierColor(referrer.referralTier)}`}>
                      {referrer.referralTier?.charAt(0)?.toUpperCase() + referrer.referralTier?.slice(1) || 'Bronze'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-8">
              <CiTrophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No leaderboard data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralLeaderboard;