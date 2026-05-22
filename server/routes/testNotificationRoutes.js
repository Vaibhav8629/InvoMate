/**
 * Test Notification Routes
 * 
 * These routes are for development/testing purposes only.
 * Remove or disable in production!
 */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const checkSubscription = require("../middleware/subscription-middleware");
const {
  createTestInvoiceNotification,
  createTestProductNotification,
  createTestProfileNotification,
  createBulkTestNotifications,
  clearUserNotifications,
  getNotificationStats
} = require("../utils/testNotifications");

// All routes require authentication
router.use(authMiddleware);
router.use(checkSubscription);

/**
 * POST /api/test-notifications/invoice
 * Create a test invoice notification
 */
router.post("/invoice", async (req, res) => {
  try {
    const notification = await createTestInvoiceNotification(req.user._id);
    
    // Emit real-time notification
    const io = req.app.get("io");
    if (io) {
      io.to(req.user._id.toString()).emit("newNotification", notification);
    }

    res.status(201).json({
      success: true,
      message: "Test invoice notification created",
      data: notification
    });
  } catch (error) {
    console.error("Error creating test invoice notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test notification"
    });
  }
});

/**
 * POST /api/test-notifications/product
 * Create a test product notification
 */
router.post("/product", async (req, res) => {
  try {
    const notification = await createTestProductNotification(req.user._id);
    
    // Emit real-time notification
    const io = req.app.get("io");
    if (io) {
      io.to(req.user._id.toString()).emit("newNotification", notification);
    }

    res.status(201).json({
      success: true,
      message: "Test product notification created",
      data: notification
    });
  } catch (error) {
    console.error("Error creating test product notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test notification"
    });
  }
});

/**
 * POST /api/test-notifications/profile
 * Create a test profile notification
 */
router.post("/profile", async (req, res) => {
  try {
    const notification = await createTestProfileNotification(req.user._id);
    
    // Emit real-time notification
    const io = req.app.get("io");
    if (io) {
      io.to(req.user._id.toString()).emit("newNotification", notification);
    }

    res.status(201).json({
      success: true,
      message: "Test profile notification created",
      data: notification
    });
  } catch (error) {
    console.error("Error creating test profile notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test notification"
    });
  }
});

/**
 * POST /api/test-notifications/bulk
 * Create multiple test notifications
 */
router.post("/bulk", async (req, res) => {
  try {
    const count = parseInt(req.body.count) || 5;
    const notifications = await createBulkTestNotifications(req.user._id, count);
    
    // Emit real-time notifications
    const io = req.app.get("io");
    if (io) {
      notifications.forEach(notification => {
        io.to(req.user._id.toString()).emit("newNotification", notification);
      });
    }

    res.status(201).json({
      success: true,
      message: `Created ${count} test notifications`,
      data: notifications
    });
  } catch (error) {
    console.error("Error creating bulk test notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test notifications"
    });
  }
});

/**
 * DELETE /api/test-notifications/clear
 * Clear all notifications for current user
 */
router.delete("/clear", async (req, res) => {
  try {
    const result = await clearUserNotifications(req.user._id);
    
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} notifications`,
      data: result
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear notifications"
    });
  }
});

/**
 * GET /api/test-notifications/stats
 * Get notification statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await getNotificationStats(req.user._id);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notification stats"
    });
  }
});

module.exports = router;
