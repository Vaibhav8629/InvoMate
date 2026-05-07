# Cookie Authentication Troubleshooting Guide

## Issue: Cookies Not Appearing in Browser

### Step 1: Test Cookie Endpoint

First, let's verify the server can set cookies at all:

1. **Start the backend server**:
   ```bash
   cd InvoMate/server
   npm run dev
   ```

2. **Open your browser and go to**:
   ```
   http://localhost:5000/api/auth/test-cookie
   ```

3. **Check the response** - You should see:
   ```json
   {
     "msg": "Test cookie set",
     "cookiesReceived": {},
     "testCookieSet": true
   }
   ```

4. **Check DevTools → Application → Cookies → http://localhost:5000**
   - You should see a `testCookie` with value `testValue`
   - If you see this, the server CAN set cookies ✅

### Step 2: Check Server Console Logs

When you try to login, check the backend console for these logs:

```
🍪 Setting cookie with token: eyJhbGciOiJIUzI1NiIs...
✅ Cookie set successfully
```

If you see these logs, the cookie IS being set on the server side.

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Try to login
3. Find the `/api/auth/login` request
4. Click on it and check the **Response Headers**
5. Look for `Set-Cookie` header:
   ```
   Set-Cookie: token=eyJhbGc...; Path=/; HttpOnly; SameSite=Lax
   ```

If you see this header, the server IS sending the cookie.

### Step 4: Check Where to Look for Cookies

**IMPORTANT**: Cookies are set for the **backend domain**, not the frontend!

❌ **WRONG**: Looking at `http://localhost:5173` (frontend)
✅ **CORRECT**: Looking at `http://localhost:5000` (backend)

**How to check correctly**:
1. Open DevTools → Application → Cookies
2. Expand the Cookies section
3. Look for **`http://localhost:5000`** (not 5173!)
4. The `token` cookie should be there

### Step 5: Verify Frontend is Sending Credentials

Check that your login request includes `credentials: 'include'`:

```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    credentials: 'include', // ← This is CRITICAL
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
});
```

### Step 6: Check CORS Configuration

The backend CORS must allow credentials:

```javascript
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true, // ← This must be true
}
```

### Step 7: Common Issues and Solutions

#### Issue: Cookie appears in Network tab but not in Application tab
**Cause**: Looking at wrong domain
**Solution**: Check cookies under `http://localhost:5000`, not `http://localhost:5173`

#### Issue: No Set-Cookie header in response
**Cause**: Cookie not being set by server
**Solution**: 
- Check server console for error logs
- Verify cookie-parser is installed: `npm list cookie-parser`
- Restart the server

#### Issue: Cookie set but not sent with subsequent requests
**Cause**: Missing `credentials: 'include'` in fetch calls
**Solution**: Add `credentials: 'include'` to ALL fetch calls

#### Issue: CORS error
**Cause**: CORS not configured for credentials
**Solution**: Verify CORS has `credentials: true` and correct origin

### Step 8: Manual Cookie Test

You can manually test cookies using curl:

```bash
# Login and save cookies
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password"}'

# Check cookies file
cat cookies.txt

# Use cookies in next request
curl -b cookies.txt http://localhost:5000/api/auth/user
```

### Step 9: Browser-Specific Issues

#### Chrome/Edge
- Check if "Block third-party cookies" is enabled
- Go to Settings → Privacy → Cookies
- Make sure localhost is not blocked

#### Firefox
- Check Enhanced Tracking Protection
- Click shield icon in address bar
- Disable for localhost if needed

#### Safari
- Check "Prevent cross-site tracking"
- Safari → Preferences → Privacy
- Uncheck for development

### Step 10: Restart Everything

Sometimes a clean restart helps:

```bash
# Stop both servers (Ctrl+C)

# Clear browser cache and cookies
# DevTools → Application → Clear storage → Clear site data

# Restart backend
cd InvoMate/server
npm run dev

# Restart frontend (in new terminal)
cd InvoMate/client
npm run dev

# Try login again
```

## Debug Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173
- [ ] cookie-parser installed (`npm list cookie-parser`)
- [ ] CORS has `credentials: true`
- [ ] Login request has `credentials: 'include'`
- [ ] Checking cookies under `http://localhost:5000` (not 5173)
- [ ] `Set-Cookie` header appears in Network tab
- [ ] Server console shows "Cookie set successfully"
- [ ] No CORS errors in browser console
- [ ] Browser not blocking cookies

## Still Not Working?

If cookies still don't appear after all these steps:

1. **Check the exact error** in browser console
2. **Check server logs** for any errors
3. **Try the test endpoint**: `http://localhost:5000/api/auth/test-cookie`
4. **Check if cookie-parser is loaded**: Add this to server.js temporarily:
   ```javascript
   app.use((req, res, next) => {
       console.log("Cookies:", req.cookies);
       next();
   });
   ```

## Expected Behavior

When everything works correctly:

1. **Login** → Server sets cookie
2. **Check DevTools** → Cookie visible under `http://localhost:5000`
3. **Navigate to /home** → Cookie automatically sent with request
4. **Check Network tab** → Request includes `Cookie: token=...` header
5. **Server logs** → "Token verified for user: user@email.com"

## Production Notes

For production with HTTPS:
- Change `secure: false` to `secure: true`
- Change `sameSite: "lax"` to `sameSite: "strict"`
- Ensure your domain has valid SSL certificate
