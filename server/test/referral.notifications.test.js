// Test file for referral and notification features
import { trackSocialShare, getUserReferralAnalytics, generateCustomReferralUrl } from "../services/referral.services.js";
import { sendBirthdayNotification, sendAnniversaryNotification, sendPromotionalNotification } from "../services/notification.services.js";

// Test social sharing tracking
export const testSocialShareTracking = async (userId) => {
    console.log("Testing social share tracking...");
    
    try {
        const platforms = ['facebook', 'twitter', 'whatsapp', 'email'];
        
        for (const platform of platforms) {
            const result = await trackSocialShare(userId, platform);
            console.log(`Share tracking for ${platform}:`, result);
        }
    } catch (error) {
        console.error("Error testing social share tracking:", error);
    }
};

// Test referral analytics
export const testReferralAnalytics = async (userId) => {
    console.log("Testing referral analytics...");
    
    try {
        const result = await getUserReferralAnalytics(userId);
        console.log("Referral analytics:", result);
    } catch (error) {
        console.error("Error testing referral analytics:", error);
    }
};

// Test custom referral URL generation
export const testCustomReferralUrl = async (userId) => {
    console.log("Testing custom referral URL generation...");
    
    try {
        const customUrl = `test-user-${Date.now()}`;
        const result = await generateCustomReferralUrl(userId, customUrl);
        console.log("Custom referral URL generation:", result);
    } catch (error) {
        console.error("Error testing custom referral URL generation:", error);
    }
};

// Test birthday notification
export const testBirthdayNotification = async (userId) => {
    console.log("Testing birthday notification...");
    
    try {
        const result = await sendBirthdayNotification(userId);
        console.log("Birthday notification:", result);
    } catch (error) {
        console.error("Error testing birthday notification:", error);
    }
};

// Test anniversary notification
export const testAnniversaryNotification = async (userId) => {
    console.log("Testing anniversary notification...");
    
    try {
        const result = await sendAnniversaryNotification(userId);
        console.log("Anniversary notification:", result);
    } catch (error) {
        console.error("Error testing anniversary notification:", error);
    }
};

// Test promotional notification
export const testPromotionalNotification = async (userId) => {
    console.log("Testing promotional notification...");
    
    try {
        const result = await sendPromotionalNotification(
            userId, 
            "Summer Sale", 
            "SUMMER2023", 
            20
        );
        console.log("Promotional notification:", result);
    } catch (error) {
        console.error("Error testing promotional notification:", error);
    }
};

// Run all tests
export const runAllTests = async (userId) => {
    console.log("Running all referral and notification tests...");
    
    await testSocialShareTracking(userId);
    await testReferralAnalytics(userId);
    await testCustomReferralUrl(userId);
    await testBirthdayNotification(userId);
    await testAnniversaryNotification(userId);
    await testPromotionalNotification(userId);
    
    console.log("All tests completed!");
};

// Export individual test functions for manual testing
export default {
    testSocialShareTracking,
    testReferralAnalytics,
    testCustomReferralUrl,
    testBirthdayNotification,
    testAnniversaryNotification,
    testPromotionalNotification,
    runAllTests
};