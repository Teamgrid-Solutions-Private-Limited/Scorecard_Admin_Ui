/**
 * LocalStorage Abstraction
 * Provides a centralized, type-safe interface for localStorage operations
 * with error handling and JSON serialization support
 */

/**
 * Storage keys used throughout the application
 * Centralized to prevent typos and ensure consistency
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  ROLE: 'role',
  PAGINATION_REPRESENTATIVE: 'dataGridPagination_representative',
  PAGINATION_SENATOR: 'dataGridPagination_senator',
  PAGINATION_ACTIVITIES: 'dataGridPagination_activities',
  PAGINATION_BILLS: 'dataGridPagination_bills',
};

/**
 * Get an item from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - The stored value or defaultValue
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    // Try to parse as JSON, fallback to raw string
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    console.error(`Error getting item from localStorage (key: ${key}):`, error);
    return defaultValue;
  }
};

/**
 * Set an item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified if not a string)
 * @returns {boolean} - True if successful, false otherwise
 */
export const setItem = (key, value) => {
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error setting item in localStorage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - True if successful, false otherwise
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item from localStorage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Clear all items from localStorage
 * @returns {boolean} - True if successful, false otherwise
 */
export const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Check if a key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - True if key exists, false otherwise
 */
export const hasItem = (key) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking item in localStorage (key: ${key}):`, error);
    return false;
  }
};

/**
 * Get all keys from localStorage
 * @returns {string[]} - Array of all keys
 */
export const getAllKeys = () => {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error('Error getting all keys from localStorage:', error);
    return [];
  }
};

/**
 * Clear pagination storage for all data grids
 */
export const clearPaginationStorage = () => {
  removeItem(STORAGE_KEYS.PAGINATION_REPRESENTATIVE);
  removeItem(STORAGE_KEYS.PAGINATION_SENATOR);
  removeItem(STORAGE_KEYS.PAGINATION_ACTIVITIES);
  removeItem(STORAGE_KEYS.PAGINATION_BILLS);
};

/**
 * Clear authentication-related storage
 */
export const clearAuthStorage = () => {
  removeItem(STORAGE_KEYS.TOKEN);
  removeItem(STORAGE_KEYS.USER);
  removeItem(STORAGE_KEYS.ROLE);
};

