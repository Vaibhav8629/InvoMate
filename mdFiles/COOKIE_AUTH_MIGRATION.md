# Cookie-Based Authentication Migration Guide

## Overview
The authentication system has been migrated from localStorage-based JWT storage to secure HTTP-only cookie-based authentication. This improves security by preventing XSS attacks from accessing authentication tokens.

## Changes Made

### Backend Changes

#### 1. **Installed cookie-parser**
```bash
npm install cookie-parser
```

#### 2. **Updated server.js**
- Added `cookie-parser` middleware
- CORS configuration already had `credentials: true` enabled

```javascript
const cookieParser = require("cookie-parser");
app.use(cookieParser());
```

#### 3. **Updated auth-controller.js**
- **Register endpoint**: Now sets JWT as httpOnly cookie instead of returning it in response
- **Login endpoint**: Now sets JWT as httpOnly cookie instead of returning it in response
- **New logout endpoint**: Clears the authentication cookie

Cookie configuration:
```javascript
res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});
```

#### 4. **Updated auth-middleware.js**
- Changed from reading `Authorization` header to reading from cookies
- JWT verification logic remains unchanged

```javascript
const token = req.cookies.token;
```

#### 5. **Added logout route**
- New POST `/api/auth/logout` endpoint to clear authentication cookie

### Frontend Changes

#### 1. **Updated auth.jsx (Context)**
- Removed all `localStorage` usage
- Removed `token` state variable
- Changed `storeTokenInLS` to `loginUser` function
- Updated `logoutUser` to call backend logout endpoint
- Added `loading` state for initial authentication check
- All API calls now use `credentials: 'include'` to send cookies

#### 2. **Updated Login.jsx**
- Removed `storeTokenInLS` usage
- Now calls `loginUser()` after successful login
- Added `credentials: 'include'` to fetch request

#### 3. **Updated Register.jsx**
- Removed `storeTokenInLS` usage
- Added `credentials: 'include'` to fetch request

#### 4. **Updated ProtectedRoute.jsx**
- Now uses `isLogged` and `loading` from auth context
- Shows loading spinner while checking authentication
- No longer reads from localStorage

#### 5. **Updated All API Calls**
Files updated to use `credentials: 'include'` instead of `Authorization` header:
- `notificationApi.js`
- `SignatureUpload.jsx`
- `Profile.jsx`
- `DownloadReportButton.jsx`
- `ItemsCrud.jsx`
- `InvoiceView.jsx`
- `InvoicePage.jsx`
- `InvoiceList.jsx`
- `Home.jsx`
- `AIAnalyticsDashboard.jsx`

#### 6. **Created api.js utility**
- Helper functions for API calls with credentials enabled
- Located at `InvoMate/client/src/utils/api.js`

## Security Improvements

### Before (localStorage)
- ❌ Vulnerable to XSS attacks
- ❌ Token accessible via JavaScript
- ❌ Token sent manually in headers
- ❌ No automatic expiration handling

### After (HTTP-only Cookies)
- ✅ Protected from XSS attacks
- ✅ Token NOT accessible via JavaScript
- ✅ Automatically sent with requests
- ✅ Automatic expiration via maxAge
- ✅ CSRF protection via sameSite: "strict"

## Environment Configuration

### Development
Cookies work with `secure: false` (HTTP allowed)

### Production
**IMPORTANT**: Set `NODE_ENV=production` in your `.env` file to enable:
- `secure: true` (HTTPS required)
- Proper cookie security

Add to `.env`:
```
NODE_ENV=production
```

## Testing the Migration

### 1. Start the Backend
```bash
cd InvoMate/server
npm run dev
```

### 2. Start the Frontend
```bash
cd InvoMate/client
npm run dev
```

### 3. Test Authentication Flow
1. **Login**: Navigate to `/login` and sign in
   - Check browser DevTools → Application → Cookies
   - You should see a `token` cookie with `HttpOnly` flag
   
2. **Protected Routes**: Navigate to `/home`, `/profile`, etc.
   - Should work without any localStorage
   
3. **Logout**: Click logout button
   - Cookie should be cleared
   - Should redirect to login page

4. **API Calls**: Check Network tab
   - All requests should include `Cookie` header automatically
   - No `Authorization` header should be present

### 4. Verify Cookie Security
In browser DevTools → Application → Cookies, verify:
- ✅ `HttpOnly`: Yes
- ✅ `Secure`: Yes (in production)
- ✅ `SameSite`: Strict
- ✅ `Expires`: 30 days from now

## Backward Compatibility

⚠️ **Breaking Change**: This migration is NOT backward compatible with the old localStorage system.

All users will need to:
1. Log out (if currently logged in)
2. Log in again to receive the new cookie

## Troubleshooting

### Issue: "Unauthorized" errors after migration
**Solution**: Clear browser cookies and localStorage, then log in again

### Issue: Cookies not being set
**Solution**: 
- Check CORS configuration has `credentials: true`
- Verify frontend uses `credentials: 'include'` in fetch calls
- Ensure backend and frontend are on same domain or proper CORS setup

### Issue: Cookies not sent with requests
**Solution**:
- Verify `credentials: 'include'` is set in all fetch calls
- Check browser console for CORS errors
- Ensure cookie domain matches request domain

### Issue: "Secure" cookie not working in development
**Solution**: 
- Development uses `secure: false` automatically
- Only production requires HTTPS

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in environment variables
- [ ] Ensure application runs on HTTPS
- [ ] Verify CORS configuration allows your production domain
- [ ] Test login/logout flow in production
- [ ] Verify cookies are set with `Secure` flag
- [ ] Check cookie expiration is working correctly
- [ ] Test all protected routes
- [ ] Verify API calls include cookies automatically

## Rollback Plan

If you need to rollback to localStorage:
1. Restore previous versions of modified files from git
2. Run: `git checkout HEAD~1 -- <file-path>` for each modified file
3. Restart both frontend and backend servers

## Additional Notes

- JWT generation and verification logic remains **completely unchanged**
- Only the storage and transmission method changed
- Token expiry, secret, and structure are identical
- All existing JWT tokens are still valid (if you have the cookie)

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for authentication errors
3. Verify cookie is being set in browser DevTools
4. Ensure all fetch calls have `credentials: 'include'`
