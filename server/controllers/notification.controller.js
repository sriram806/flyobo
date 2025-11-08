import Notification from "../models/notification.model.js";
import cron from 'node-cron';
import { 
    getUnreadNotificationsCount, 
    markAllNotificationsAsRead,
    getNotificationsWithPagination
} from "../services/notification.services.js";

// Get Notifications
export const getNotification = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const result = await getNotificationsWithPagination(req.user._id, parseInt(page), parseInt(limit));
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            ...result.data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Notifications
export const UpdateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { $set: { status: 'read' } },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        const result = await getNotificationsWithPagination(req.user._id, 1, 10);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json({
            success: true,
            ...result.data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
    try {
        const result = await getUnreadNotificationsCount(req.user._id);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            ...result.data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const result = await markAllNotificationsAsRead(req.user._id);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        // Get updated notifications
        const notificationsResult = await getNotificationsWithPagination(req.user._id, 1, 10);
        
        if (!notificationsResult.success) {
            return res.status(400).json(notificationsResult);
        }

        res.json({
            success: true,
            message: result.message,
            ...notificationsResult.data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Notifications
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await Notification.deleteMany({ status: "read", createdAt: { $lt: thirtyDayAgo } });
    console.log('Delete Read Notifications');
});