// API utility functions with credentials enabled for cookie-based auth

export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  return response;
};

export const apiGet = async (url) => {
  return apiRequest(url, { method: 'GET' });
};

export const apiPost = async (url, body) => {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const apiPut = async (url, body) => {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const apiDelete = async (url) => {
  return apiRequest(url, { method: 'DELETE' });
};
