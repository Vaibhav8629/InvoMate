import { API_ENDPOINTS } from "../config/api";

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await readJson(response);
  return { response, data };
};

export const confirmPasswordReset = async ({ token, password, confirmPassword }) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/reset-password/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password, confirmPassword }),
  });

  const data = await readJson(response);
  return { response, data };
};