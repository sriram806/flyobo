/**
 * Authentication Test Script
 * 
 * Run this to test the authentication flow from the browser console.
 * This will help identify where the authentication is failing.
 */

const testAuthentication = async () => {
  console.log("🔄 Starting authentication test...");
  
  const API_URL = "http://localhost:8000/api/v1";
  
  // Test 1: Check if we can reach the server
  try {
    console.log("\n📡 Test 1: Server connectivity");
    const pingResponse = await fetch(`${API_URL}/user/profile`, {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log("Status:", pingResponse.status);
    const pingData = await pingResponse.json();
    console.log("Response:", pingData);
    
    if (pingResponse.status === 401) {
      console.log("✅ Server is reachable but no authentication");
    } else if (pingResponse.status === 200) {
      console.log("✅ Already authenticated!");
      return pingData;
    }
  } catch (error) {
    console.error("❌ Server connectivity failed:", error);
    return;
  }
  
  // Test 2: Check cookies
  console.log("\n🍪 Test 2: Cookie inspection");
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  console.log("All cookies:", cookies);
  console.log("Token cookie:", cookies.token ? "PRESENT" : "NOT FOUND");
  
  // Test 3: Check localStorage
  console.log("\n💾 Test 3: LocalStorage inspection");
  const localStorageKeys = Object.keys(localStorage);
  console.log("LocalStorage keys:", localStorageKeys);
  
  // Test 4: Check Redux state
  console.log("\n🔄 Test 4: Redux state");
  try {
    const reduxState = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
      window.__REDUX_DEVTOOLS_EXTENSION__.getState() : null;
    
    if (reduxState && reduxState.auth) {
      console.log("Redux auth state:", reduxState.auth);
    } else {
      console.log("Redux state not accessible or no auth state");
    }
  } catch (error) {
    console.log("Redux inspection failed:", error.message);
  }
  
  console.log("\n🏁 Authentication test complete");
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log("Authentication Test Script Loaded");
  console.log("Run testAuthentication() to start the test");
  window.testAuthentication = testAuthentication;
}

export default testAuthentication;