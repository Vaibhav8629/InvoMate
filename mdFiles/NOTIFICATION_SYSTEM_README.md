# 🔔 InvoMate Notification System

A complete real-time notification system for the InvoMate MERN stack application with Socket.io integration.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Socket Events](#socket-events)
- [Customization](#customization)

---

## ✨ Features

### Core Features
- ✅ **Real-time notifications** using Socket.io
- ✅ **Automatic notification triggers** for:
  - Invoice creation
  - Product addition to inventory
  - Profile updates
- ✅ **MongoDB storage** with optimized indexes
- ✅ **Unread count badge** on notification bell
- ✅ **Mark as read** functionality (individual & bulk)
- ✅ **Smart redirects** to relevant pages
- ✅ **Responsive design** with smooth animations

### UI Features
- 🎨 Modern card-style notifications
- 🔔 Notification bell with badge counter
- 📱 Dropdown panel with smooth transitions
- 🎯 Type-based icons:
  - 📄 Invoice → Document icon
  - 📦 Product → Inventory icon
  - 👤 Profile → Person icon
- ⏰ Smart timestamp formatting (e.g., "2m ago", "5h ago")
- 🎭 Visual distinction for unread notifications
- 🔊 Optional notification sound

---

## 🏗️ Architecture

```
InvoMate/
├── server/
│   ├── models/
│   │   └── Notification.js          # Notification schema
│   ├── controllers/
│   │   └── notificationController.js # CRUD operations
│   ├── routes/
│   │   └── notificationRoutes.js     # API routes
│   ├── services/
│   │   └── notificationService.js    # Business logic
│   └── server.js                     # Socket.io setup
│
└── client/
    ├── src/
    │   ├── components/
    │   │   └── NotificationBell.jsx  # Main UI component
    │   ├── services/
    │   │   ├── socket.js             # Socket.io client
    │   │   └── notificationApi.js    # API calls
    │   └── pages/
    │       └── Home.jsx              # Integration example
```

---

## 📦 Installation

### Dependencies Installed

**Backend:**
```bash
npm install socket.io
```

**Frontend:**
```bash
npm install socket.io-client
```

---

## 🔧 Backend Setup

### 1. Notification Model (`models/Notification.js`)

```javascript
{
  userId: ObjectId,        // Reference to User
  type: String,            // "invoice" | "product" | "profile"
  message: String,         // Notification message
  redirectUrl: String,     // Where to navigate on click
  isRead: Boolean,         // Read status
  createdAt: Date         // Timestamp
}
```

**Indexes for performance:**
- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, isRead: 1 }`

### 2. Socket.io Integration (`server.js`)

The server now includes:
- HTTP server wrapper for Express
- Socket.io initialization with CORS
- User room management for targeted notifications
- NotificationService instance available to all routes

### 3. Automatic Notification Triggers

**Invoice Creation** (`controllers/invoice-controller.js`):
```javascript
// Automatically creates notification when invoice is saved
await notificationService.createInvoiceNotification(
  userId,
  invoiceNumber,
  invoiceId
);
```

**Product Addition** (`controllers/products-controller.js`):
```javascript
// Automatically creates notification when product is added
await notificationService.createProductNotification(
  userId,
  productName,
  productId
);
```

**Profile Update** (`controllers/profile-controller.js`):
```javascript
// Automatically creates notification when profile is updated
await notificationService.createProfileNotification(
  userId,
  shopName
);
```

---

## 🎨 Frontend Setup

### 1. Socket Service (`services/socket.js`)

Manages WebSocket connection:
- Auto-reconnection on disconnect
- User room joining
- Event listeners management

### 2. Notification API (`services/notificationApi.js`)

Handles HTTP requests:
- `getNotifications(limit)` - Fetch notifications
- `markNotificationAsRead(id)` - Mark single as read
- `markAllNotificationsAsRead()` - Mark all as read
- `getUnreadCount()` - Get unread count

### 3. NotificationBell Component

**Props:**
- `userId` (required) - Current user's ID for Socket.io room

**Features:**
- Real-time updates via Socket.io
- Unread count badge
- Dropdown menu with notifications
- Click to mark as read and navigate
- "Mark all as read" button
- Smooth animations and transitions
- Notification sound (optional)

---

## 🚀 Usage

### Integrating NotificationBell

```jsx
import NotificationBell from "../components/NotificationBell";

function YourComponent() {
  const [userId, setUserId] = useState(null);

  // Fetch user ID from your auth system
  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUserId(data._id);
    };
    fetchUserId();
  }, []);

  return (
    <div>
      {userId && <NotificationBell userId={userId} />}
    </div>
  );
}
```

### Creating Custom Notifications

```javascript
// Using the notification service
const notificationService = req.app.get("notificationService");

