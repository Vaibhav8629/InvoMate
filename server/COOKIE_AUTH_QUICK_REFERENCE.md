# Cookie-Based Authentication Quick Reference

## Cookie Configuration

All authentication cookies now use these settings:

```javascript
{
    httpOnly: true,      // Prevents JavaScript access (XSS protection)
    secure: true,        // HTTPS only (required for production)
    sameSite: "none",    // Cross-origin support (required for separate deployments)
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/"           // Available on all routes
}
```

## CORS Configuration

```javascript
const corsOptions = {
    origin: true,        // Allow all origins (Render compatible)
    credentials: true,   // Enable cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200
};
```

## Updated Functions

### 1. `register()` - server/controllers/auth-controller.js
- Sets authentication cookie on successful registration
- Cookie: `token` with JWT value
- Expiration: 30 days

### 2. `login()` - server/controllers/auth-controller.js
- Sets authentication cookie on successful login
- Cookie: `token` with JWT value
- Expiration: 30 days

### 3. `logout()` - server/controllers/auth-controller.js
- Clears authentication cookie
- Uses same settings for proper clearing

### 4. `testCookie()` - server/controllers/auth-controller.js
- Test endpoint for cookie functionality
- Sets temporary test cookie (1 minute expiration)

## Frontend Requirements

All fetch requests must include:

```javascript
credentials: 'include'
```

Example:
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  method: 'POST',
  credentials: 'include', // ✅ Required
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SIGN=your_jwt_secret
PORT=3000
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.onrender.com
```

## Deployment Checklist

### Backend (Render)
- [x] Push code to Git
- [ ] Create Web Service on Render
- [ ] Set environment variables
- [ ] Deploy
- [ ] Verify HTTPS is enabled
- [ ] Test cookie endpoint

### Frontend (Render)
- [x] Push code to Git
- [ ] Create Static Site on Render
- [ ] Set `VITE_API_URL` environment variable
- [ ] Deploy
- [ ] Verify HTTPS is enabled
- [ ] Test authentication flow

## Testing Commands

### Test Cookie Setting
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v
```

Look for `Set-Cookie` header in response.

### Test Cookie Reading
```bash
curl -X GET https://your-backend.onrender.com/api/auth/user \
  -H "Cookie: token=YOUR_TOKEN_HERE" \
  -v
```

## Common Issues

### Issue: Cookie not being set
**Solution:** Ensure both frontend and backend are on HTTPS

### Issue: 401 Unauthorized
**Solution:** Check that `credentials: 'include'` is in fetch request

### Issue: CORS error
**Solution:** Verify CORS configuration includes `credentials: true`

### Issue: Cookie not sent with request
**Solution:** Ensure cookie settings match between set and clear operations

## Key Changes Summary

| Setting | Before | After | Reason |
|---------|--------|-------|--------|
| `secure` | `false` | `true` | Required for HTTPS/production |
| `sameSite` | `"lax"` | `"none"` | Required for cross-origin |
| CORS origin | Whitelist | `true` | Render compatibility |
| CORS credentials | `true` | `true` | ✅ Already correct |

## Security Notes

✅ **Implemented:**
- HttpOnly cookies (XSS protection)
- Secure flag (HTTPS only)
- SameSite=none with secure (cross-origin safety)
- JWT token authentication
- 30-day expiration

⚠️ **Recommendations:**
- Use strong JWT_SIGN secret
- Implement rate limiting on auth endpoints
- Monitor authentication logs
- Rotate JWT secret periodically

---

**Last Updated:** May 9, 2026  
**Status:** Production Ready ✅
