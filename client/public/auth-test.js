/**
 * Authentication Test Script
 * Run this in your browser console to test authentication
 */

async function testAuthentication() {
  console.log('🧪 Starting Authentication Test...');
  console.log('=====================================');
  
  // Get current environment info
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';
  const currentDomain = window.location.hostname;
  const isHTTPS = window.location.protocol === 'https:';
  
  console.log('🌐 Environment Info:');
  console.log('  API URL:', apiUrl);
  console.log('  Current Domain:', currentDomain);
  console.log('  Using HTTPS:', isHTTPS);
  console.log('  User Agent:', navigator.userAgent);
  
  // Test 1: Check CORS preflight
  console.log('\n🔄 Test 1: CORS Preflight Check...');
  try {
    const corsResponse = await fetch(apiUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    console.log('✅ CORS preflight passed:', corsResponse.status);
  } catch (error) {
    console.error('❌ CORS preflight failed:', error.message);
  }
  
  // Test 2: Check if we have existing authentication
  console.log('\n🔍 Test 2: Current Auth State...');
  const existingToken = localStorage.getItem('auth_token');
  const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='));
  
  console.log('  LocalStorage Token:', existingToken ? 'PRESENT' : 'NONE');
  console.log('  Cookie Token:', cookieToken ? 'PRESENT' : 'NONE');
  
  // Test 3: Test login endpoint availability
  console.log('\n🔗 Test 3: Login Endpoint Test...');
  try {
    const loginTestResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com', // This will fail but test endpoint
        password: 'testpassword'
      })
    });
    
    const result = await loginTestResponse.json();
    console.log('✅ Login endpoint reachable:', {
      status: loginTestResponse.status,
      message: result.message
    });
  } catch (error) {
    console.error('❌ Login endpoint unreachable:', error.message);
  }
  
  // Test 4: Check protected endpoint
  if (existingToken || cookieToken) {
    console.log('\n🛡️ Test 4: Protected Endpoint Test...');
    try {
      const protectedResponse = await fetch(`${apiUrl}/user/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(existingToken && { 'Authorization': `Bearer ${existingToken}` })
        },
        credentials: 'include'
      });
      
      if (protectedResponse.ok) {
        const userData = await protectedResponse.json();
        console.log('✅ Protected endpoint accessible:', userData.data?.user?.email || 'User data retrieved');
      } else {
        const errorData = await protectedResponse.json();
        console.log('⚠️ Protected endpoint returned:', {
          status: protectedResponse.status,
          message: errorData.message
        });
      }
    } catch (error) {
      console.error('❌ Protected endpoint test failed:', error.message);
    }
  } else {
    console.log('\n⚠️ Test 4: Skipped (no auth tokens found)');
  }
  
  // Test 5: Network connectivity
  console.log('\n🌐 Test 5: Network Connectivity...');
  try {
    const healthCheck = await fetch(`${apiUrl.replace('/api/v1', '')}/`, {
      method: 'GET',
      credentials: 'include'
    });
    console.log('✅ Server connectivity:', healthCheck.status);
  } catch (error) {
    console.error('❌ Server connectivity failed:', error.message);
  }
  
  console.log('\n=====================================');
  console.log('🏁 Authentication Test Complete');
  console.log('If you see errors above, check the Production Setup Guide');
}

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
  window.testAuthentication = testAuthentication;
  console.log('🔧 Authentication test loaded. Run testAuthentication() to begin.');
  
  // Auto-run after a short delay
  setTimeout(() => {
    console.log('🚀 Auto-running authentication test...');
    testAuthentication();
  }, 1000);
}