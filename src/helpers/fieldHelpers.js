/**
 * Field helper utilities
 * Contains reusable field manipulation and comparison functions
 */

export const fieldLabels = {
  name: "Senator Name",
  status: "Status",
  // ... other field labels
};

export const getFieldDisplayName = (field) => {
  // Field name formatting logic
  return fieldLabels[field] || field;
};

/**
 * Compares two values, handling string trimming for accurate comparison
 * @param {any} newVal - New value to compare
 * @param {any} oldVal - Old value to compare
 * @returns {boolean} - True if values are different, false if same
 */
export const compareValues = (newVal, oldVal) => {
  if (typeof newVal === "string" && typeof oldVal === "string") {
    return newVal.trim() !== oldVal.trim();
  }
  return newVal !== oldVal;
};

/**
 * Sanitizes a string to be used as a key by replacing special characters with underscores
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeKey = (str) => {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};
