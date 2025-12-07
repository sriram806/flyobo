"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  Gift,
  Share,
  Trophy,
  Users,
  Check,
  DollarSign,
  Copy,
  Award,
} from "lucide-react";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

const ReferralProgram = () => {
  const user = useSelector((s) => s?.auth?.user);

  const [referralData, setReferralData] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const API_URL =
    NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const totalReferrals = referralData?.totalReferrals || 0;
  const totalReward = referralData?.totalReward || 0;

  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000,
  });

  const fetchReferralData = async () => {
    try {
      const { data } = await api.get("/user/referral-info");
      if (data?.success) {
        setReferralData(data.data);
      } else {
        toast.error(data?.message || "Failed to fetch referral data");
      }
    } catch (err) {
      if (err.response?.status === 401) toast.error("Please log in again.");
      else if (err.response?.status === 404)
        toast.error("Referral service not available");
      else toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      setHistoryLoading(true);
      // 👇 FIXED URL: added /user/ prefix to match backend style
      const { data } = await api.get("/user/referral-withdrawals", {
        params: { status: "all", limit: 50 },
      });
      if (data?.success) {
        setWithdrawalHistory(data.data?.withdrawals || []);
      }
    } catch (err) {
      console.error("Failed to fetch withdrawal history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!API_URL) {
      toast.error("API URL not configured");
      setLoading(false);
      return;
    }

    if (!user) {
      setReferralData(null);
      setWithdrawalHistory([]);
      setLoading(false);
      toast.error("Please log in to access the referral program");
      return;
    }

    setLoading(true);
    setReferralData(null);
    setWithdrawalHistory([]);

    (async () => {
      await Promise.all([fetchReferralData(), fetchWithdrawalHistory()]);
    })();
  }, [user, API_URL]);

  const handleCopy = async (value, successMsg = "Copied!") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(successMsg);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
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
      const { data } = await api.post("/user/withdraw-referral-rewards", {
        amount,
      });

      toast.success(
        data?.message || "Withdrawal request submitted successfully"
      );
      setRedeemAmount("");
      fetchReferralData();
      fetchWithdrawalHistory();
    } catch (err) {
      if (err.response?.status === 401)
        toast.error("Authentication required. Please log in.");
      else
        toast.error(
          err.response?.data?.message || "Failed to process withdrawal"
        );
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Gift className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Join the Referral Program
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign up to start earning rewards by referring friends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-md">
            Invite friends to explore travel packages and earn rewards for
            successful referrals.
          </p>
        </div>
      </div>

      {/* TABS */}
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-sky-500 text-sky-600 dark:text-sky-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Referrals
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalReferrals}
                  </p>
                </div>
                <Users className="h-8 w-8 text-sky-500" />
              </div>
            </div>

            <div className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Reward
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{totalReward}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Referral Code
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                    {referralData?.referralCode || "N/A"}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* WITHDRAW SECTION */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Withdraw Rewards
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Available Balance
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ₹{totalReward}
                  </p>
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
                    min={50}
                    step={10}
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="w-full px-4 py-3 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={redeemLoading || totalReward < 50}
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    redeemLoading ||
                    !redeemAmount ||
                    parseInt(redeemAmount, 10) < 50 ||
                    parseInt(redeemAmount, 10) > totalReward ||
                    totalReward < 50
                  }
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {redeemLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
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
                  Amount will be credited to your registered bank account
                  within 3–5 business days
                </p>
              </form>
            </div>
          </div>

          {/* SHARE SECTION */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Share Your Referral
            </h3>

            <div className="space-y-4">
              {/* CODE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Referral Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralData?.referralCode || ""}
                    readOnly
                    className="flex-1 px-4 py-3 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        referralData?.referralCode,
                        "Referral code copied!"
                      )
                    }
                    className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* LINK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Referral Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralData?.referralLink || ""}
                    readOnly
                    className="flex-1 px-4 py-3 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        referralData?.referralLink,
                        "Referral link copied!"
                      )
                    }
                    className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Share className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referred Users ({referralData?.referredUsers?.length || 0})
            </h3>

            {referralData?.referredUsers?.length ? (
              <div className="space-y-4">
                {referralData.referredUsers.map((r, idx) => (
                  <div
                    key={r._id || idx}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-medium">
                        {r.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {r.user?.name || "User"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {r.joinedAt
                            ? `Joined ${new Date(
                                r.joinedAt
                              ).toLocaleDateString()}`
                            : "Recently joined"}
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
                <p className="text-gray-500 dark:text-gray-400">
                  No referred users yet. Share your link to start earning!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REWARDS TAB */}
      {activeTab === "rewards" && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            Withdrawal History
          </h3>

          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            </div>
          ) : withdrawalHistory.length ? (
            <div className="space-y-3">
              {withdrawalHistory.map((withdrawal, idx) => {
                const statusColors = {
                  pending:
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                  processed:
                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                  failed:
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                };
                const statusIcons = {
                  pending: "⏳",
                  processed: "✅",
                  failed: "❌",
                };

                return (
                  <div
                    key={withdrawal._id || idx}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹
                            {withdrawal.amount?.toLocaleString("en-IN") || 0}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              statusColors[withdrawal.status] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusIcons[withdrawal.status] || "•"}{" "}
                            {withdrawal.status?.toUpperCase() || "N/A"}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            <span className="font-medium">Requested:</span>{" "}
                            {withdrawal.requestedAt
                              ? new Date(
                                  withdrawal.requestedAt
                                ).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "N/A"}
                          </p>

                          {withdrawal.processedAt && (
                            <p>
                              <span className="font-medium">Processed:</span>{" "}
                              {new Date(
                                withdrawal.processedAt
                              ).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          )}

                          {withdrawal.notes && (
                            <p className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                              <span className="font-medium text-gray-900 dark:text-white">
                                Note:
                              </span>{" "}
                              <span className="text-gray-700 dark:text-gray-300">
                                {withdrawal.notes}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        {withdrawal.status === "pending" && (
                          <div className="animate-pulse">
                            <div className="h-10 w-10 bg-yellow-200 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                          </div>
                        )}
                        {withdrawal.status === "processed" && (
                          <div className="h-10 w-10 bg-green-200 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        {withdrawal.status === "failed" && (
                          <div className="h-10 w-10 bg-red-200 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                No Withdrawal History
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Your withdrawal requests will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralProgram;
