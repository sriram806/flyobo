# Authentication Issues - Troubleshooting Guide

## Problem: Token Missing During Login on Live Server

This document provides solutions for authentication token issues when deploying to production.

## Common Causes & Solutions

### 1. Environment Configuration Issues

**Problem**: Development URLs used in production
**Solution**: Update environment variables

#### Client (.env)
```bash
# Development
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000/api/v1"

# Production (update with your actual URLs)
NEXT_PUBLIC_BACKEND_URL="https://your-api-domain.com/api/v1"
```

#### Server (.env)
```bash
# Development
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
ORIGIN="http://localhost:3000"

# Production
NODE_ENV="production"
FRONTEND_URL="https://your-frontend-domain.com"
ORIGIN="https://your-frontend-domain.com"
```

### 2. CORS Configuration Issues

**Problem**: Cross-origin requests blocked
**Solution**: Update CORS settings in `server/app.js`

Add your production domains to allowed origins:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://your-frontend-domain.com',  // Add your domain
  'https://your-api-domain.com'        // Add your API domain
];
```

### 3. Cookie Security Issues

**Problem**: Cookies not being set/sent in production
**Solution**: Check cookie configuration

The server automatically sets secure cookie options:
- `secure: true` in production (requires HTTPS)
- `sameSite: "none"` for cross-origin requests
- `httpOnly: true` for security

**Ensure**:
- Your frontend and backend are served over HTTPS
- Both domains are properly configured in CORS
- Cookies are enabled in your browser

### 4. Token Storage Issues

**Problem**: Token not persisting between requests
**Solution**: We use dual storage method:

1. **Primary**: HTTP-only cookies (more secure)
2. **Fallback**: localStorage (for compatibility)

Both methods are automatically handled by the authentication utilities.

## Debug Steps

### 1. Check Environment Configuration
```bash
# In your live server environment
echo $NEXT_PUBLIC_BACKEND_URL
echo $NODE_ENV
echo $FRONTEND_URL
```

### 2. Use Debug Utilities
Open browser console on your frontend and run:
```javascript
debugAuth()    // Check authentication state
testAuth()     // Test authentication endpoint
checkCORS()    // Check CORS configuration
```

### 3. Check Network Tab
1. Open browser DevTools → Network tab
2. Try to login
3. Check the login request:
   - Status should be 200
   - Response should contain `token` and `user`
   - `Set-Cookie` header should be present

### 4. Check Cookies
1. Open DevTools → Application → Cookies
2. Look for `token` cookie from your API domain
3. Verify cookie attributes (secure, sameSite, etc.)

## Production Deployment Checklist

### Frontend (Next.js)
- [ ] Update `NEXT_PUBLIC_BACKEND_URL` to production API URL
- [ ] Build with `npm run build`
- [ ] Deploy to HTTPS-enabled hosting
- [ ] Test authentication flow

### Backend (Node.js)
- [ ] Set `NODE_ENV="production"`
- [ ] Update `FRONTEND_URL` and `ORIGIN` to production frontend URL
- [ ] Update CORS allowed origins
- [ ] Use strong JWT secrets (change from defaults)
- [ ] Deploy to HTTPS-enabled hosting
- [ ] Test API endpoints

### General
- [ ] Both frontend and backend must use HTTPS in production
- [ ] Domains must be properly configured in DNS
- [ ] Test cross-origin requests
- [ ] Verify cookies are being set and sent

## Common Error Messages & Solutions

### "Token missing. Please login."
- Check if cookies are enabled
- Verify CORS configuration
- Ensure HTTPS is used in production

### "Invalid token. Please login again."
- Token may be expired or corrupted
- Check JWT_SECRET consistency between deployments
- Clear browser storage and try again

### "Not allowed by CORS"
- Add your domains to allowed origins
- Check credentials: true in CORS config
- Verify preflight requests are handled

### Network request failed
- Check if API server is running
- Verify API URL is correct
- Check if domains are accessible

## Testing Authentication

Use these steps to test authentication:

1. **Clear browser storage**: DevTools → Application → Storage → Clear storage
2. **Test registration**: Create new account
3. **Test login**: Login with credentials
4. **Check token**: Use `debugAuth()` in console
5. **Test protected routes**: Try accessing admin pages
6. **Test logout**: Verify tokens are cleared

## Advanced Troubleshooting

### Enable verbose logging
Add to your client code temporarily:
```javascript
// In Login.jsx
console.log('Login response:', data);
console.log('Token received:', data?.token);
console.log('Cookies after login:', document.cookie);
```

### Check server logs
Monitor your server logs for authentication errors:
```bash
# If using PM2
pm2 logs

# If using direct node
node app.js
```

### Network analysis
Use tools like:
- Browser DevTools Network tab
- Postman for API testing
- curl for command-line testing

## Need Help?

If authentication issues persist:

1. Use the debug utilities provided
2. Check all environment variables
3. Verify HTTPS configuration
4. Test with browser incognito mode
5. Check server logs for errors

Remember: Most authentication issues in production are due to environment configuration mismatches between development and production settings.