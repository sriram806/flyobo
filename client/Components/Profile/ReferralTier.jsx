"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Crown } from "lucide-react";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

export default function ReferralTier() {
    const [loading, setLoading] = useState(true);
    const [referralData, setReferralData] = useState(null);

    const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/user/referral-info`, { withCredentials: true });
            if (data.success) {
                setReferralData(data.data);
            }
        } catch (err) {
            console.error("Failed to load referral info", err);
            toast.error("Failed to load referral info");
        } finally {
            setLoading(false);
        }
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

        // Determine tier from milestones (if present) or fallback to totalReferrals
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

    if (loading) {
        return (
            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="animate-pulse h-12 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
        );
    }

    const tierInfo = getTierInfo();
    const totalReferrals = referralData?.totalReferrals || 0;

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${tierInfo.bg}`}>
                        <Crown className={`h-5 w-5 ${tierInfo.color}`} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Referral Tier</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${tierInfo.bg} ${tierInfo.color}`}>
                                {tierInfo.name} Tier
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Referrals</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{totalReferrals}</div>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <div>
                    Next: {tierInfo.nextTier ? tierInfo.nextTier.charAt(0).toUpperCase() + tierInfo.nextTier.slice(1) : 'Max'}
                </div>
                <div>
                    {tierInfo.nextThreshold ? `${totalReferrals}/${tierInfo.nextThreshold}` : 'Max Tier'}
                </div>
            </div>
        </div>
    );
}
