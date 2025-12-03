import User from "../models/user.model.js";
import Booking from "../models/bookings.model.js";
import { sendReferralNotification, sendMilestoneNotification, sendTierUpgradeNotification } from "./notification.services.js";

export const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Process referral rewards automatically when a booking is completed
export const processAutomaticReferralReward = async (bookingId) => {
    try {
        // Find the booking with populated user data
        const booking = await Booking.findById(bookingId).populate('userId');
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Check if booking is completed and has a valid payment
        if (booking.status !== 'completed' || booking.payment_info.status !== 'completed') {
            return { success: false, message: 'Booking is not completed or payment is not confirmed' };
        }

        // Check if user was referred
        const user = await User.findById(booking.userId._id).populate('referral.referredBy');
        if (!user || !user.referral.referredBy) {
            return { success: true, message: 'User was not referred, no referral reward to process' };
        }

        // Check if this user has already been converted (to avoid duplicate rewards)
        const referrer = await User.findById(user.referral.referredBy._id);
        if (!referrer) {
            return { success: false, message: 'Referrer not found' };
        }

        // Check if user already has a converted referral record
        const existingConvertedReferral = referrer.referral.referredUsers.find(
            ref => ref.user.toString() === user._id.toString() && ref.conversionStatus === 'converted'
        );

        if (existingConvertedReferral) {
            return { success: true, message: 'Referral reward already processed for this user' };
        }

        // Calculate reward amount (10% of booking amount or ₹100, whichever is higher)
        const rewardAmount = Math.max(100, Math.round(booking.totalAmount * 0.10));

        // Update referrer's referral statistics
        referrer.referral.totalRewards += rewardAmount;
        referrer.referral.availableRewards += rewardAmount;
        referrer.referral.referralStats.revenueGenerated += booking.totalAmount;
        referrer.referral.referralStats.totalConversions += 1;
        referrer.referral.referralStats.lastActivityDate = new Date();

        // Update conversion rate
        if (referrer.referral.referralStats.totalClicks > 0) {
            referrer.referral.referralStats.conversionRate =
                (referrer.referral.referralStats.totalConversions / referrer.referral.referralStats.totalClicks) * 100;
        }

        // Add reward to referrer's history
        referrer.referral.rewardHistory.push({
            type: 'booking_bonus',
            amount: rewardAmount,
            description: `Reward for ${user.name}'s first booking (₹${booking.totalAmount})`,
            status: 'credited',
            createdAt: new Date()
        });

        // Update referred user's referral data in referrer's record
        const referredUserIndex = referrer.referral.referredUsers.findIndex(
            ref => ref.user.toString() === user._id.toString()
        );

        if (referredUserIndex !== -1) {
            // Update existing referral record
            referrer.referral.referredUsers[referredUserIndex].conversionStatus = 'converted';
            referrer.referral.referredUsers[referredUserIndex].firstBookingDate = new Date();
            referrer.referral.referredUsers[referredUserIndex].totalBookingValue = booking.totalAmount;
            referrer.referral.referredUsers[referredUserIndex].rewardAmount = rewardAmount;
        } else {
            // Create new referral record
            referrer.referral.referredUsers.push({
                user: user._id,
                joinedAt: user.createdAt,
                rewardAmount: rewardAmount,
                conversionStatus: 'converted',
                firstBookingDate: new Date(),
                totalBookingValue: booking.totalAmount
            });
        }

        // Update referrer's total referrals count
        referrer.referral.totalReferrals = referrer.referral.referredUsers.filter(
            ref => ref.conversionStatus === 'converted'
        ).length;

        // Check for milestone achievements
        const previousMilestones = [...referrer.referral.milestones];
        referrer.checkMilestones();

        // Check for tier upgrade
        const previousTier = referrer.referral.referralTier;
        referrer.updateReferralTier();
        const newTier = referrer.referral.referralTier;

        // Save referrer data
        await referrer.save();

        // Update referred user's referral data
        const userReferredUserIndex = user.referral.referredUsers.findIndex(
            ref => ref.user.toString() === user._id.toString()
        );

        if (userReferredUserIndex !== -1) {
            user.referral.referredUsers[userReferredUserIndex].conversionStatus = 'converted';
            user.referral.referredUsers[userReferredUserIndex].firstBookingDate = new Date();
            user.referral.referredUsers[userReferredUserIndex].totalBookingValue = booking.totalAmount;
        } else {
            user.referral.referredUsers.push({
                user: user._id,
                joinedAt: user.createdAt,
                rewardAmount: 0, // No reward for the referred user in this case
                conversionStatus: 'converted',
                firstBookingDate: new Date(),
                totalBookingValue: booking.totalAmount
            });
        }

        await user.save();

        // Send notification to referrer
        await sendReferralNotification(
            referrer._id,
            user.name,
            rewardAmount,
            booking.totalAmount
        );

        // Check for new milestones and send notifications
        referrer.referral.milestones.forEach((milestone, index) => {
            if (milestone.achieved && !previousMilestones[index]?.achieved) {
                sendMilestoneNotification(
                    referrer._id,
                    milestone.milestone,
                    milestone.reward
                );
            }
        });

        // Check for tier upgrade and send notification
        if (newTier !== previousTier) {
            sendTierUpgradeNotification(referrer._id, newTier);
        }

        return {
            success: true,
            message: `Referral reward of ₹${rewardAmount} processed successfully`,
            rewardAmount,
            referrerId: referrer._id,
            referredUserId: user._id
        };
    } catch (error) {
        console.error('Error processing automatic referral reward:', error);
        return { success: false, message: 'Error processing referral reward', error: error.message };
    }
};

