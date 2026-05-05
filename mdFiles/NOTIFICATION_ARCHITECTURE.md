# 🏗️ Notification System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION SYSTEM                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│   FRONTEND       │◄───────►│   BACKEND        │◄───────►│   DATABASE       │
│   (React)        │         │   (Node.js)      │         │   (MongoDB)      │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │
        │                            │
        │    ┌──────────────────┐   │
        └───►│   SOCKET.IO      │◄──┘
             │   (WebSocket)    │
             └──────────────────┘
```

## Data Flow

### 1. Notification Creation Flow

```
User Action (Create Invoice/Product/Profile)
    │
    ▼
Controller receives request
    │
    ▼
Business logic executes
    │
    ▼
Data saved to MongoDB
    │
    ▼
NotificationService.createNotification()
    │
    ├──► Save to MongoDB (notifications collection)
    │
    └──► Emit Socket.io event to user's room
         │
         ▼
    Frontend receives real-time notification
         │
         ▼
    UI updates (badge count, notification list)
```

### 2. Notification Read Flow

```
User clicks notification in UI
    │
    ▼
API call: PATCH /api/notifications/:id/read
    │
    ▼
Backend updates isRead = true in MongoDB
    │
    ▼
Response sent to frontend
    │
    ▼
Frontend updates local state
    │
    ├──► Remove from unread list
    ├──► Decrease badge count
    └──► Navigate to redirectUrl
```

## Component Architecture

### Backend Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER.JS                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • Express App                                             │ │
│  │  • HTTP Server                                             │ │
│  │  • Socket.io Server                                        │ │
│  │  • NotificationService Instance                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   MODELS     │    │ CONTROLLERS  │    │   SERVICES   │
│              │    │              │    │              │
│ Notification │◄───│ notification │◄───│ Notification │
│   Schema     │    │  Controller  │    │   Service    │
│              │    │              │    │              │
│ • userId     │    │ • create     │    │ • create     │
│ • type       │    │ • getAll     │    │   Invoice    │
│ • message    │    │ • markRead   │    │ • create     │
│ • redirect   │    │ • markAll    │    │   Product    │
│ • isRead     │    │   Read       │    │ • create     │
│ • createdAt  │    │ • getUnread  │    │   Profile    │
│              │    │   Count      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │
        └─────────┬───────────┘
                  ▼
          ┌──────────────┐
          │    ROUTES    │
          │              │
          │ /api/        │
          │ notifications│
          │              │
          │ • GET /      │
          │ • POST /     │
          │   create     │
          │ • PATCH /    │
          │   :id/read   │
          │ • PATCH /    │
          │   mark-all   │
          └──────────────┘
```

### Frontend Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      HOME.JSX (or any page)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  <NotificationBell userId={userId} />                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATIONBELL.JSX                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  State:                                                    │ │
│  │  • notifications[]                                         │ │
│  │  • unreadCount                                             │ │
│  │  • anchorEl (menu)                                         │ │
│  │                                                            │ │
│  │  Effects:                                                  │ │
│  │  • fetchNotifications()                                    │ │
│  │  • setupSocketListeners()                                  │ │
│  │                                                            │ │
│  │  Handlers:                                                 │ │
│  │  • handleNotificationClick()                               │ │
│  │  • handleMarkAllAsRead()                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
        │                                    │
        ▼                                    ▼
┌──────────────────┐            ┌──────────────────┐
│  SOCKET.JS       │            │ NOTIFICATION     │
│                  │            │ API.JS           │
│ • connect()      │            │                  │
│ • disconnect()   │            │ • getNotifications│
│ • on()           │            │ • markAsRead     │
│ • emit()         │            │ • markAllAsRead  │
│                  │            │ • getUnreadCount │
└──────────────────┘            └──────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATIONS COLLECTION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  {                                                               │
│    _id: ObjectId("507f1f77bcf86cd799439011"),                   │
│    userId: ObjectId("507f191e810c19729de860ea"),                │
│    type: "invoice" | "product" | "profile",                     │
│    message: "New invoice #INV-001 has been created",            │
│    redirectUrl: "/invoice/507f1f77bcf86cd799439011",            │
│    isRead: false,                                                │
│    createdAt: ISODate("2024-01-15T10:30:00.000Z")               │
│  }                                                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  INDEXES:                                                        │
│  • { userId: 1, createdAt: -1 }  ← Fast user queries            │
│  • { userId: 1, isRead: 1 }      ← Fast unread count            │
└─────────────────────────────────────────────────────────────────┘
```

## Socket.io Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SOCKET.IO SERVER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Connection Event:                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  socket.on("connection", (socket) => {                     │ │
│  │    console.log("User connected:", socket.id);              │ │
│  │                                                            │ │
│  │    socket.on("join", (userId) => {                         │ │
│  │      socket.join(userId);  // Join user's room             │ │
│  │    });                                                     │ │
│  │  });                                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Rooms Structure:                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Room: "507f191e810c19729de860ea"                          │ │
│  │    └─ Socket: abc123xyz (User A's connection)             │ │
│  │                                                            │ │
│  │  Room: "507f1f77bcf86cd799439011"                          │ │
│  │    └─ Socket: def456uvw (User B's connection)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Emit Event:                                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  io.to(userId).emit("newNotification", notification);      │ │
│  │  // Only sends to specific user's room                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

### Creating a Notification

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Server  │     │ Database │     │ Socket.io│
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ POST /invoice  │                │                │
     ├───────────────►│                │                │
     │                │                │                │
     │                │ INSERT invoice │                │
     │                ├───────────────►│                │
     │                │                │                │
     │                │◄───────────────┤                │
     │                │   invoice doc  │                │
     │                │                │                │
     │                │ INSERT notification             │
     │                ├───────────────►│                │
     │                │                │                │
     │                │◄───────────────┤                │
     │                │ notification   │                │
     │                │                │                │
     │                │ emit("newNotification")         │
     │                ├────────────────────────────────►│
     │                │                │                │
     │◄───────────────┤                │                │
     │  200 OK        │                │                │
     │                │                │                │
     │◄───────────────────────────────────────────────┤
     │           newNotification event                 │
     │                │                │                │
```

