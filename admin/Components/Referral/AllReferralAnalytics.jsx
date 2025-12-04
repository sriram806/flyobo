"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaUsers, FaChartLine, FaRupeeSign, FaUserCheck, FaDownload } from "react-icons/fa";

// exact endpoint requested (intentionally contains double slash)
const REFERRAL_ADVANCED_ENDPOINT = "http://localhost:5000/api/v1/analytics/referrals/advanced";

const AllReferralAnalytics = () => {
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

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
            const { data } = await axios.get(
                `${API_URL}/referral-admin/stats?period=${timeFilter}`,
                { withCredentials: true }
            );
            setStats(prev => ({ ...prev, ...data.data }));
        } catch (error) {
            console.error("Error fetching referral stats:", error);
        }
    };

    const fetchRecentReferrals = async () => {
        try {
            const { data } = await axios.get(
                `${API_URL}/user/admin/recent-referrals?limit=10`,
                { withCredentials: true }
            );
            setRecentReferrals(data.data || []);
        } catch (error) {
            console.error("Error fetching recent referrals:", error);
        }
    };

    const fetchPendingRewards = async () => {
        try {
            const { data } = await axios.get(
                `${API_URL}/referral-admin/pending-rewards`,
                { withCredentials: true }
            );
            setPendingRewards(data.data || []);
        } catch (error) {
            console.error("Error fetching pending rewards:", error);
        }
    };

    const exportData = async () => {
        try {
            const { data } = await axios.get(
                `${API_URL}/referral-admin/export`,
                { withCredentials: true }
            );

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

            link.href = url;
            link.download = `referrals-${new Date().toISOString().split("T")[0]}.csv`;
            link.click();

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
                        <FaDownload className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Total Referrals */}
                <div className="bg-gray-200 border-gray-300 text-gray-900 dark:text-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</p>
                            <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                        </div>
                        <FaUsers className="h-8 w-8 text-sky-600" />
                    </div>
                </div>

                {/* Active Referrers */}
                <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Referrers</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-200">{stats.activeReferrers}</p>
                        </div>
                        <FaUserCheck className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                {/* Total Rewards */}
                <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Rewards</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-200">₹{stats.totalRewards}</p>
                        </div>
                        <FaRupeeSign className="h-8 w-8 text-yellow-600" />
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-200">{stats.conversionRate}%</p>
                        </div>
                        <FaChartLine className="h-8 w-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-gray-200 border-gray-300 dark:bg-gray-800 rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Recent Referral Activity</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-400 dark:bg-gray-600 text-gray-900 dark:text-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs">Referrer</th>
                                <th className="px-6 py-3 text-left text-xs">Referee</th>
                                <th className="px-6 py-3 text-left text-xs">Status</th>
                                <th className="px-6 py-3 text-left text-xs">Reward</th>
                                <th className="px-6 py-3 text-left text-xs">Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentReferrals.map((ref, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <td className="px-6 py-4 flex items-center">
                                        <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center text-white">
                                            {ref.referrerName?.[0] || "U"}
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium text-gray-900 dark:text-gray-200">{ref.referrerName || "Unknown"}</p>
                                            <p className="text-sm text-gray-500">{ref.referrerEmail}</p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-200">
                                        <p>{ref.refereeName || "Pending"}</p>
                                        <p className="text-sm text-gray-500">{ref.refereeEmail}</p>
                                    </td>

                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-200">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${ref.status === "completed"
                                                ? "bg-green-100 text-green-800"
                                                : ref.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {ref.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">₹{ref.reward || "0"}</td>

                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {ref.date || new Date().toLocaleDateString()}
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

export default AllReferralAnalytics;
