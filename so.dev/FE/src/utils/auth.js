/**
 * Authentication utility functions
 * Using sessionStorage for tab-specific logins while maintaining backward compatibility
 */

// Store token in both storages to ensure backward compatibility
export const setToken = (token) => {
  sessionStorage.setItem("token", token);
  localStorage.setItem("token", token); // Keep for backward compatibility
};

// Get token from sessionStorage first, fall back to localStorage for backward compatibility
export const getToken = () => {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
};

// Remove token from both storages
export const removeToken = () => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!getToken();
};

// Set user ID in both storages
export const setUserId = (userId) => {
  sessionStorage.setItem("userId", userId);
  localStorage.setItem("userId", userId);
};

// Get user ID from sessionStorage first, fall back to localStorage
export const getUserId = () => {
  return sessionStorage.getItem("userId") || localStorage.getItem("userId");
};
