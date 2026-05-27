const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ["invoice", "product", "profile"],
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  redirectUrl: {
    type: String,
    required: true
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