await notificationService.createNotification(
  userId,
  "custom",
  "Your custom message here",
  "/custom-redirect-url"
);
```

---

## 📡 API Endpoints

All routes require authentication via `authMiddleware`.

### `POST /api/notifications/create`
Create a new notification (internal use).

**Body:**
```json
{
  "userId": "user_id",
  "type": "invoice",
  "message": "New invoice created",
  "redirectUrl": "/invoice/123"
}
```

### `GET /api/notifications`
Get all notifications for logged-in user.

**Query params:**
- `limit` (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [...notifications],
  "unreadCount": 5
}
```

### `GET /api/notifications/unread-count`
Get unread notification count.

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

### `PATCH /api/notifications/:id/read`
Mark specific notification as read.

**Response:**
```json
{
  "success": true,
  "data": {...notification}
}
```

### `PATCH /api/notifications/mark-all-read`
Mark all notifications as read.

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 🔌 Socket Events

### Client → Server

**`join`** - Join user's notification room
```javascript
socket.emit("join", userId);
```

### Server → Client

**`newNotification`** - New notification received
```javascript
socket.on("newNotification", (notification) => {
  // Handle new notification
});
```

---

## 🎨 Customization

### Changing Notification Icons

Edit `NotificationBell.jsx`:

```javascript
const getNotificationIcon = (type) => {
  switch (type) {
    case "invoice":
      return <YourCustomIcon sx={{ color: "#4CAF50" }} />;
    // Add more cases...
  }
};
```

### Adjusting Colors

Modify the accent colors in the component:

```javascript
case "invoice":
  return <InvoiceIcon sx={{ color: "#YOUR_COLOR" }} />;
```

### Notification Sound

The component includes a base64-encoded notification sound. To use a custom sound:

```javascript
<audio ref={audioRef} src="/path/to/your/sound.mp3" preload="auto" />
```

### Notification Limit

Change the default limit in `NotificationBell.jsx`:

```javascript
const fetchNotifications = async () => {
  const response = await getNotifications(50); // Change from 20 to 50
};
```

---

## 🔐 Security Considerations

1. **Authentication**: All API routes are protected with `authMiddleware`
2. **User Isolation**: Socket.io rooms ensure users only receive their own notifications
3. **Token Validation**: JWT tokens are validated on every request
4. **Input Validation**: All inputs are validated before database operations

---

## 🐛 Troubleshooting

### Notifications not appearing in real-time

1. Check Socket.io connection:
```javascript
console.log("Socket connected:", socket.id);
```

2. Verify user joined their room:
```javascript
socket.on("join", (userId) => {
  console.log(`User ${userId} joined`);
});
```

3. Check CORS settings in `server.js`

### Notifications not persisting

1. Verify MongoDB connection
2. Check notification model indexes
3. Review controller error logs

### Badge count not updating

1. Ensure `isRead` field is being updated
2. Check `getUnreadCount` API response
3. Verify state management in component

---

## 📈 Performance Optimization

1. **Database Indexes**: Optimized queries with compound indexes
2. **Pagination**: Limit notifications to prevent large payloads
3. **Socket Rooms**: Targeted notifications reduce broadcast overhead
4. **Lazy Loading**: Notifications fetched on demand

---

## 🎯 Future Enhancements

- [ ] Push notifications for mobile devices
- [ ] Email notifications for important events
- [ ] Notification preferences/settings
- [ ] Notification categories and filtering
- [ ] Notification history archive
- [ ] Bulk delete notifications
- [ ] Notification templates
- [ ] Scheduled notifications

---

## 📝 License

This notification system is part of the InvoMate project.

---

## 🤝 Contributing

To add new notification types:

1. Add type to Notification model enum
2. Create service method in `notificationService.js`
3. Add icon mapping in `NotificationBell.jsx`
4. Trigger notification in relevant controller

---

## 📞 Support

For issues or questions, please refer to the main InvoMate documentation or create an issue in the repository.

---

**Built with ❤️ for InvoMate**
