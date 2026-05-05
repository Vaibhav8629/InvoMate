/**
 * Test Notification Utility
 * 
 * This file provides helper functions to manually test notifications
 * during development. Import and use these functions in your routes
 * or controllers to trigger test notifications.
 */

const Notification = require("../models/Notification");

/**
 * Create a test invoice notification
 */
const createTestInvoiceNotification = async (userId) => {
  try {
    const notification = await Notification.create({
      userId,
      type: "invoice",
      message: `Test invoice #INV-${Date.now()} has been created successfully`,
      redirectUrl: `/invoice/test-${Date.now()}`
    });
    console.log("✅ Test invoice notification created:", notification._id);
    return notification;
  } catch (error) {
    console.error("❌ Error creating test invoice notification:", error);
    throw error;
  }
};

/**
 * Create a test product notification
 */
const createTestProductNotification = async (userId) => {
  try {
    const notification = await Notification.create({
      userId,
      type: "product",
      message: `Test product "Sample Product ${Date.now()}" has been added to inventory`,
      redirectUrl: `/products`
    });
    console.log("✅ Test product notification created:", notification._id);
    return notification;
  } catch (error) {
    console.error("❌ Error creating test product notification:", error);
    throw error;
  }
};

/**
 * Create a test profile notification
 */
const createTestProfileNotification = async (userId) => {
  try {
    const notification = await Notification.create({
      userId,
      type: "profile",
      message: `Profile has been updated successfully at ${new Date().toLocaleTimeString()}`,
      redirectUrl: `/profile`
    });
    console.log("✅ Test profile notification created:", notification._id);
    return notification;
  } catch (error) {
    console.error("❌ Error creating test profile notification:", error);
    throw error;
  }
};

/**
 * Create multiple test notifications
 */
const createBulkTestNotifications = async (userId, count = 5) => {
  try {
    const types = ["invoice", "product", "profile"];
    const notifications = [];

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      let notification;

      switch (type) {
        case "invoice":
          notification = await createTestInvoiceNotification(userId);
          break;
        case "product":
          notification = await createTestProductNotification(userId);
          break;
        case "profile":
          notification = await createTestProfileNotification(userId);
          break;
      }

      notifications.push(notification);
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Created ${count} test notifications`);
    return notifications;
  } catch (error) {
    console.error("❌ Error creating bulk test notifications:", error);
    throw error;
  }
};

/**
 * Clear all notifications for a user (useful for testing)
 */
const clearUserNotifications = async (userId) => {
  try {
    const result = await Notification.deleteMany({ userId });
    console.log(`✅ Cleared ${result.deletedCount} notifications for user ${userId}`);
    return result;
  } catch (error) {
    console.error("❌ Error clearing notifications:", error);
    throw error;
  }
};

/**
 * Get notification statistics for a user
 */
const getNotificationStats = async (userId) => {
  try {
    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({ userId, isRead: false });
    const byType = await Notification.aggregate([
      { $match: { userId } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const stats = {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    console.log("📊 Notification Stats:", stats);
    return stats;
  } catch (error) {
    console.error("❌ Error getting notification stats:", error);
    throw error;
  }
};

module.exports = {
  createTestInvoiceNotification,
  createTestProductNotification,
  createTestProfileNotification,
  createBulkTestNotifications,
  clearUserNotifications,
  getNotificationStats
};

/**
 * USAGE EXAMPLES:
 * 
 * // In a route or controller:
 * const { createTestInvoiceNotification } = require("../utils/testNotifications");
 * 
 * // Create a single test notification
 * await createTestInvoiceNotification(req.user._id);
 * 
 * // Create multiple test notifications
 * await createBulkTestNotifications(req.user._id, 10);
 * 
 * // Get stats
 * const stats = await getNotificationStats(req.user._id);
 * 
 * // Clear all notifications
 * await clearUserNotifications(req.user._id);
 */
