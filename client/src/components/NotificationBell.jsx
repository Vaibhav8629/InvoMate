import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Button,
  Paper,
  Fade,
  Tooltip
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Description as InvoiceIcon,
  Inventory as ProductIcon,
  Person as ProfileIcon,
  CheckCircle as CheckIcon,
  Circle as UnreadIcon
} from "@mui/icons-material";
import socketService from "../services/socket";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../services/notificationApi";

const NotificationBell = ({ userId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const open = Boolean(anchorEl);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Setup socket connection
  useEffect(() => {
    if (userId) {
      socketService.connect(userId);

      // Listen for new notifications
      socketService.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.log("Audio play failed:", err));
        }
      });

      return () => {
        socketService.off("newNotification");
      };
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications(20);
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Navigate to the redirect URL
      handleClose();
      navigate(notification.redirectUrl);
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "invoice":
        return <InvoiceIcon sx={{ color: "#4CAF50", fontSize: 28 }} />;
      case "product":
        return <ProductIcon sx={{ color: "#2196F3", fontSize: 28 }} />;
      case "profile":
        return <ProfileIcon sx={{ color: "#FF9800", fontSize: 28 }} />;
      default:
        return <NotificationsIcon sx={{ color: "#9E9E9E", fontSize: 28 }} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0vBSh+zPDajzsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z2Ik2Bxdju+zooVARC0yl4fG5ZRwFNo3V7859LwUofsz" preload="auto" />

      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          sx={{
            color: "inherit",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)"
            }
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 8,
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5,
            borderRadius: 2,
            overflow: "hidden"
          }
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "0.75rem",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Box
              sx={{
                py: 4,
                px: 2,
                textAlign: "center",
                color: "text.secondary"
              }}
            >
              <NotificationsIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">No notifications yet</Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <MenuItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : "action.hover",
                  borderLeft: notification.isRead
                    ? "none"
                    : "4px solid",
                  borderLeftColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "action.selected"
                  },
                  transition: "all 0.2s ease"
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
                  {/* Icon */}
                  <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.isRead ? 400 : 600,
                        color: "text.primary",
                        mb: 0.5,
                        wordBreak: "break-word"
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </Box>

                  {/* Read indicator */}
                  <Box sx={{ flexShrink: 0 }}>
                    {notification.isRead ? (
                      <CheckIcon sx={{ fontSize: 16, color: "success.main" }} />
                    ) : (
                      <UnreadIcon sx={{ fontSize: 12, color: "primary.main" }} />
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;