### Marking as Read

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Server  │     │ Database │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │ PATCH /:id/read│                │
     ├───────────────►│                │
     │                │                │
     │                │ UPDATE isRead  │
     │                ├───────────────►│
     │                │                │
     │                │◄───────────────┤
     │                │  updated doc   │
     │                │                │
     │◄───────────────┤                │
     │  200 OK        │                │
     │                │                │
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Authentication Middleware                                    │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  • Verify JWT token                                  │   │
│     │  • Extract user ID                                   │   │
│     │  • Attach to req.user                                │   │
│     └──────────────────────────────────────────────────────┘   │
│                                                                  │
│  2. User Isolation                                               │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  • Queries filtered by userId                        │   │
│     │  • Socket.io rooms per user                          │   │
│     │  • No cross-user data access                         │   │
│     └──────────────────────────────────────────────────────┘   │
│                                                                  │
│  3. Input Validation                                             │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  • Type checking                                     │   │
│     │  • Required field validation                         │   │
│     │  • Sanitization                                      │   │
│     └──────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Optimizations

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE FEATURES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Database Indexes                                             │
│     • Compound index on userId + createdAt                       │
│     • Compound index on userId + isRead                          │
│     → Fast queries for user notifications                        │
│                                                                  │
│  2. Pagination                                                   │
│     • Limit to 20 notifications by default                       │
│     • Prevents large payload transfers                           │
│                                                                  │
│  3. Socket.io Rooms                                              │
│     • Targeted notifications (not broadcast)                     │
│     • Reduces network overhead                                   │
│                                                                  │
│  4. Lazy Loading                                                 │
│     • Notifications fetched on demand                            │
│     • Not loaded on every page                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Backend:                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  try {                                                     │ │
│  │    // Notification logic                                  │ │
│  │  } catch (error) {                                        │ │
│  │    console.error("Error:", error);                        │ │
│  │    res.status(500).json({                                 │ │
│  │      success: false,                                      │ │
│  │      message: "Server error"                              │ │
│  │    });                                                    │ │
│  │  }                                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Frontend:                                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  try {                                                     │ │
│  │    await fetchNotifications();                            │ │
│  │  } catch (error) {                                        │ │
│  │    console.error("Error:", error);                        │ │
│  │    // Graceful degradation - app continues to work       │ │
│  │  }                                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Socket.io:                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • Auto-reconnection on disconnect                        │ │
│  │  • Reconnection attempts: 5                               │ │
│  │  • Reconnection delay: 1000ms                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALABILITY NOTES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Current Setup (Single Server):                                 │
│  ✓ Works for small to medium applications                       │
│  ✓ Simple deployment                                             │
│  ✓ Easy to debug                                                 │
│                                                                  │
│  For High Scale (Multiple Servers):                             │
│  • Use Redis adapter for Socket.io                              │
│  • Implement message queue (RabbitMQ/Redis)                     │
│  • Add load balancer with sticky sessions                       │
│  • Consider notification service microservice                   │
│                                                                  │
│  Example Redis Adapter:                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  const { createAdapter } = require("@socket.io/redis-     │ │
│  │    adapter");                                              │ │
│  │  const { createClient } = require("redis");               │ │
│  │                                                            │ │
│  │  const pubClient = createClient({ url: "redis://..." }); │ │
│  │  const subClient = pubClient.duplicate();                │ │
│  │                                                            │ │
│  │  io.adapter(createAdapter(pubClient, subClient));        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**This architecture provides a solid foundation for a production-ready notification system!**
