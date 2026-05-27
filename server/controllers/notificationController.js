const Notification = require("../models/Notification");

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, type, message, redirectUrl } = req.body;

    if (!userId || !type || !message || !redirectUrl) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      message,
      redirectUrl
    });

    // Emit socket event for real-time notification
    const io = req.app.get("io");
    if (io) {
      io.to(userId.toString()).emit("newNotification", notification);
    }

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating notification"
    });
  }
};

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications"
    });
  }
};

// Delete a notification after it has been viewed
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete(
      { _id: id, userId },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting notification"
    });
  }
};

// Delete all notifications for the user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: "All notifications cleared"
    });
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while clearing notifications"
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting unread count"
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
