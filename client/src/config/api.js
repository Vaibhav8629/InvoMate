// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_BASE_URL = API_URL;
export const API_ENDPOINTS = {
  AUTH: `${API_URL}/api/auth`,
  REPORTS: `${API_URL}/api/reports`,
  SIGNATURE: `${API_URL}/api/signature`,
  NOTIFICATIONS: `${API_URL}/api/notifications`,
};

// Helper function for API calls with credentials
export const fetchWithCredentials = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

export default API_BASE_URL;