// Process bulk referral rewards
export const processBulkReferralRewards = async (bookingIds) => {
    try {
        const results = [];

        for (const bookingId of bookingIds) {
            const result = await processAutomaticReferralReward(bookingId);
            results.push({
                bookingId,
                ...result
            });
        }

        return {
            success: true,
            message: `Processed ${results.length} referral rewards`,
            results
        };
    } catch (error) {
        console.error('Error processing bulk referral rewards:', error);
        return { success: false, message: 'Error processing bulk referral rewards', error: error.message };
    }
};

// Get referral statistics for dashboard
export const getReferralStatistics = async () => {
    try {
        // Get total users with referrals
        const usersWithReferrals = await User.countDocuments({
            'referral.totalReferrals': { $gt: 0 }
        });

        // Get total referral rewards
        const totalRewardsAggregation = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalRewards: { $sum: '$referral.totalRewards' },
                    totalAvailableRewards: { $sum: '$referral.availableRewards' }
                }
            }
        ]);

        // Get top referrers
        const topReferrers = await User.find({
            'referral.totalReferrals': { $gt: 0 }
        })
            .select('name email referral')
            .sort({ 'referral.totalReferrals': -1 })
            .limit(10);

        // Get recent conversions
        const recentConversions = await User.aggregate([
            {
                $match: {
                    'referral.referredUsers.conversionStatus': 'converted'
                }
            },
            {
                $unwind: '$referral.referredUsers'
            },
            {
                $match: {
                    'referral.referredUsers.conversionStatus': 'converted'
                }
            },
            {
                $sort: {
                    'referral.referredUsers.firstBookingDate': -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'referral.referredUsers.user',
                    foreignField: '_id',
                    as: 'referredUser'
                }
            },
            {
                $unwind: '$referredUser'
            },
            {
                $project: {
                    referrerName: '$name',
                    referrerEmail: '$email',
                    referredUserName: '$referredUser.name',
                    referredUserEmail: '$referredUser.email',
                    rewardAmount: '$referral.referredUsers.rewardAmount',
                    bookingValue: '$referral.referredUsers.totalBookingValue',
                    conversionDate: '$referral.referredUsers.firstBookingDate'
                }
            }
        ]);

        return {
            success: true,
            data: {
                usersWithReferrals,
                totalRewards: totalRewardsAggregation[0]?.totalRewards || 0,
                totalAvailableRewards: totalRewardsAggregation[0]?.totalAvailableRewards || 0,
                topReferrers: topReferrers.map(user => ({
                    name: user.name,
                    email: user.email,
                    totalReferrals: user.referral.totalReferrals,
                    totalRewards: user.referral.totalRewards,
                    referralTier: user.referral.referralTier
                })),
                recentConversions
            }
        };
    } catch (error) {
        console.error('Error getting referral statistics:', error);
        return { success: false, message: 'Error getting referral statistics', error: error.message };
    }
};

