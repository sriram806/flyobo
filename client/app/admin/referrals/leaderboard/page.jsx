"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  Trophy,
  Medal,
  Award,
  Users,
  TrendingUp,
  Crown,
  Star,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Gift
} from "lucide-react";

const AdminLeaderboardManagement = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [typeFilter, setTypeFilter] = useState('referrals');
  const [leaderboardStats, setLeaderboardStats] = useState({});

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const timeFilters = [
    { value: 'all-time', label: 'All Time' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' }
  ];

  const typeFilters = [
    { value: 'referrals', label: 'Most Referrals' },
    { value: 'earnings', label: 'Top Earners' },
    { value: 'conversions', label: 'Best Conversion Rate' }
  ];

  useEffect(() => {
    fetchLeaderboard();
    fetchLeaderboardStats();
  }, [timeFilter, typeFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockLeaderboard = [
        {
          id: 1,
          user: {
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            avatar: null,
            joinDate: '2023-01-15'
          },
          position: 1,
          totalReferrals: 156,
          successfulReferrals: 142,
          totalEarnings: 14200,
          conversionRate: 91.0,
          lastActivity: '2024-01-10',
          tier: 'diamond',
          badges: ['Top Referrer', 'Consistent Performer']
        },
        {
          id: 2,
          user: {
            name: 'Priya Sharma',
            email: 'priya@example.com',
            avatar: null,
            joinDate: '2023-02-20'
          },
          position: 2,
          totalReferrals: 134,
          successfulReferrals: 125,
          totalEarnings: 12500,
          conversionRate: 93.3,
          lastActivity: '2024-01-09',
          tier: 'gold',
          badges: ['High Converter', 'Rising Star']
        },
        {
          id: 3,
          user: {
            name: 'Amit Patel',
            email: 'amit@example.com',
            avatar: null,
            joinDate: '2023-03-10'
          },
          position: 3,
          totalReferrals: 98,
          successfulReferrals: 89,
          totalEarnings: 8900,
          conversionRate: 90.8,
          lastActivity: '2024-01-08',
          tier: 'silver',
          badges: ['Steady Growth']
        }
      ];
      
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setLeaderboardStats({
        totalParticipants: 1247,
        activeThisMonth: 892,
        topPerformerEarnings: 14200,
        averageReferrals: 23
      });
    } catch (error) {
      console.error("Error fetching leaderboard stats:", error);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'diamond': return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'gold': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'silver': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'bronze': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'diamond': return Crown;
      case 'gold': return Trophy;
      case 'silver': return Medal;
      case 'bronze': return Award;
      default: return Star;
    }
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-sm font-bold text-gray-600 dark:text-gray-400">#{position}</span>;
    }
  };

  const exportLeaderboard = () => {
    const csvContent = [
      ['Position', 'Name', 'Email', 'Referrals', 'Earnings', 'Conversion Rate', 'Tier'].join(','),
      ...leaderboard.map(entry => [
        entry.position,
        entry.user.name,
        entry.user.email,
        entry.totalReferrals,
        entry.totalEarnings,
        `${entry.conversionRate}%`,
        entry.tier
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track top performers and referral champions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLeaderboard()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportLeaderboard}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaderboardStats.totalParticipants || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaderboardStats.activeThisMonth || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Performer Earnings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{leaderboardStats.topPerformerEarnings || 0}</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Referrals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaderboardStats.averageReferrals || 0}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
          >
            {timeFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
          >
            {typeFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Referral Champions</h3>
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
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Badges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((entry) => {
                const TierIcon = getTierIcon(entry.tier);
                
                return (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.position)}
                        {entry.position <= 3 && (
                          <span className="text-xs font-medium text-gray-500">
                            #{entry.position}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-r from-sky-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {entry.user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {entry.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {entry.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(entry.tier)}`}>
                        <TierIcon className="h-3 w-3" />
                        {entry.tier.charAt(0).toUpperCase() + entry.tier.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="font-medium">{entry.totalReferrals} total</div>
                        <div className="text-xs text-gray-500">{entry.successfulReferrals} successful</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">₹{entry.totalEarnings}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(entry.conversionRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.conversionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.badges.map((badge, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-sky-600 hover:text-sky-900 dark:hover:text-sky-400 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaderboard.slice(0, 3).map((entry, index) => (
          <div
            key={entry.id}
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 ${
              index === 0 
                ? 'border-yellow-300 dark:border-yellow-600' 
                : index === 1 
                  ? 'border-gray-300 dark:border-gray-600' 
                  : 'border-orange-300 dark:border-orange-600'
            }`}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                {getRankIcon(entry.position)}
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{entry.user.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{entry.user.email}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Referrals:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{entry.totalReferrals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Earnings:</span>
                  <span className="font-medium text-green-600">₹{entry.totalEarnings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{entry.conversionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLeaderboardManagement;