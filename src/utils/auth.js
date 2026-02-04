/**
 * Authentication Utility
 * Provides centralized authentication-related functions
 * for token management, user info, and role checking
 */

import { jwtDecode } from 'jwt-decode';
import { getItem, setItem, removeItem, STORAGE_KEYS, clearAuthStorage } from './storage';

/**
 * Get the authentication token from storage
 * @returns {string|null} - The token or null if not found
 */
export const getToken = () => {
  return getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Set the authentication token in storage
 * @param {string} token - The JWT token
 * @returns {boolean} - True if successful
 */
export const setToken = (token) => {
  return setItem(STORAGE_KEYS.TOKEN, token);
};

/**
 * Remove the authentication token from storage
 * @returns {boolean} - True if successful
 */
export const removeToken = () => {
  return removeItem(STORAGE_KEYS.TOKEN);
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists and is valid
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      removeToken();
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    removeToken();
    return false;
  }
};

/**
 * Get decoded token payload
 * @returns {Object|null} - Decoded token or null if invalid
 */
export const getDecodedToken = () => {
  const token = getToken();
  if (!token) {
    return null;
  }
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user role from token
 * @returns {string|null} - User role or null if not found
 */
export const getUserRole = () => {
  const decoded = getDecodedToken();
  return decoded?.role || null;
};

/**
 * Get user ID from token
 * @returns {string|null} - User ID or null if not found
 */
export const getUserId = () => {
  const decoded = getDecodedToken();
  return decoded?.userId || decoded?.id || null;
};

/**
 * Check if user has a specific role
 * @param {string|string[]} role - Role(s) to check
 * @returns {boolean} - True if user has the role
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  if (!userRole) {
    return false;
  }
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
};

/**
 * Check if user is admin
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = () => {
  return hasRole('admin');
};

/**
 * Check if user is editor
 * @returns {boolean} - True if user is editor
 */
export const isEditor = () => {
  return hasRole('editor');
};

/**
 * Check if user is contributor
 * @returns {boolean} - True if user is contributor
 */
export const isContributor = () => {
  return hasRole('contributor');
};

/**
 * Get user info from storage
 * @returns {string|null} - User info or null if not found
 */
export const getUser = () => {
  return getItem(STORAGE_KEYS.USER);
};

/**
 * Set user info in storage
 * @param {string|Object} user - User info to store
 * @returns {boolean} - True if successful
 */
export const setUser = (user) => {
  return setItem(STORAGE_KEYS.USER, user);
};

/**
 * Get role from storage (legacy support)
 * @returns {string|null} - Role or null if not found
 */
export const getRole = () => {
  // Try to get from token first (preferred)
  const role = getUserRole();
  if (role) {
    return role;
  }
  // Fallback to storage
  return getItem(STORAGE_KEYS.ROLE);
};

/**
 * Set role in storage (legacy support)
 * @param {string} role - Role to store
 * @returns {boolean} - True if successful
 */
export const setRole = (role) => {
  return setItem(STORAGE_KEYS.ROLE, role);
};

/**
 * Get editor info for tracking edits
 * @returns {Object} - Editor info object
 */
export const getEditorInfo = () => {
  const userId = getUserId();
  const user = getUser();
  
  return {
    editorId: userId,
    editorName: typeof user === 'string' ? user : user?.fullName || 'Unknown Editor',
    editedAt: new Date(),
  };
};

/**
 * Logout user - clears all auth-related storage
 * @returns {boolean} - True if successful
 */
export const logout = () => {
  clearAuthStorage();
  return true;
};

/**
 * Check if token is expired
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) {
    return true;
  }
  
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp) {
      return decoded.exp * 1000 < Date.now();
    }
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};
export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const clearRefreshToken = () => {
  localStorage.removeItem('refreshToken');
};
