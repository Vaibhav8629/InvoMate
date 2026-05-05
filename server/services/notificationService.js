const Notification = require("../models/Notification");

/**
 * Service to create notifications and emit real-time events
 */
class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Create a notification for invoice creation
   */
  async createInvoiceNotification(userId, invoiceNumber, invoiceId) {
    try {
      const notification = await Notification.create({
        userId,
        type: "invoice",
        message: `New invoice #${invoiceNumber} has been created successfully`,
        redirectUrl: `/invoice/${invoiceId}`
      });

      // Emit real-time notification
      if (this.io) {
        this.io.to(userId.toString()).emit("newNotification", notification);
      }

      return notification;
    } catch (error) {
      console.error("Error creating invoice notification:", error);
      throw error;
    }
  }

  /**
   * Create a notification for product addition
   */
  async createProductNotification(userId, productName, productId) {
    try {
      const notification = await Notification.create({
        userId,
        type: "product",
        message: `New product "${productName}" has been added to inventory`,
        redirectUrl: `/products`
      });

      // Emit real-time notification
      if (this.io) {
        this.io.to(userId.toString()).emit("newNotification", notification);
      }

      return notification;
    } catch (error) {
      console.error("Error creating product notification:", error);
      throw error;
    }
  }

  /**
   * Create a notification for profile update
   */
  async createProfileNotification(userId, shopName) {
    try {
      const notification = await Notification.create({
        userId,
        type: "profile",
        message: `Profile for "${shopName}" has been updated successfully`,
        redirectUrl: `/profile`
      });

      // Emit real-time notification
      if (this.io) {
        this.io.to(userId.toString()).emit("newNotification", notification);
      }

      return notification;
    } catch (error) {
      console.error("Error creating profile notification:", error);
      throw error;
    }
  }

  /**
   * Generic notification creator
   */
  async createNotification(userId, type, message, redirectUrl) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        message,
        redirectUrl
      });

      // Emit real-time notification
      if (this.io) {
        this.io.to(userId.toString()).emit("newNotification", notification);
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
