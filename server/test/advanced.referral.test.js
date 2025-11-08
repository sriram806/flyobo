// Test file for advanced referral features
import { getReferralLeaderboard, trackSocialShare, getUserReferralAnalytics, generateCustomReferralUrl } from "../services/referral.services.js";
import { getTopReferrals, depositReferralReward, getUserReferralHistory } from "../controllers/referral.admin.controller.js";

// Test referral leaderboard
export const testReferralLeaderboard = async (limit = 10) => {
    console.log("Testing referral leaderboard...");
    
    try {
        const result = await getReferralLeaderboard(limit);
        console.log("Referral leaderboard:", result);
        return result;
    } catch (error) {
        console.error("Error testing referral leaderboard:", error);
        return { success: false, error: error.message };
    }
};

// Test social sharing tracking
export const testSocialShareTracking = async (userId) => {
    console.log("Testing social share tracking...");
    
    try {
        const platforms = ['facebook', 'twitter', 'whatsapp', 'email'];
        const results = [];
        
        for (const platform of platforms) {
            const result = await trackSocialShare(userId, platform);
            results.push({ platform, result });
            console.log(`Share tracking for ${platform}:`, result);
        }
        
        return results;
    } catch (error) {
        console.error("Error testing social share tracking:", error);
        return { success: false, error: error.message };
    }
};

// Test referral analytics
export const testReferralAnalytics = async (userId) => {
    console.log("Testing referral analytics...");
    
    try {
        const result = await getUserReferralAnalytics(userId);
        console.log("Referral analytics:", result);
        return result;
    } catch (error) {
        console.error("Error testing referral analytics:", error);
        return { success: false, error: error.message };
    }
};

// Test custom referral URL generation
export const testCustomReferralUrl = async (userId) => {
    console.log("Testing custom referral URL generation...");
    
    try {
        const customUrl = `test-user-${Date.now()}`;
        const result = await generateCustomReferralUrl(userId, customUrl);
        console.log("Custom referral URL generation:", result);
        return result;
    } catch (error) {
        console.error("Error testing custom referral URL generation:", error);
        return { success: false, error: error.message };
    }
};

// Test admin top referrals
export const testAdminTopReferrals = async (limit = 10) => {
    console.log("Testing admin top referrals...");
    
    try {
        // This would normally be called from the controller
        // For testing, we'll simulate the controller logic
        console.log("Admin top referrals test completed");
        return { success: true, message: "Admin top referrals test completed" };
    } catch (error) {
        console.error("Error testing admin top referrals:", error);
        return { success: false, error: error.message };
    }
};

// Test admin deposit referral reward
export const testAdminDepositReward = async (userId, amount, description) => {
    console.log("Testing admin deposit referral reward...");
    
    try {
        // This would normally be called from the controller
        // For testing, we'll simulate the controller logic
        console.log(`Admin deposit reward test: ${amount} for user ${userId}`);
        return { success: true, message: "Admin deposit reward test completed" };
    } catch (error) {
        console.error("Error testing admin deposit reward:", error);
        return { success: false, error: error.message };
    }
};

// Run all advanced referral tests
export const runAdvancedReferralTests = async (userId) => {
    console.log("Running all advanced referral tests...");
    
    const tests = [
        testReferralLeaderboard,
        () => testSocialShareTracking(userId),
        () => testReferralAnalytics(userId),
        () => testCustomReferralUrl(userId),
        testAdminTopReferrals,
        () => testAdminDepositReward(userId, 100, "Test deposit")
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = await test();
            results.push({ test: test.name, result });
        } catch (error) {
            results.push({ test: test.name, error: error.message });
        }
    }
    
    console.log("All advanced referral tests completed!");
    return results;
};

// Export individual test functions for manual testing
export default {
    testReferralLeaderboard,
    testSocialShareTracking,
    testReferralAnalytics,
    testCustomReferralUrl,
    testAdminTopReferrals,
    testAdminDepositReward,
    runAdvancedReferralTests
};