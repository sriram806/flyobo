import User from "../models/user.model.js";
import Booking from "../models/bookings.model.js";

// Get all pending referral rewards
export const getPendingReferralRewards = async (req, res) => {
    try {
        // Find all users with pending referral rewards
        const users = await User.find({
            'referral.rewardHistory.status': 'pending'
        }).select('name email referral.rewardHistory bankDetails');

        const pendingRewards = [];
        users.forEach(user => {
            user.referral.rewardHistory.forEach(reward => {
                if (reward.status === 'pending') {
                    pendingRewards.push({
                        userId: user._id,
                        userName: user.name,
                        userEmail: user.email,
                        rewardId: reward._id,
                        rewardType: reward.type,
                        amount: reward.amount,
                        description: reward.description,
                        createdAt: reward.createdAt,
                        userBankDetails: user.bankDetails // Include bank details
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: pendingRewards
        });
    } catch (error) {
        console.error('Get pending referral rewards error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending referral rewards',
            error: error.message
        });
    }
};

// Approve referral reward
export const approveReferralReward = async (req, res) => {
    try {
        const { userId, rewardId } = req.body;
        
        if (!userId || !rewardId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Reward ID are required'
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Find the reward in user's reward history
        const rewardIndex = user.referral.rewardHistory.findIndex(
            reward => reward._id.toString() === rewardId
        );
        
        if (rewardIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Reward not found'
            });
        }
        
        // Update reward status to approved
        user.referral.rewardHistory[rewardIndex].status = 'credited';
        user.referral.rewardHistory[rewardIndex].approvedAt = new Date();
        
        // Add to available rewards if it's a positive amount
        if (user.referral.rewardHistory[rewardIndex].amount > 0) {
            user.referral.availableRewards += user.referral.rewardHistory[rewardIndex].amount;
        }
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Referral reward approved successfully',
            data: user.referral.rewardHistory[rewardIndex]
        });
    } catch (error) {
        console.error('Approve referral reward error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve referral reward',
            error: error.message
        });
    }
};

// Mark referral reward as paid
export const markReferralRewardPaid = async (req, res) => {
    try {
        const { userId, rewardId } = req.body;
        
        if (!userId || !rewardId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Reward ID are required'
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Find the reward in user's reward history
        const rewardIndex = user.referral.rewardHistory.findIndex(
            reward => reward._id.toString() === rewardId
        );
        
        if (rewardIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Reward not found'
            });
        }
        
        // Update reward status to paid
        user.referral.rewardHistory[rewardIndex].status = 'used';
        user.referral.rewardHistory[rewardIndex].paidAt = new Date();
        
        // Deduct from available rewards
        if (user.referral.rewardHistory[rewardIndex].amount > 0) {
            user.referral.availableRewards -= user.referral.rewardHistory[rewardIndex].amount;
        }
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Referral reward marked as paid successfully',
            data: user.referral.rewardHistory[rewardIndex]
        });
    } catch (error) {
        console.error('Mark referral reward paid error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark referral reward as paid',
            error: error.message
        });
    }
};

// Get referral payout report
export const getReferralPayoutReport = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;
        
        // Build query based on filters
        let query = {};
        if (startDate && endDate) {
            query['referral.rewardHistory.createdAt'] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (status) {
            query['referral.rewardHistory.status'] = status;
        }
        
        // Find users with referral rewards
        const users = await User.find(query).select('name email referral.rewardHistory');
        
        const reportData = [];
        users.forEach(user => {
            user.referral.rewardHistory.forEach(reward => {
                // Apply status filter if provided
                if (status && reward.status !== status) return;
                
                // Apply date filter if provided
                if (startDate && endDate) {
                    if (reward.createdAt < new Date(startDate) || reward.createdAt > new Date(endDate)) {
                        return;
                    }
                }
                
                reportData.push({
                    userId: user._id,
                    userName: user.name,
                    userEmail: user.email,
                    rewardType: reward.type,
                    amount: reward.amount,
                    description: reward.description,
                    status: reward.status,
                    createdAt: reward.createdAt,
                    approvedAt: reward.approvedAt,
                    paidAt: reward.paidAt
                });
            });
        });
        
        // Sort by creation date
        reportData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Calculate summary
        const totalAmount = reportData.reduce((sum, item) => sum + item.amount, 0);
        const summary = {
            totalRecords: reportData.length,
            totalAmount,
            pending: reportData.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0),
            approved: reportData.filter(item => item.status === 'credited').reduce((sum, item) => sum + item.amount, 0),
            paid: reportData.filter(item => item.status === 'used').reduce((sum, item) => sum + item.amount, 0)
        };
        
        res.status(200).json({
            success: true,
            data: reportData,
            summary
        });
    } catch (error) {
        console.error('Get referral payout report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate referral payout report',
            error: error.message
        });
    }
};

// Export referral data
export const exportReferralData = async (req, res) => {
    try {
        const users = await User.find({
            'referral.totalReferrals': { $gt: 0 }
        }).select('name email referral');
        
        // Format data for export
        const exportData = users.map(user => ({
            name: user.name,
            email: user.email,
            referralCode: user.referral.referralCode,
            totalReferrals: user.referral.totalReferrals,
            totalRewards: user.referral.totalRewards,
            availableRewards: user.referral.availableRewards,
            referralTier: user.referral.referralTier,
            conversionRate: user.referral.referralStats?.conversionRate || 0,
            revenueGenerated: user.referral.referralStats?.revenueGenerated || 0
        }));
        
        res.status(200).json({
            success: true,
            data: exportData
        });
    } catch (error) {
        console.error('Export referral data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export referral data',
            error: error.message
        });
    }
};

// Enhanced stats endpoint to include pending and paid rewards
export const getEnhancedReferralStats = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        
        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        const users = await User.find({
            createdAt: { $gte: startDate }
        });

        const totalReferrals = users.reduce((sum, user) => sum + user.referral.totalReferrals, 0);
        const activeReferrers = users.filter(user => user.referral.totalReferrals > 0).length;
        const totalRewards = users.reduce((sum, user) => sum + user.referral.totalRewards, 0);
        const totalUsers = users.length;
        const conversionRate = totalUsers > 0 ? ((totalReferrals / totalUsers) * 100).toFixed(2) : 0;
        
        // Get pending and paid rewards counts
        const allUsers = await User.find({});
        let pendingRewards = 0;
        let paidRewards = 0;
        
        allUsers.forEach(user => {
            user.referral.rewardHistory.forEach(reward => {
                if (reward.status === 'pending') {
                    pendingRewards++;
                } else if (reward.status === 'used') {
                    paidRewards++;
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                totalReferrals,
                activeReferrers,
                totalRewards,
                conversionRate: parseFloat(conversionRate),
                totalUsers,
                pendingRewards,
                paidRewards
            }
        });
    } catch (error) {
        console.error('Get admin referral stats error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get top referrals leaderboard
export const getTopReferrals = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Find top referrers by total referrals
        const topReferrers = await User.find({
            'referral.totalReferrals': { $gt: 0 }
        })
        .select('name email referral bankDetails')
        .sort({ 'referral.totalReferrals': -1 })
        .limit(parseInt(limit));

        // Format the data for the leaderboard
        const leaderboard = topReferrers.map((user, index) => ({
            rank: index + 1,
            userId: user._id,
            name: user.name,
            email: user.email,
            referralCode: user.referral.referralCode,
            totalReferrals: user.referral.totalReferrals,
            totalRewards: user.referral.totalRewards,
            availableRewards: user.referral.availableRewards,
            referralTier: user.referral.referralTier,
            bankDetails: user.bankDetails // Include bank details
        }));

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Get top referrals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top referrals',
            error: error.message
        });
    }
};

// Deposit referral reward manually
export const depositReferralReward = async (req, res) => {
    try {
        const { userId, amount, description } = req.body;
        
        // Validate input
        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'User ID and valid amount are required'
            });
        }
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Add reward to user's referral system
        user.referral.totalRewards += amount;
        user.referral.availableRewards += amount;
        
        // Add to reward history
        user.referral.rewardHistory.push({
            type: 'manual_deposit',
            amount: amount,
            description: description || 'Manual reward deposit by admin',
            status: 'credited',
            createdAt: new Date()
        });
        
        // Save user
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Referral reward deposited successfully',
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                newTotalRewards: user.referral.totalRewards,
                newAvailableRewards: user.referral.availableRewards
            }
        });
    } catch (error) {
        console.error('Deposit referral reward error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deposit referral reward',
            error: error.message
        });
    }
};

// Get referral reward history for a specific user
export const getUserReferralHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        const user = await User.findById(userId)
            .select('name email referral.rewardHistory')
            .populate('referral.rewardHistory.user', 'name email');
            
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                rewardHistory: user.referral.rewardHistory
            }
        });
    } catch (error) {
        console.error('Get user referral history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user referral history',
            error: error.message
        });
    }
};
