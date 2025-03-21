/**
 * Authentication utility functions
 * Using sessionStorage instead of localStorage to allow multiple logins in different tabs
 */

// Store token in sessionStorage (tab-specific) instead of localStorage (browser-wide)
export const setToken = (token) => {
  sessionStorage.setItem("token", token);
};

// Get token from sessionStorage
export const getToken = () => {
  return sessionStorage.getItem("token");
};

// Remove token from sessionStorage
export const removeToken = () => {
  sessionStorage.removeItem("token");
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!getToken();
};

// Get user ID from token (if you need to store user ID separately)
export const setUserId = (userId) => {
  sessionStorage.setItem("userId", userId);
};

// Get user ID
export const getUserId = () => {
  return sessionStorage.getItem("userId");
};
