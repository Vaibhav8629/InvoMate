const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/auth-middleware");
const checkSubscription = require("../middleware/subscription-middleware");

// All routes require authentication
router.use(authMiddleware);
router.use(checkSubscription);

// Create notification (can be used internally or by admin)
router.post("/create", createNotification);

// Get all notifications for logged-in user
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark specific notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllAsRead);

module.exports = router;
