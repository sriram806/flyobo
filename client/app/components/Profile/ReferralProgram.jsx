"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  Gift, Share, Trophy, Users, ExternalLink, Star, Check, DollarSign,
  Copy, Award, TrendingUp, Target, Crown, BarChart3, Shield
} from "lucide-react";
import ReferralTier from "./ReferralTier";

const ReferralProgram = () => {
  const user = useSelector((state) => state?.auth?.user);
  const [referralData, setReferralData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!API_URL) {
    console.warn("API URL not configured");
    toast.warn("API URL not configured")
    return;
  }

  const fetchReferralData = async () => {
    try {
      if (!API_URL) {
        console.error("API url is missing");
        return;
      }

      if (!user) {
        console.error("No user found!");
        return;
      }

      const { data } = await axios.get(`${API_URL}/user/referral-info`, {
        withCredentials: true,
        timeout: 10000
      });

      if (data.success) {
        setReferralData(data.data);
        setServerError(false);
      } else {
        throw new Error(data.message || "Failed to fetch referral data");
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      setServerError(true);

      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        toast.error("Unable to connect to server. Please check if the server is running.");
      } else if (error.response?.status === 401) {
        setAuthError(true);
        toast.error("Authentication required. Please log in again.");
      } else if (error.response?.status === 404) {
        toast.error("Referral service not available");
      } else {
        toast.error("Failed to load referral data");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/user/referral-leaderboard?limit=10`, {
        withCredentials: true
      });

      if (data.success) {
        setLeaderboard(data.data || []);
      } else {
        setError("Failed to load leaderboard");
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to load leaderboard");
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReferralData();
    } else {
      setLoading(false);
      toast.error("Please log in to access the referral program");
    }
    fetchLeaderboard();
  }, [user]);

  const copyReferralLink = async () => {
    if (referralData?.referralLink) {
      try {
        await navigator.clipboard.writeText(referralData.referralCode);
        setCopied(true);
        toast.success("Referral Code copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleRedeemRewards = async (e) => {
    e.preventDefault();
    const amount = parseInt(redeemAmount);

    if (!amount || amount < 50) {
      toast.error("Minimum redemption amount is ₹50");
      return;
    }

    if (amount > referralData?.availableRewards) {
      toast.error("Insufficient rewards balance");
      return;
    }

    try {
      const bankResp = await axios.get(`${API_URL}/user/bank-details`, { withCredentials: true });
      if (!(bankResp?.data?.success && bankResp.data.data && bankResp.data.data.accountNumber)) {
        toast.error("Please add your bank details under Profile → Bank Details before redeeming rewards.");
        return;
      }
    } catch (err) {
      console.warn('Bank details check failed:', err);
      toast.error("Unable to verify bank details. Please try again later.");
      return;
    }

    try {
      setRedeemLoading(true);
      const { data } = await axios.post(`${API_URL}/user/redeem-rewards`,
        { amount },
        {
          withCredentials: true,
          timeout: 10000
        }
      );

      toast.success(data.message || "Rewards redeemed successfully");
      setRedeemAmount("");
      fetchReferralData(); // Refresh data
    } catch (error) {
      console.error("Redeem error:", error);

      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        toast.error("Network error. Please check your connection.");
      } else if (error.response?.status === 401) {
        toast.error("Authentication required. Please log in again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to redeem rewards");
      }
    } finally {
      setRedeemLoading(false);
    }
  };

  const getMilestoneData = () => {
    if (!referralData) return [];

    const baseMilestones = [
      { id: 'first_referral', title: 'First Referral', target: 1, reward: 50, icon: Users },
      { id: '5_referrals', title: 'Social Butterfly', target: 5, reward: 100, icon: Share },
      { id: '10_referrals', title: 'Influencer', target: 10, reward: 250, icon: Star },
      { id: '25_referrals', title: 'Ambassador', target: 25, reward: 500, icon: Award },
      { id: '50_referrals', title: 'Champion', target: 50, reward: 1000, icon: Trophy },
      { id: '100_referrals', title: 'Legend', target: 100, reward: 2500, icon: Crown }
    ];

    return baseMilestones.map(milestone => {
      const userMilestone = referralData.milestones?.find(m => m.milestone === milestone.id);
      return {
        ...milestone,
        achieved: userMilestone ? userMilestone.achieved : false,
        achievedAt: userMilestone ? userMilestone.achievedAt : null
      };
    });
  };

  const getTierInfo = () => {
    const tiers = {
      first: { name: 'First Referral', color: 'text-orange-600', bg: 'bg-orange-100', nextTier: 'Social Butterfly', nextThreshold: 5 },
      social: { name: 'Social Butterfly', color: 'text-indigo-600', bg: 'bg-indigo-100', nextTier: 'Influencer', nextThreshold: 10 },
      influencer: { name: 'Influencer', color: 'text-yellow-600', bg: 'bg-yellow-100', nextTier: 'Ambassador', nextThreshold: 25 },
      ambassador: { name: 'Ambassador', color: 'text-purple-600', bg: 'bg-purple-100', nextTier: 'Champion', nextThreshold: 50 },
      champion: { name: 'Champion', color: 'text-green-600', bg: 'bg-green-100', nextTier: 'Legend', nextThreshold: 100 },
      legend: { name: 'Legend', color: 'text-blue-600', bg: 'bg-blue-100', nextTier: null, nextThreshold: null }
    };

    const totalReferrals = referralData?.totalReferrals || 0;
    const milestones = referralData?.milestones || [];

    const milestoneAchieved = (id) => {
      const m = milestones.find(ms => ms.milestone === id);
      return !!(m && m.achieved);
    };

    if (milestoneAchieved('100_referrals') || totalReferrals >= 100) return tiers.legend;
    if (milestoneAchieved('50_referrals') || totalReferrals >= 50) return tiers.champion;
    if (milestoneAchieved('25_referrals') || totalReferrals >= 25) return tiers.ambassador;
    if (milestoneAchieved('10_referrals') || totalReferrals >= 10) return tiers.influencer;
    if (milestoneAchieved('5_referrals') || totalReferrals >= 5) return tiers.social;

    return tiers.first;
  };

  const getTierProgress = () => {
    if (!referralData) return 0;

    const tierInfo = getTierInfo();
    if (!tierInfo || !tierInfo.nextThreshold) return 100;

    const progress = (referralData.totalReferrals / tierInfo.nextThreshold) * 100;
    return Math.min(progress, 100);
  };

  const renderRewardHistoryItem = (reward) => {
    const isPositive = reward.amount > 0;
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      credited: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      used: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <div key={reward._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">{reward.description}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(reward.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
            {isPositive ? '+' : ''}{reward.amount}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[reward.status]}`}>
            {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ExternalLink className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Server Connection Error</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Unable to connect to the server. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="h-16 w-16 text-yellow-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please log in to access the referral program.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Gift className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Join the Referral Program</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign up to start earning rewards by referring friends.
        </p>
      </div>
    );
  }

  const milestoneList = getMilestoneData();
  const tierInfo = getTierInfo();
  const tierProgress = getTierProgress();
  const totalReferrals = referralData?.totalReferrals || 0;


  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-md">
            Invite your friends to explore exciting travel packages and earn rewards
            for every successful referral you make!
          </p>
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'milestones', label: 'Milestones' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'rewards', label: 'Rewards History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-sky-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Rewards</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{referralData?.availableRewards || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{referralData?.totalRewards || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your Referral Code
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Referral Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralData?.referralCode || ''}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <ReferralTier />
          </div>

          {/* Redeem Rewards */}
          {referralData?.availableRewards > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Redeem Rewards
              </h3>
              <form onSubmit={handleRedeemRewards} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="Enter amount (min. ₹50)"
                    min="50"
                    max={referralData?.availableRewards}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={redeemLoading || !redeemAmount}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {redeemLoading ? 'Processing...' : 'Redeem'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Referral Milestones
            </h3>

            <div className="space-y-4">
              {milestoneList.map((milestone, index) => {
                const isAchieved = totalReferrals >= milestone.target;
                const progress = Math.min((totalReferrals / milestone.target) * 100, 100);

                return (
                  <div key={index} className={`p-4 rounded-lg border ${isAchieved
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAchieved
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                          <milestone.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {milestone.target} referral{milestone.target > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">₹{milestone.reward}</p>
                        {isAchieved ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Achieved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            {totalReferrals}/{milestone.target}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isAchieved && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-sky-500 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {progress.toFixed(1)}% complete
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Referred Users */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Referred Users
            </h3>
            {referralData?.referredUsers && referralData.referredUsers.length > 0 ? (
              <div className="space-y-4">
                {referralData.referredUsers.map((referral, index) => (
                  <div key={referral.user?._id || referral._id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-medium">
                        {referral.user?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {referral.user?.name || referral.refereeName || 'User'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {referral.joinedAt ? `Joined ${new Date(referral.joinedAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₹{referral.rewardAmount || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No referred users yet. Share your link to start earning!
              </p>
            )}
          </div>

          {/* Referral Leaderboard */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Referral Leaderboard
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Top referrers in our community</p>
            <div className="space-y-4">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((item, idx) => {
                  const name = item?.user?.name || item?.name || item?.email || 'User';
                  const joined = item?.user?.createdAt || item?.createdAt || item?.joinedAt || null;
                  const amount = item?.totalRewards ?? item?.availableRewards ?? item?.rewardAmount ?? 0;

                  return (
                    <div key={item.user?._id || item._id || item.name || idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          {/* Rank badge */}
                          {(() => {
                            const rank = item?.rank ?? (idx + 1);
                            const rankClass = rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
                            return (
                              <div className={`flex items-center justify-center h-8 w-8 rounded-full font-semibold ${rankClass} mr-2`}>#{rank}</div>
                            );
                          })()}

                          <div className="h-10 w-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-medium">
                            {name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{joined ? `Joined ${new Date(joined).toLocaleDateString()}` : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">₹{amount}</p>
                        </div>
                      </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No leaderboard data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Rewards History
          </h3>

          <div className="space-y-4">
            {referralData?.rewardHistory && referralData.rewardHistory.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {referralData.rewardHistory.map(renderRewardHistoryItem)}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No reward history yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralProgram;