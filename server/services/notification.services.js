import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import sendMail from "../config/nodemailer.js";

// Send referral notification to referrer
export const sendReferralNotification = async (referrerId, referredUserName, rewardAmount, bookingAmount, actor = null) => {
    try {
        const referrer = await User.findById(referrerId);
        if (!referrer) {
            throw new Error('Referrer not found');
        }

        await Notification.create({
            user: referrerId,
            actor: actor || undefined,
            title: "Referral Reward Earned!",
            message: `Great news! ${referredUserName} has completed their first booking. You've earned ₹${rewardAmount} as a referral reward.`
        });

        try {
            await sendMail({
                email: referrer.email,
                subject: "Referral Reward Earned - Flyobo Travel",
                template: "referral-reward",
                data: {
                    name: referrer.name,
                    referredUserName,
                    rewardAmount,
                    bookingAmount,
                    referralCode: referrer.referral.referralCode,
                    availableRewards: referrer.referral.availableRewards + rewardAmount
                }
            });
        } catch (mailError) {
            console.error('Failed to send referral email notification:', mailError);
        }

        return { success: true, message: 'Referral notification sent successfully' };
    } catch (error) {
        console.error('Error sending referral notification:', error);
        return { success: false, message: 'Error sending referral notification', error: error.message };
    }
};

// Send milestone achievement notification
export const sendMilestoneNotification = async (userId, milestoneName, rewardAmount, actor = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create in-app notification
        await Notification.create({
            user: userId,
            actor: actor || undefined,
            title: "Milestone Achieved!",
            message: `Congratulations! You've achieved the ${milestoneName} milestone and earned ₹${rewardAmount} as a reward.`
        });

        // Send email notification
        try {
            await sendMail({
                email: user.email,
                subject: "Milestone Achieved - Flyobo Travel",
                template: "milestone-achievement",
                data: {
                    name: user.name,
                    milestoneName,
                    rewardAmount,
                    referralCode: user.referral.referralCode,
                    availableRewards: user.referral.availableRewards
                }
            });
        } catch (mailError) {
            console.error('Failed to send milestone email notification:', mailError);
        }

        return { success: true, message: 'Milestone notification sent successfully' };
    } catch (error) {
        console.error('Error sending milestone notification:', error);
        return { success: false, message: 'Error sending milestone notification', error: error.message };
    }
};

// Send reward redemption notification
export const sendRewardRedemptionNotification = async (userId, amount, actor = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create in-app notification
        await Notification.create({
            user: userId,
            actor: actor || undefined,
            title: "Reward Redeemed",
            message: `You've successfully redeemed ₹${amount} from your referral rewards.`
        });

        // Send email notification
        try {
            await sendMail({
                email: user.email,
                subject: "Reward Redeemed - Flyobo Travel",
                template: "reward-redemption",
                data: {
                    name: user.name,
                    amount,
                    availableRewards: user.referral.availableRewards,
                    referralCode: user.referral.referralCode
                }
            });
        } catch (mailError) {
            console.error('Failed to send reward redemption email notification:', mailError);
        }

        return { success: true, message: 'Reward redemption notification sent successfully' };
    } catch (error) {
        console.error('Error sending reward redemption notification:', error);
        return { success: false, message: 'Error sending reward redemption notification', error: error.message };
    }
};

// Send tier upgrade notification
export const sendTierUpgradeNotification = async (userId, newTier, actor = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create in-app notification
        await Notification.create({
            user: userId,
            actor: actor || undefined,
            title: "Referral Tier Upgraded!",
            message: `Congratulations! You've been upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} tier.`
        });

        // Send email notification
        try {
            await sendMail({
                email: user.email,
                subject: "Referral Tier Upgraded - Flyobo Travel",
                template: "tier-upgrade",
                data: {
                    name: user.name,
                    newTier: newTier.charAt(0).toUpperCase() + newTier.slice(1),
                    referralCode: user.referral.referralCode,
                    availableRewards: user.referral.availableRewards
                }
            });
        } catch (mailError) {
            console.error('Failed to send tier upgrade email notification:', mailError);
        }

        return { success: true, message: 'Tier upgrade notification sent successfully' };
    } catch (error) {
        console.error('Error sending tier upgrade notification:', error);
        return { success: false, message: 'Error sending tier upgrade notification', error: error.message };
    }
};

// Send birthday notification
export const sendBirthdayNotification = async (userId, actor = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create in-app notification
        await Notification.create({
            user: userId,
            actor: actor || undefined,
            title: "Happy Birthday!",
            message: `Happy Birthday ${user.name}! Enjoy a special 10% discount on your next booking.`
        });

        // Send email notification
        try {
            await sendMail({
                email: user.email,
                subject: "Happy Birthday - Flyobo Travel",
                template: "birthday",
                data: {
                    name: user.name
                }
            });
        } catch (mailError) {
            console.error('Failed to send birthday email notification:', mailError);
        }

        return { success: true, message: 'Birthday notification sent successfully' };
    } catch (error) {
        console.error('Error sending birthday notification:', error);
        return { success: false, message: 'Error sending birthday notification', error: error.message };
    }
};

// Send anniversary notification
export const sendAnniversaryNotification = async (userId, actor = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create in-app notification
        await Notification.create({
            user: userId,
            actor: actor || undefined,
            title: "Happy Anniversary!",
            message: `Happy Anniversary ${user.name}! Celebrate with a special 15% discount on your next booking.`
        });

        // Send email notification
        try {
            await sendMail({
                email: user.email,
                subject: "Happy Anniversary - Flyobo Travel",
                template: "anniversary",
                data: {
                    name: user.name
                }
            });
        } catch (mailError) {
            console.error('Failed to send anniversary email notification:', mailError);
        }

        return { success: true, message: 'Anniversary notification sent successfully' };
    } catch (error) {
        console.error('Error sending anniversary notification:', error);
        return { success: false, message: 'Error sending anniversary notification', error: error.message };
    }
};

// Send promotional notification
export const sendPromotionalNotification = async (userId, promotionTitle, promotionCode, discountPercentage, actor = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create in-app notification
        await Notification.create({
            user: userId,
            actor: actor || undefined,
            title: promotionTitle,
            message: `Exclusive offer for you! Use code ${promotionCode} for ${discountPercentage}% off your next booking.`
        });

        // Send email notification
        try {
            await sendMail({
                email: user.email,
                subject: `${promotionTitle} - Flyobo Travel`,
                template: "promotion",
                data: {
                    name: user.name,
                    promotionTitle,
                    promotionCode,
                    discountPercentage
                }
            });
        } catch (mailError) {
            console.error('Failed to send promotional email notification:', mailError);
        }

        return { success: true, message: 'Promotional notification sent successfully' };
    } catch (error) {
        console.error('Error sending promotional notification:', error);
        return { success: false, message: 'Error sending promotional notification', error: error.message };
    }
};

// Send reminder notification
export const sendReminderNotification = async (userId, reminderTitle, reminderMessage, reminderDate, actor = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create in-app notification
        await Notification.create({
            user: userId,
            actor: actor || undefined,
            title: reminderTitle,
            message: reminderMessage
        });

        // Send email notification
        try {
            await sendMail({
                email: user.email,
                subject: `${reminderTitle} - Flyobo Travel`,
                template: "reminder",
                data: {
                    name: user.name,
                    reminderTitle,
                    reminderMessage,
                    reminderDate
                }
            });
        } catch (mailError) {
            console.error('Failed to send reminder email notification:', mailError);
        }

        return { success: true, message: 'Reminder notification sent successfully' };
    } catch (error) {
        console.error('Error sending reminder notification:', error);
        return { success: false, message: 'Error sending reminder notification', error: error.message };
    }
};

// Get unread notifications count for a user
export const getUnreadNotificationsCount = async (userId) => {
    try {
        const count = await Notification.countDocuments({
            user: userId,
            status: 'unread'
        });

        return { success: true, data: { count } };
    } catch (error) {
        console.error('Error getting unread notifications count:', error);
        return { success: false, message: 'Error getting unread notifications count', error: error.message };
    }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
    try {
        const result = await Notification.updateMany(
            { user: userId, status: 'unread' },
            { $set: { status: 'read' } }
        );

        return { 
            success: true, 
            message: `Marked ${result.modifiedCount} notifications as read`,
            data: { modifiedCount: result.modifiedCount }
        };
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return { success: false, message: 'Error marking notifications as read', error: error.message };
    }
};

// Get notifications with pagination
export const getNotificationsWithPagination = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('actor', 'name email');

        const total = await Notification.countDocuments({ user: userId });

        return {
            success: true,
            data: {
                notifications,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalNotifications: total,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            }
        };
    } catch (error) {
        console.error('Error getting notifications with pagination:', error);
        return { success: false, message: 'Error getting notifications with pagination', error: error.message };
    }
};