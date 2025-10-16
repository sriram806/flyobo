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
  CheckCircle,
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
  BarChart3,
  Shield
} from "lucide-react";

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
  const [milestones, setMilestones] = useState([]);
  const [socialShareCounts, setSocialShareCounts] = useState({
    facebook: 0,
    twitter: 0,
    whatsapp: 0,
    email: 0
  });

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  // Debug logging
  useEffect(() => {
    console.log("Referral Program - API_URL:", API_URL);
    console.log("Referral Program - User:", user ? "Logged in" : "Not logged in");
  }, []);

  useEffect(() => {
    // Test server connectivity first
    const testConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/user/profile`, { 
          method: 'GET',
          credentials: 'include'
        });
        console.log("Server connection test:", response.status);
        setServerError(response.status >= 400);
      } catch (error) {
        console.error("Server connection failed:", error);
        setServerError(true);
      }
    };

    if (API_URL) {
      testConnection();
    }

    if (user) {
      fetchReferralData();
    } else {
      setLoading(false);
      toast.error("Please log in to access the referral program");
    }
    
    // Fetch leaderboard regardless of login status
    fetchLeaderboard();
  }, [user]);

  const fetchReferralData = async () => {
    try {
      if (!API_URL) {
        toast.error("API configuration missing");
        return;
      }

      if (!user) {
        console.log("No user found, skipping referral data fetch");
        return;
      }

      const { data } = await axios.get(`${API_URL}/user/referral-info`, {
        withCredentials: true,
        timeout: 10000 // 10 second timeout
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
      if (!API_URL) {
        console.warn("API URL not configured");
        return;
      }
      
      const { data } = await axios.get(`${API_URL}/user/referral-leaderboard`, {
        withCredentials: true,
        timeout: 5000 // 5 second timeout
      });
      
      if (data.success) {
        setLeaderboard(data.data || []);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Don't show error to user for leaderboard, just set empty array
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

  const shareReferralLink = async () => {
    if (navigator.share && referralData?.referralLink) {
      try {
        await navigator.share({
          title: 'Join Flyobo Travel',
          text: `Join me on Flyobo and get ₹50 bonus! Use my referral code: ${referralData.referralCode}`,
          url: referralData.referralLink
        });
      } catch (error) {
        console.log("Share failed:", error);
        copyReferralLink();
      }
    } else {
      copyReferralLink();
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

    if (!API_URL) {
      toast.error("API configuration missing");
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
        toast.error("Unable to connect to server. Please try again.");
      } else if (error.response?.status === 401) {
        setAuthError(true);
        toast.error("Authentication required. Please log in again.");
      } else {
        const msg = error?.response?.data?.message || "Failed to redeem rewards";
        toast.error(msg);
      }
    } finally {
      setRedeemLoading(false);
    }
  };

  // Advanced Social Sharing Functions
  const shareToFacebook = () => {
    if (!referralData?.referralLink) return;
    
    const url = encodeURIComponent(referralData.referralLink);
    const text = encodeURIComponent("Join me on Flyobo and get amazing travel deals! Use my referral code for exclusive bonuses.");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    trackSocialShare('facebook');
  };

  const shareToTwitter = () => {
    if (!referralData?.referralLink) return;
    
    const url = encodeURIComponent(referralData.referralLink);
    const text = encodeURIComponent("🎉 Join me on Flyobo for amazing travel deals! Use my referral code for exclusive bonuses 🎁");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    trackSocialShare('twitter');
  };

  const shareToWhatsApp = () => {
    if (!referralData?.referralLink) return;
    
    const text = encodeURIComponent(`🎉 Hey! I'm using Flyobo for amazing travel deals. Join using my referral link and we both get exclusive bonuses! ${referralData.referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    trackSocialShare('whatsapp');
  };

  const shareViaEmail = () => {
    if (!referralData?.referralLink) return;
    
    const subject = encodeURIComponent("Exclusive Travel Deals on Flyobo!");
    const body = encodeURIComponent(`Hi there!\n\nI've been using Flyobo for booking amazing travel packages and thought you'd love it too!\n\nUse my referral link to join and we both get exclusive bonuses:\n${referralData.referralLink}\n\nHappy travels!\n`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    trackSocialShare('email');
  };

  const trackSocialShare = async (platform) => {
    try {
      await axios.post(`${API_URL}/user/track-social-share`, {
        platform
      }, {
        withCredentials: true
      });
      setSocialShareCounts(prev => ({
        ...prev,
        [platform]: prev[platform] + 1
      }));
    } catch (error) {
      console.error("Error tracking social share:", error);
    }
  };

  // Milestone and Tier Functions
  const getMilestones = () => [
    { id: 'first_referral', title: 'First Referral', description: 'Invite your first friend', target: 1, reward: 50, icon: Users },
    { id: '5_referrals', title: 'Social Butterfly', description: 'Invite 5 friends', target: 5, reward: 250, icon: Share },
    { id: '10_referrals', title: 'Influencer', description: 'Invite 10 friends', target: 10, reward: 500, icon: Star },
    { id: '25_referrals', title: 'Ambassador', description: 'Invite 25 friends', target: 25, reward: 1000, icon: Award },
    { id: '50_referrals', title: 'Champion', description: 'Invite 50 friends', target: 50, reward: 2500, icon: Trophy },
    { id: '100_referrals', title: 'Legend', description: 'Invite 100 friends', target: 100, reward: 5000, icon: Crown }
  ];

  const getTierInfo = (tier) => {
    const tiers = {
      bronze: { 
        name: 'Bronze', 
        color: 'text-orange-600', 
        bg: 'bg-orange-100', 
        bgColor: 'bg-orange-100 dark:bg-orange-900', 
        icon: Award, 
        benefits: ['5% bonus on rewards'] 
      },
      silver: { 
        name: 'Silver', 
        color: 'text-gray-600', 
        bg: 'bg-gray-100', 
        bgColor: 'bg-gray-100 dark:bg-gray-700', 
        icon: Trophy, 
        benefits: ['10% bonus on rewards', 'Priority support'] 
      },
      gold: { 
        name: 'Gold', 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900', 
        icon: Crown, 
        benefits: ['15% bonus on rewards', 'Priority support', 'Exclusive offers'] 
      },
      platinum: { 
        name: 'Platinum', 
        color: 'text-purple-600', 
        bg: 'bg-purple-100', 
        bgColor: 'bg-purple-100 dark:bg-purple-900', 
        icon: Crown, 
        benefits: ['20% bonus on rewards', 'Priority support', 'Exclusive offers', 'Early access'] 
      },
      diamond: { 
        name: 'Diamond', 
        color: 'text-blue-600', 
        bg: 'bg-blue-100', 
        bgColor: 'bg-blue-100 dark:bg-blue-900', 
        icon: Crown, 
        benefits: ['25% bonus on rewards', 'VIP support', 'Exclusive offers', 'Early access', 'Personal manager'] 
      }
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

  if (authError && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="h-16 w-16 text-yellow-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Authentication Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your session has expired or you need to log in to access the referral program.
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => {
              setAuthError(false);
              window.location.href = '/login';
            }}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors mr-3"
          >
            Go to Login
          </button>
          <button 
            onClick={() => {
              setAuthError(false);
              fetchReferralData();
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (serverError && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ExternalLink className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Server Connection Error
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Unable to connect to the server. Please make sure the backend is running on port 5000.
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>Trying to connect to: {API_URL}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
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
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to access your referral dashboard and start earning rewards.
        </p>
      </div>
    );
  }

  const shareOnSocial = (platform) => {
    const referralLink = `${window.location.origin}/register?ref=${referralData?.referralCode}`;
    const message = `Join FlyObo using my referral code ${referralData?.referralCode} and get ₹50 bonus! ${referralLink}`;
    
    // Update share counts
    setSocialShareCounts(prev => ({
      ...prev,
      [platform]: prev[platform] + 1
    }));
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      email: `mailto:?subject=Join FlyObo&body=${encodeURIComponent(message)}`
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  const currentTier = getTierInfo(referralData?.referralTier || 'bronze');
  const milestoneList = getMilestones();
  const totalReferrals = referralData?.totalReferrals || 0;

  return (
    <section className="w-full space-y-6">
      {!referralData && !loading && user && !authError && !serverError && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Unable to load referral data. This might be a temporary issue.
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchReferralData();
              }}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Header with Tier Badge */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Referral Program
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentTier.bg} ${currentTier.color}`}>
                  {currentTier.name} Tier
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {totalReferrals} referrals
                </span>
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
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
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
          {/* Header Stats */}
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
              <p className="text-2xl font-bold">{referralData?.totalReferrals || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Gift className="h-8 w-8" />
            <div>
              <p className="text-purple-100 text-sm">Total Earned</p>
              <p className="text-2xl font-bold">₹{referralData?.totalRewards || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Your Referral Code
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={referralData?.referralCode || ''}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-lg font-bold text-center"
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <span className="text-xs bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-2 py-1 rounded">
                  Code
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyReferralLink}
              className="flex items-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            
            <button
              onClick={shareReferralLink}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <Share className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>How it works:</strong> Share your referral code with friends. They get ₹50 signup bonus, 
            and you earn ₹100 for each successful referral!
          </p>
        </div>
      </div>

      {/* Redeem Rewards */}
      {referralData?.availableRewards > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
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
              {redeemLoading ? 'Processing...' : 'Redeem Now'}
            </button>
          </form>
        </div>
      )}

      {/* Referral History */}
      {referralData?.referredUsers?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Your Referrals
          </h3>
          
          <div className="space-y-3">
            {referralData.referredUsers.map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                    {referral.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {referral.user?.name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(referral.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+₹{referral.rewardAmount}</p>
                  <p className="text-xs text-gray-500">
                    {referral.rewardClaimed ? 'Claimed' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      )}

      {/* Share & Earn Tab */}
      {activeTab === 'share' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share & Earn Rewards
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => shareOnSocial('facebook')}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Facebook className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('twitter')}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Twitter className="h-6 w-6 text-blue-400" />
                <span className="text-sm font-medium">Twitter</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('whatsapp')}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <MessageCircle className="h-6 w-6 text-green-500" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('email')}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Mail className="h-6 w-6 text-gray-600" />
                <span className="text-sm font-medium">Email</span>
              </button>
            </div>

            <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sharing Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Facebook shares:</span>
                  <span className="font-medium ml-2">{socialShareCounts.facebook}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Twitter shares:</span>
                  <span className="font-medium ml-2">{socialShareCounts.twitter}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">WhatsApp shares:</span>
                  <span className="font-medium ml-2">{socialShareCounts.whatsapp}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Email shares:</span>
                  <span className="font-medium ml-2">{socialShareCounts.email}</span>
                </div>
              </div>
            </div>
          </div>
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
                  <div key={index} className={`p-4 rounded-lg border ${
                    isAchieved 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isAchieved ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {isAchieved ? <CheckCircle className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{milestone.reward}</p>
                        <p className="text-xs text-gray-500">{milestone.target} referrals</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isAchieved ? 'bg-green-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {isAchieved 
                        ? 'Milestone achieved!' 
                        : `${milestone.target - totalReferrals} more referrals needed`
                      }
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Referral Champions
            </h3>
            
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((leader, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-600'
                      }`}>
                        {index === 0 ? <Crown className="h-5 w-5" /> : index + 1}
                      </div>
                      <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                        {leader.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {leader.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {leader.totalReferrals} referrals
                        </p>
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
                <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No leaderboard data yet</h4>
                <p className="text-gray-600 dark:text-gray-400">Start referring friends to see the leaderboard!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Referral Leaderboard
          </h3>
          
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((leader, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                    {leader.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {leader.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {leader.totalReferrals} referrals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{leader.totalRewards}</p>
                  {index < 3 && <Star className="inline h-4 w-4 text-yellow-500 ml-1" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ReferralProgram;