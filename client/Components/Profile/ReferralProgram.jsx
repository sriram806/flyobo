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
      if (data?.success){
        console.log(data);
        
        setReferralData(data.data);
      }
      else toast.error(data?.message || "Failed to fetch referral data");
    } catch (err) {
      if (err.response?.status === 401) toast.error("Please log in again.");
      else if (err.response?.status === 404) toast.error("Referral service not available");
      else toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
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
      toast.error("Minimum withdrawal amount is ₹50");
      return;
    }
    if (amount > totalReward) {
      toast.error("Insufficient rewards balance");
      return;
    }
    try {
      setRedeemLoading(true);
      const { data } = await axios.post(
        `${API_URL}/user/withdraw-referral-rewards`,
        { amount },
        { withCredentials: true, timeout: 10000 }
      );
      toast.success(data?.message || "Withdrawal request submitted successfully");
      setRedeemAmount("");
      fetchReferralData();
    } catch (err) {
      if (err.response?.status === 401) toast.error("Authentication required. Please log in.");
      else toast.error(err.response?.data?.message || "Failed to process withdrawal");
    } finally {
      setRedeemLoading(false);
    }
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
  const totalReferrals = referralData?.totalReferrals || 0;
  const totalReward = referralData?.totalReward || 0;

  const copyReferralLinkFull = async () => {
    if (!referralData?.referralLink) return;
    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast.success("Referral Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reward</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalReward}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Referral Code</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{referralData?.referralCode || "N/A"}</p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Withdraw Rewards
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{totalReward}</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-500 opacity-20" />
              </div>
              
              <form onSubmit={handleRedeemRewards} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Withdrawal Amount (Minimum ₹50)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="w-full px-4 py-3 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={redeemLoading || totalReward < 50}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={redeemLoading || !redeemAmount || parseInt(redeemAmount) < 50 || parseInt(redeemAmount) > totalReward || totalReward < 50}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {redeemLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5" />
                      Withdraw ₹{redeemAmount || 0}
                    </>
                  )}
                </button>
                
                {totalReward < 50 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 text-center">
                    You need at least ₹50 to withdraw
                  </p>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Amount will be credited to your registered bank account within 3-5 business days
                </p>
              </form>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Gift className="h-5 w-5" />Share Your Referral</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referral Code</label>
                <div className="flex gap-2">
                  <input type="text" value={referralData?.referralCode || ""} readOnly className="flex-1 px-4 py-3 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-lg" />
                  <button onClick={copyReferralLink} className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors">
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referral Link</label>
                <div className="flex gap-2">
                  <input type="text" value={referralData?.referralLink || ""} readOnly className="flex-1 px-4 py-3 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm" />
                  <button onClick={copyReferralLinkFull} className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    <Share className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>


        </div>
      )}


      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referred Users ({referralData?.referredUsers?.length || 0})
            </h3>
            {referralData?.referredUsers?.length > 0 ? (
              <div className="space-y-4">
                {referralData.referredUsers.map((r, idx) => (
                  <div key={r._id || idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-medium">
                        {r.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{r.user?.name || "User"}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {r.joinedAt ? `Joined ${new Date(r.joinedAt).toLocaleDateString()}` : "Recently joined"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="h-4 w-4" />
                        <span className="font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No referred users yet. Share your link to start earning!</p>
              </div>
            )}
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
