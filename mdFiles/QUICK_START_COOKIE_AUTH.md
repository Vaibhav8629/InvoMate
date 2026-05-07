# Quick Start: Cookie-Based Authentication

## 🚀 Getting Started

### 1. Install Dependencies (if not already done)
```bash
cd InvoMate/server
npm install
```

### 2. Start the Backend
```bash
cd InvoMate/server
npm run dev
```

You should see:
```
Server is running at PORT 5000
```

### 3. Start the Frontend
```bash
cd InvoMate/client
npm run dev
```

You should see:
```
Local: http://localhost:5173/
```

### 4. Test the Authentication

#### Login Test
1. Open browser to `http://localhost:5173/login`
2. Enter credentials and login
3. Open DevTools (F12) → Application → Cookies
4. Verify you see a `token` cookie with:
   - ✅ HttpOnly: true
   - ✅ SameSite: Strict
   - ✅ Path: /
   - ✅ Expires: ~30 days from now

#### Protected Route Test
1. Navigate to `/home` or `/profile`
2. Should load without issues
3. Check Network tab → any API request
4. Verify `Cookie` header is automatically included
5. Verify NO `Authorization` header is present

#### Logout Test
1. Click logout button
2. Check Cookies in DevTools
3. `token` cookie should be removed
4. Should redirect to `/login`

## 🔍 Troubleshooting

### Problem: "Unauthorized" error
**Solution**: 
- Clear all cookies for localhost:5173
- Clear localStorage (just in case)
- Log in again

### Problem: Cookie not being set
**Solution**:
- Check backend console for errors
- Verify backend is running on port 5000
- Check CORS configuration in server.js

### Problem: Cookie not sent with requests
**Solution**:
- Verify all fetch calls have `credentials: 'include'`
- Check browser console for CORS errors
- Ensure frontend and backend are on correct ports

## 📋 What Changed?

### Before (localStorage)
```javascript
// Login
localStorage.setItem("token", data.token);

// API Call
fetch(url, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

// Logout
localStorage.removeItem("token");
```

### After (Cookies)
```javascript
// Login - cookie set automatically by backend
await loginUser();

// API Call - cookie sent automatically
fetch(url, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Logout - cookie cleared by backend
await logoutUser();
```

## ✅ Verification Checklist

After starting the application:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login successfully
- [ ] Cookie appears in DevTools
- [ ] Cookie has HttpOnly flag
- [ ] Can access protected routes
- [ ] API calls work without errors
- [ ] Logout clears the cookie
- [ ] After logout, redirected to login

## 🔐 Security Features

| Feature | Status |
|---------|--------|
| XSS Protection | ✅ Enabled (HttpOnly) |
| CSRF Protection | ✅ Enabled (SameSite: Strict) |
| JavaScript Access | ❌ Blocked (HttpOnly) |
| Automatic Expiry | ✅ 30 days |
| HTTPS Only (Production) | ✅ Enabled when NODE_ENV=production |

## 📝 Important Notes

1. **All users must log in again** after this update
2. **JWT logic unchanged** - same secret, expiry, and structure
3. **Production**: Set `NODE_ENV=production` in `.env` for HTTPS-only cookies
4. **Development**: Works with HTTP (secure: false)

## 🎯 Next Steps

1. ✅ Test login/logout flow
2. ✅ Test all protected routes
3. ✅ Test API calls (invoices, products, profile)
4. ✅ Verify cookies in DevTools
5. ✅ Test on different browsers
6. ✅ Deploy to production with HTTPS

## 📚 Additional Resources

- Full migration guide: `COOKIE_AUTH_MIGRATION.md`
- Summary: `MIGRATION_SUMMARY.md`
- Backend code: `server/controllers/auth-controller.js`
- Frontend auth: `client/src/store/auth.jsx`

---

**Ready to go! 🎉**

If you encounter any issues, check the troubleshooting section above or refer to the detailed migration guide.
