# 🚀 Notification System - Quick Start Guide

Get your notification system up and running in 5 minutes!

## ✅ Prerequisites

- Node.js and npm installed
- MongoDB running
- InvoMate backend and frontend already set up

## 📦 Step 1: Dependencies (Already Installed)

The following packages have been installed:

**Backend:**
```bash
cd server
npm install socket.io
```

**Frontend:**
```bash
cd client
npm install socket.io-client
```

## 🔧 Step 2: Start the Servers

### Start Backend (Terminal 1)
```bash
cd InvoMate/server
npm run dev
```

You should see:
```
Server is running at PORT 5000
MongoDB connected successfully
```

### Start Frontend (Terminal 2)
```bash
cd InvoMate/client
npm run dev
```

You should see:
```
VITE ready in XXXms
Local: http://localhost:5173
```

## 🎯 Step 3: Test the System

### Method 1: Use the Application Normally

1. **Login** to your account
2. **Create an Invoice** → You'll see a notification appear!
3. **Add a Product** → Another notification!
4. **Update Profile** → One more notification!

### Method 2: Use Test API Endpoints

Open a new terminal and use curl or Postman:

```bash
# Get your auth token first (login via the app)
TOKEN="your_jwt_token_here"

# Create a test invoice notification
curl -X POST http://localhost:5000/api/test-notifications/invoice \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Create a test product notification
curl -X POST http://localhost:5000/api/test-notifications/product \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Create a test profile notification
curl -X POST http://localhost:5000/api/test-notifications/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Create 10 test notifications at once
curl -X POST http://localhost:5000/api/test-notifications/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'

# Get notification statistics
curl -X GET http://localhost:5000/api/test-notifications/stats \
  -H "Authorization: Bearer $TOKEN"

# Clear all notifications
curl -X DELETE http://localhost:5000/api/test-notifications/clear \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 Step 4: Verify Everything Works

### Check the UI

1. **Look for the bell icon** in the top navigation bar
2. **Red badge** should show unread count
3. **Click the bell** to see the dropdown
4. **Click a notification** to mark it as read and navigate

### Check the Console

**Browser Console (F12):**
```
Socket connected: abc123xyz
User 507f1f77bcf86cd799439011 joined their notification room
```

**Server Console:**
```
User connected: abc123xyz
User 507f1f77bcf86cd799439011 joined their notification room
```

### Check MongoDB

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use invomate

# Check notifications collection
db.notifications.find().pretty()
```

## 🎨 Step 5: Customize (Optional)

### Change Notification Colors

Edit `client/src/components/NotificationBell.jsx`:

```javascript
const getNotificationIcon = (type) => {
  switch (type) {
    case "invoice":
      return <InvoiceIcon sx={{ color: "#YOUR_COLOR" }} />;
    // ...
  }
};
```

### Change Notification Limit

```javascript
const fetchNotifications = async () => {
  const response = await getNotifications(50); // Change from 20
};
```

### Disable Notification Sound

Comment out the audio play in `NotificationBell.jsx`:

```javascript
// if (audioRef.current) {
//   audioRef.current.play().catch(err => console.log("Audio play failed:", err));
// }
```

## 🐛 Troubleshooting

### Notifications not appearing?

**Check Socket.io connection:**
```javascript
// In browser console
console.log(socketService.getSocket());
```

**Check if user joined room:**
```javascript
// In server console, you should see:
User 507f1f77bcf86cd799439011 joined their notification room
```

### Badge count not updating?

**Clear browser cache and reload:**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### CORS errors?

**Verify CORS settings in `server.js`:**
```javascript
const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET, POST , PUT, DELETE, PATCH",
    credentials: true,
}
```

## 📊 Testing Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] MongoDB connected
- [ ] User logged in
- [ ] Socket.io connected (check console)
- [ ] Bell icon visible in UI
- [ ] Create invoice → notification appears
- [ ] Create product → notification appears
- [ ] Update profile → notification appears
- [ ] Click notification → marks as read
- [ ] Click notification → navigates to correct page
- [ ] Badge count updates correctly
- [ ] "Mark all as read" works

## 🎉 Success!

If all checks pass, your notification system is working perfectly!

## 📚 Next Steps

- Read the full documentation: `NOTIFICATION_SYSTEM_README.md`
- Customize notification messages
- Add more notification types
- Set up email notifications
- Configure push notifications

## 🔒 Production Deployment

Before deploying to production:

1. **Remove test routes** from `server.js`:
```javascript
// Remove this line:
app.use('/api/test-notifications', testNotificationRoutes);
```

2. **Update CORS origin** to your production domain:
```javascript
const corsOptions = {
    origin: "https://your-production-domain.com",
    // ...
}
```

3. **Set environment variables:**
```bash
PORT=5000
MONGODB_URI=your_production_mongodb_uri
```

4. **Enable HTTPS** for Socket.io in production

## 💡 Tips

- **Keep notifications concise** - Users should understand at a glance
- **Use meaningful redirect URLs** - Take users exactly where they need to go
- **Don't spam** - Only send important notifications
- **Test on mobile** - Ensure responsive design works
- **Monitor performance** - Check notification delivery times

## 🆘 Need Help?

- Check the full README: `NOTIFICATION_SYSTEM_README.md`
- Review the code comments in each file
- Check browser and server console logs
- Verify MongoDB connection and data

---

**Happy coding! 🚀**