// Track social sharing for referral link
export const trackSocialShare = async (userId, platform) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Update social sharing counts
        switch (platform) {
            case 'facebook':
                user.referral.socialSharing.facebookShares += 1;
                break;
            case 'twitter':
                user.referral.socialSharing.twitterShares += 1;
                break;
            case 'whatsapp':
                user.referral.socialSharing.whatsappShares += 1;
                break;
            case 'email':
                user.referral.socialSharing.emailShares += 1;
                break;
            default:
                throw new Error('Invalid platform');
        }

        // Update total clicks
        user.referral.referralStats.totalClicks += 1;

        // Update last activity date
        user.referral.referralStats.lastActivityDate = new Date();

        await user.save();

        return {
            success: true,
            message: `Social share tracked for ${platform}`,
            data: user.referral.socialSharing
        };
    } catch (error) {
        console.error('Error tracking social share:', error);
        return { success: false, message: 'Error tracking social share', error: error.message };
    }
};

// Get detailed referral analytics for a user
export const getUserReferralAnalytics = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate('referral.referredUsers.user', 'name email createdAt')
            .select('referral');

        if (!user) {
            throw new Error('User not found');
        }

        // Calculate additional analytics
        const totalClicks = user.referral.referralStats.totalClicks;
        const totalSignups = user.referral.referredUsers.length;
        const totalConversions = user.referral.referredUsers.filter(
            ref => ref.conversionStatus === 'converted'
        ).length;

        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const avgRewardPerConversion = totalConversions > 0 ?
            user.referral.totalRewards / totalConversions : 0;

        return {
            success: true,
            data: {
                ...user.referral,
                analytics: {
                    totalClicks,
                    totalSignups,
                    totalConversions,
                    conversionRate: conversionRate.toFixed(2),
                    avgRewardPerConversion: avgRewardPerConversion.toFixed(2),
                    socialShares: user.referral.socialSharing
                }
            }
        };
    } catch (error) {
        console.error('Error getting user referral analytics:', error);
        return { success: false, message: 'Error getting user referral analytics', error: error.message };
    }
};

// Generate custom referral URL for a user
export const generateCustomReferralUrl = async (userId, customUrl) => {
    try {
        // Validate custom URL format
        if (!customUrl || customUrl.length < 3 || customUrl.length > 50) {
            throw new Error('Custom URL must be between 3 and 50 characters');
        }

        // Check if custom URL is already taken
        const existingUser = await User.findOne({
            'referral.customReferralUrl': customUrl,
            _id: { $ne: userId }
        });

        if (existingUser) {
            throw new Error('Custom referral URL is already taken');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Update custom referral URL
        user.referral.customReferralUrl = customUrl;
        await user.save();

        // Generate the full custom URL
        const fullCustomUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${customUrl}`;

        return {
            success: true,
            message: 'Custom referral URL generated successfully',
            data: {
                customReferralUrl: customUrl,
                fullCustomUrl
            }
        };
    } catch (error) {
        console.error('Error generating custom referral URL:', error);
        return { success: false, message: 'Error generating custom referral URL', error: error.message };
    }
};

// Get referral leaderboard with additional metrics
export const getReferralLeaderboard = async (limit = 10) => {
    try {
        const leaderboard = await User.find({
            'referral.totalReferrals': { $gt: 0 }
        })
            .select('name referral.totalReferrals referral.totalRewards referral.referralTier avatar')
            .sort({ 'referral.totalReferrals': -1 })
            .limit(limit);

        // Enrich leaderboard data with additional metrics
        const enrichedLeaderboard = leaderboard.map(user => ({
            rank: 0, // Will be set below
            name: user.name,
            avatar: user.avatar?.url || null,
            totalReferrals: user.referral.totalReferrals,
            totalRewards: user.referral.totalRewards,
            referralTier: user.referral.referralTier,
            // Calculate efficiency metric (rewards per referral)
            efficiency: user.referral.totalReferrals > 0 ?
                (user.referral.totalRewards / user.referral.totalReferrals).toFixed(2) : '0.00'
        }));

        // Set ranks
        enrichedLeaderboard.forEach((user, index) => {
            user.rank = index + 1;
        });

        return {
            success: true,
            data: enrichedLeaderboard
        };
    } catch (error) {
        console.error('Error getting referral leaderboard:', error);
        return { success: false, message: 'Error getting referral leaderboard', error: error.message };
    }
};