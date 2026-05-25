const API_URL = `${import.meta.env.VITE_API_URL}/api/notifications`;

// Get all notifications
export const getNotifications = async (limit = 20) => {
  try {
    const response = await fetch(`${API_URL}?limit=${limit}`, {
      method: "GET",
      credentials: 'include', // Enable cookies
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`${API_URL}/${notificationId}/read`, {
      method: "PATCH",
      credentials: 'include', // Enable cookies
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(`${API_URL}/mark-all-read`, {
      method: "PATCH",
      credentials: 'include', // Enable cookies
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await fetch(`${API_URL}/unread-count`, {
      method: "GET",
      credentials: 'include', // Enable cookies
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch unread count");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/clear-all`, {
      method: "DELETE",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error("Failed to clear notifications");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw error;
  }
};
