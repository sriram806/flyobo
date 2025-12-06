"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  Gift, Share, Trophy, Users, Star, Check, DollarSign,
  Copy, Award, TrendingUp, Target, Crown
} from "lucide-react";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import ReferralTier from "./ReferralTier";

const ReferralProgram = () => {
  const user = useSelector((s) => s?.auth?.user);
  const [referralData, setReferralData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchReferralData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user/referral-info`, {
        withCredentials: true,
        timeout: 10000,
      });
      if (data?.success) setReferralData(data.data);
      else toast.error(data?.message || "Failed to fetch referral data");
    } catch (err) {
      if (err.response?.status === 401) toast.error("Please log in again.");
      else if (err.response?.status === 404) toast.error("Referral service not available");
      else toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user/referral-leaderboard?limit=10`, {
        withCredentials: true,
      });
      if (data?.success) setLeaderboard(data.data || []);
      else toast.error("Failed to load leaderboard");
    } catch {
      toast.error("Failed to load leaderboard");
    }
  };

  useEffect(() => {
    if (!API_URL) {
      toast.error("API URL not configured");
      setLoading(false);
      return;
    }
    if (user) fetchReferralData();
    else {
      setLoading(false);
      toast.error("Please log in to access the referral program");
    }
    fetchLeaderboard();
  }, [user]);

  const copyReferralLink = async () => {
    if (!referralData?.referralCode) return;
    try {
      await navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      toast.success("Referral Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleRedeemRewards = async (e) => {
    e.preventDefault();
    const amount = parseInt(redeemAmount, 10);
    if (!amount || amount < 50) {
      toast.error("Minimum redemption amount is ₹50");
      return;
    }
    if (amount > (referralData?.availableRewards || 0)) {
      toast.error("Insufficient rewards balance");
      return;
    }
    try {
      const bankResp = await axios.get(`${API_URL}/user/bank-details`, { withCredentials: true });
      if (!(bankResp?.data?.success && bankResp.data.data?.accountNumber)) {
        toast.error("Add bank details under Profile → Bank Details before redeeming.");
        return;
      }
    } catch {
      toast.error("Unable to verify bank details. Try later.");
      return;
    }
    try {
      setRedeemLoading(true);
      const { data } = await axios.post(
        `${API_URL}/user/redeem-rewards`,
        { amount },
        { withCredentials: true, timeout: 10000 }
      );
      toast.success(data?.message || "Rewards redeemed successfully");
      setRedeemAmount("");
      fetchReferralData();
    } catch (err) {
      if (err.response?.status === 401) toast.error("Authentication required. Please log in.");
      else toast.error(err.response?.data?.message || "Failed to redeem rewards");
    } finally {
      setRedeemLoading(false);
    }
  };

  const getMilestoneData = () => {
    if (!referralData) return [];
    const base = [
      { id: "first_referral", title: "First Referral", target: 1, reward: 50, icon: Users },
      { id: "5_referrals", title: "Social Butterfly", target: 5, reward: 100, icon: Share },
      { id: "10_referrals", title: "Influencer", target: 10, reward: 250, icon: Star },
      { id: "25_referrals", title: "Ambassador", target: 25, reward: 500, icon: Award },
      { id: "50_referrals", title: "Champion", target: 50, reward: 1000, icon: Trophy },
      { id: "100_referrals", title: "Legend", target: 100, reward: 2500, icon: Crown },
    ];
    return base.map((m) => {
      const userMilestone = referralData.milestones?.find((x) => x.milestone === m.id);
      return { ...m, achieved: !!userMilestone, achievedAt: userMilestone?.achievedAt || null };
    });
  };

  const getTierInfo = () => {
    const tiers = {
      first: { name: "First Referral", nextThreshold: 5 },
      social: { name: "Social Butterfly", nextThreshold: 10 },
      influencer: { name: "Influencer", nextThreshold: 25 },
      ambassador: { name: "Ambassador", nextThreshold: 50 },
      champion: { name: "Champion", nextThreshold: 100 },
      legend: { name: "Legend", nextThreshold: null },
    };
    const totalReferrals = referralData?.totalReferrals || 0;
    const milestoneAchieved = (id) => !!referralData?.milestones?.find((m) => m.milestone === id && m.achieved);
    if (milestoneAchieved("100_referrals") || totalReferrals >= 100) return tiers.legend;
    if (milestoneAchieved("50_referrals") || totalReferrals >= 50) return tiers.champion;
    if (milestoneAchieved("25_referrals") || totalReferrals >= 25) return tiers.ambassador;
    if (milestoneAchieved("10_referrals") || totalReferrals >= 10) return tiers.influencer;
    if (milestoneAchieved("5_referrals") || totalReferrals >= 5) return tiers.social;
    return tiers.first;
  };

  const getTierProgress = () => {
    if (!referralData) return 0;
    const info = getTierInfo();
    if (!info?.nextThreshold) return 100;
    const progress = (referralData.totalReferrals / info.nextThreshold) * 100;
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Gift className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Join the Referral Program</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Sign up to start earning rewards by referring friends.</p>
      </div>
    );
  }

  const milestoneList = getMilestoneData();
  const tierInfo = getTierInfo();
  const tierProgress = getTierProgress();
  const totalReferrals = referralData?.totalReferrals || 0;

  return (
    <div className="space-y-6 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">Referral Program</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-md">Invite friends to explore travel packages and earn rewards for successful referrals.</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "milestones", label: "Milestones" },
            { id: "analytics", label: "Analytics" },
            { id: "rewards", label: "Rewards History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-sky-500" />
              </div>
            </div>

            <div className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Rewards</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{referralData?.availableRewards || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{referralData?.totalRewards || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Gift className="h-5 w-5" />Your Referral Code</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referral Code</label>
                <div className="flex gap-2">
                  <input type="text" value={referralData?.referralCode || ""} readOnly className="flex-1 px-4 py-3 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono" />
                  <button onClick={copyReferralLink} className="px-4 py-3 bg-gray-200/80 dark:bg-gray-800 rounded-lg">
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <ReferralTier />
          </div>

          {referralData?.availableRewards > 0 && (
            <div className="rounded-2xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Redeem Rewards</h3>
              <form onSubmit={handleRedeemRewards} className="flex flex-col sm:flex-row gap-4">
                <input type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} placeholder="Enter amount (min. ₹50)" min="50" max={referralData?.availableRewards} className="flex-1 px-4 py-3 border rounded-lg" />
                <button type="submit" disabled={redeemLoading || !redeemAmount} className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg">
                  {redeemLoading ? "Processing..." : "Redeem"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === "milestones" && (
        <div className="space-y-6">
          <div className="rounded-2xl border p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Target className="h-5 w-5" />Referral Milestones</h3>
            <div className="space-y-4">
              {milestoneList.map((milestone, i) => {
                const isAchieved = totalReferrals >= milestone.target;
                const progress = Math.min((totalReferrals / milestone.target) * 100, 100);
                const Icon = milestone.icon;
                return (
                  <div key={i} className={`p-4 rounded-lg border ${isAchieved ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAchieved ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}><Icon className="h-5 w-5" /></div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                          <p className="text-sm text-gray-600">{milestone.target} referral{milestone.target > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{milestone.reward}</p>
                        {isAchieved ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Achieved</span> : <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{totalReferrals}/{milestone.target}</span>}
                      </div>
                    </div>
                    {!isAchieved && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{progress.toFixed(1)}% complete</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border p-6">
            <h3 className="text-xl font-bold mb-4">Referred Users</h3>
            {referralData?.referredUsers?.length > 0 ? (
              <div className="space-y-4">
                {referralData.referredUsers.map((r, idx) => (
                  <div key={r.user?._id || idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-medium">{r.user?.name?.[0] || "U"}</div>
                      <div>
                        <p className="font-medium">{r.user?.name || r.refereeName || "User"}</p>
                        <p className="text-sm text-gray-600">{r.joinedAt ? `Joined ${new Date(r.joinedAt).toLocaleDateString()}` : ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{r.rewardAmount || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No referred users yet. Share your link to start earning!</p>
            )}
          </div>

          <div className="rounded-2xl border p-6">
            <h3 className="text-xl font-bold mb-4">Referral Leaderboard</h3>
            <p className="text-sm text-gray-600 mb-4">Top referrers in our community</p>
            <div className="space-y-4">
              {leaderboard.length > 0 ? (
                leaderboard.map((item, idx) => {
                  const name = item?.user?.name || item?.name || item?.email || "User";
                  const joined = item?.user?.createdAt || item?.createdAt || null;
                  const amount = item?.totalRewards ?? item?.availableRewards ?? 0;
                  const rank = item?.rank ?? idx + 1;
                  return (
                    <div key={item.user?._id || idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full font-semibold ${rank === 1 ? "bg-yellow-100 text-yellow-800" : rank === 2 ? "bg-gray-100 text-gray-800" : rank === 3 ? "bg-orange-100 text-orange-800" : "bg-gray-50 text-gray-700"}`}>#{rank}</div>
                        <div className="h-10 w-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-medium">{name?.[0] || "U"}</div>
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-gray-600">{joined ? `Joined ${new Date(joined).toLocaleDateString()}` : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{amount}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No leaderboard data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="rounded-2xl border p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><DollarSign className="h-5 w-5" />Rewards History</h3>
          <div className="space-y-4">
            {referralData?.rewardHistory?.length > 0 ? (
              <div className="divide-y">
                {referralData.rewardHistory.map((reward) => {
                  const isPositive = reward.amount > 0;
                  const statusColors = {
                    pending: "bg-yellow-100 text-yellow-800",
                    credited: "bg-green-100 text-green-800",
                    used: "bg-blue-100 text-blue-800",
                    expired: "bg-red-100 text-red-800",
                  };
                  return (
                    <div key={reward._id} className="flex items-center justify-between py-3">
                      <div className="flex-1">
                        <p className="font-medium">{reward.description}</p>
                        <p className="text-sm text-gray-600">{new Date(reward.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{isPositive ? "+" : ""}{reward.amount}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[reward.status] || "bg-gray-100 text-gray-800"}`}>{reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reward history yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralProgram;
