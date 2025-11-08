import User from "../models/user.model.js";
import { sendBirthdayNotification, sendAnniversaryNotification } from "./notification.services.js";
import cron from 'node-cron';

// Send birthday notifications
export const sendBirthdayNotifications = async () => {
    try {
        // Get users whose birthday is today
        const today = new Date();
        const month = today.getMonth() + 1; // getMonth() is zero-indexed
        const day = today.getDate();
        
        // Find users with matching birth dates
        const users = await User.find({
            'profile.birthDate': {
                $exists: true,
                $ne: null
            }
        });
        
        console.log(`Found ${users.length} users with birth dates`);
        
        // Send notifications to each user whose birthday is today
        let birthdayCount = 0;
        for (const user of users) {
            try {
                const birthDate = new Date(user.profile.birthDate);
                if (birthDate.getMonth() + 1 === month && birthDate.getDate() === day) {
                    await sendBirthdayNotification(user._id);
                    console.log(`Birthday notification sent to ${user.email}`);
                    birthdayCount++;
                }
            } catch (error) {
                console.error(`Failed to send birthday notification to ${user.email}:`, error);
            }
        }
        
        console.log(`Sent ${birthdayCount} birthday notifications today`);
    } catch (error) {
        console.error('Error sending birthday notifications:', error);
    }
};

// Send anniversary notifications
export const sendAnniversaryNotifications = async () => {
    try {
        // Get users whose account anniversary is today
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        // Find all users
        const users = await User.find({
            createdAt: {
                $exists: true
            }
        });
        
        console.log(`Found ${users.length} users for anniversary check`);
        
        // Send notifications to each user whose account anniversary is today
        let anniversaryCount = 0;
        for (const user of users) {
            try {
                // Check if today is their account anniversary
                const createdDate = new Date(user.createdAt);
                if (createdDate.getMonth() + 1 === month && createdDate.getDate() === day) {
                    await sendAnniversaryNotification(user._id);
                    console.log(`Anniversary notification sent to ${user.email}`);
                    anniversaryCount++;
                }
            } catch (error) {
                console.error(`Failed to send anniversary notification to ${user.email}:`, error);
            }
        }
        
        console.log(`Sent ${anniversaryCount} anniversary notifications today`);
    } catch (error) {
        console.error('Error sending anniversary notifications:', error);
    }
};

// Schedule birthday notifications to run daily at 9 AM
cron.schedule('0 9 * * *', async () => {
    console.log('Running daily birthday notifications job');
    await sendBirthdayNotifications();
});

// Schedule anniversary notifications to run daily at 10 AM
cron.schedule('0 10 * * *', async () => {
    console.log('Running daily anniversary notifications job');
    await sendAnniversaryNotifications();
});

export default {
    sendBirthdayNotifications,
    sendAnniversaryNotifications
};