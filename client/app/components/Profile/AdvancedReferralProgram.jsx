"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  Gift,
  Share,
  Trophy,
  Users,
  ExternalLink,
  Star,
  Clipboard,
  Check,
  DollarSign,
  Copy,
  Award,
  TrendingUp,
  Calendar,
  Target,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Crown,
  Zap,
  BarChart3
} from "lucide-react";

const AdvancedReferralProgram = () => {
  const user = useSelector((state) => state?.auth?.user);
  const [referralData, setReferralData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (user) {
      fetchReferralData();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user/referral-info`, {
        withCredentials: true,
        timeout: 10000
      });
      setReferralData(data.data);
    } catch (error) {
      console.error("Error fetching referral data:", error);
      setServerError(true);
      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user/referral-leaderboard`, {
        timeout: 5000
      });
      setLeaderboard(data.data || []);
    } catch (error) {
      setLeaderboard([]);
    }
  };

  const copyReferralLink = async () => {
    if (referralData?.referralLink) {
      try {
        await navigator.clipboard.writeText(referralData.referralLink);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const shareToFacebook = () => {
    if (!referralData?.referralLink) return;
    const url = encodeURIComponent(referralData.referralLink);
    const text = encodeURIComponent("Join me on Flyobo and get amazing travel deals!");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const shareToTwitter = () => {
    if (!referralData?.referralLink) return;
    const url = encodeURIComponent(referralData.referralLink);
    const text = encodeURIComponent("🎉 Join me on Flyobo for amazing travel deals!");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToWhatsApp = () => {
    if (!referralData?.referralLink) return;
    const text = encodeURIComponent(`🎉 Hey! Join Flyobo using my referral link: ${referralData.referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!referralData?.referralLink) return;
    const subject = encodeURIComponent("Exclusive Travel Deals on Flyobo!");
    const body = encodeURIComponent(`Join Flyobo using my referral link: ${referralData.referralLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleRedeemRewards = async (e) => {
    e.preventDefault();
    const amount = parseFloat(redeemAmount);
    
    if (!amount || amount < 50) {
      toast.error("Minimum redemption amount is ₹50");
      return;
    }

    if (amount > referralData?.availableRewards) {
      toast.error("Insufficient rewards balance");
      return;
    }

    try {
      setRedeemLoading(true);
      const { data } = await axios.post(`${API_URL}/user/redeem-rewards`, 
        { amount }, 
        { withCredentials: true, timeout: 10000 }
      );
      
      toast.success("Rewards redeemed successfully");
      setRedeemAmount("");
      fetchReferralData();
    } catch (error) {
      toast.error("Failed to redeem rewards");
    } finally {
      setRedeemLoading(false);
    }
  };

  const getMilestones = () => [
    { id: 'first_referral', title: 'First Referral', target: 1, reward: 50, icon: Users },
    { id: '5_referrals', title: 'Social Butterfly', target: 5, reward: 250, icon: Share },
    { id: '10_referrals', title: 'Influencer', target: 10, reward: 500, icon: Star },
    { id: '25_referrals', title: 'Ambassador', target: 25, reward: 1000, icon: Award },
    { id: '50_referrals', title: 'Champion', target: 50, reward: 2500, icon: Trophy },
    { id: '100_referrals', title: 'Legend', target: 100, reward: 5000, icon: Crown }
  ];

  const getTierInfo = (tier) => {
    const tiers = {
      bronze: { name: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-100' },
      silver: { name: 'Silver', color: 'text-gray-600', bg: 'bg-gray-100' },
      gold: { name: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      platinum: { name: 'Platinum', color: 'text-purple-600', bg: 'bg-purple-100' },
      diamond: { name: 'Diamond', color: 'text-blue-600', bg: 'bg-blue-100' }
    };
    return tiers[tier] || tiers.bronze;
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Gift className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Join the Referral Program</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to access your referral dashboard.
        </p>
      </div>
    );
  }

  const currentTier = getTierInfo(referralData?.referralTier || 'bronze');
  const milestoneList = getMilestones();
  const totalReferrals = referralData?.totalReferrals || 0;

  return (
    <section className="w-full space-y-6">
      {/* Header with Tier Badge */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Referral Program</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentTier.bg} ${currentTier.color}`}>
                  {currentTier.name} Tier
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{totalReferrals} referrals</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Referral Code</p>
            <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
              {referralData?.referralCode || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'share', label: 'Share & Earn', icon: Share },
            { key: 'milestones', label: 'Milestones', icon: Target },
            { key: 'leaderboard', label: 'Leaderboard', icon: Trophy }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8" />
                <div>
                  <p className="text-sky-100 text-sm">Available Rewards</p>
                  <p className="text-2xl font-bold">₹{referralData?.availableRewards || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8" />
                <div>
                  <p className="text-emerald-100 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold">{totalReferrals}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8" />
                <div>
                  <p className="text-purple-100 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold">₹{referralData?.totalRewards || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Share</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={shareToWhatsApp} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
                <button onClick={shareViaEmail} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button onClick={shareToFacebook} className="flex items-center gap-2 px-3 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </button>
                <button onClick={shareToTwitter} className="flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </button>
              </div>
            </div>

            {referralData?.availableRewards > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Redeem Rewards</h3>
                <form onSubmit={handleRedeemRewards} className="space-y-3">
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="Enter amount (min. ₹50)"
                    min="50"
                    max={referralData?.availableRewards}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={redeemLoading}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {redeemLoading ? "Redeeming..." : "Redeem"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'share' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Referral Link</h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={referralData?.referralLink || "Loading..."}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-mono"
                />
              </div>
              <button
                onClick={copyReferralLink}
                className="flex items-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share on Social Media</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'WhatsApp', action: shareToWhatsApp, icon: MessageCircle, color: 'bg-green-600 hover:bg-green-700' },
                { name: 'Facebook', action: shareToFacebook, icon: Facebook, color: 'bg-blue-800 hover:bg-blue-900' },
                { name: 'Twitter', action: shareToTwitter, icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600' },
                { name: 'Email', action: shareViaEmail, icon: Mail, color: 'bg-gray-600 hover:bg-gray-700' }
              ].map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.name}
                    onClick={platform.action}
                    className={`flex flex-col items-center gap-2 px-4 py-6 text-white rounded-xl transition-colors ${platform.color}`}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="font-medium">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Referral Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestoneList.map((milestone) => {
              const Icon = milestone.icon;
              const isAchieved = totalReferrals >= milestone.target;
              const progress = Math.min((totalReferrals / milestone.target) * 100, 100);
              
              return (
                <div
                  key={milestone.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isAchieved 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isAchieved ? 'bg-green-500' : 'bg-gray-400'}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{milestone.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Invite {milestone.target} friends</p>
                      </div>
                    </div>
                    {isAchieved && <Check className="h-6 w-6 text-green-500" />}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress: {totalReferrals}/{milestone.target}</span>
                      <span className="font-semibold text-purple-600">₹{milestone.reward} reward</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isAchieved ? 'bg-green-500' : 'bg-sky-500'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Top Referrers
          </h3>
          
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((leader, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-sky-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{leader.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{leader.totalReferrals} referrals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{leader.totalRewards}</p>
                    {index < 3 && <Star className="inline h-4 w-4 text-yellow-500 ml-1" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No leaderboard data available</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AdvancedReferralProgram;