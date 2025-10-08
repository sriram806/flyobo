import Notification from "../models/notification.model.js";
import cron from 'node-cron';

// Get Notifications
export const getNotification = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

// Update Notifications
export const UpdateNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(500).json({
                success: false,
                message: error
            })
        } else {
            notification.status ? notification.status = 'read' : notification.status;
        }

        await notification.save();

        const notifications = await Notification.find().sort({ createdAt: -1 });

        res.status(201).json({
            success: true,
            notifications,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

// Delete Notifications
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await Notification.deleteMany({ status: "read", createdAt: { sit: thirtyDayAgo } })
    console.log('Delete Read Notifications');
})