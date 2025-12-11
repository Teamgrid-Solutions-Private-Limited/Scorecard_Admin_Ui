/**
 * Centralized error handling utility
 * Provides a consistent way to extract error messages from various error formats
 * 
 * @param {Error|Object|string} error - The error object, which can be:
 *   - An axios error (error.response.data.message)
 *   - A Redux Toolkit rejected action (error.payload.message)
 *   - A standard Error object (error.message)
 *   - A plain object with message property (error.message or error.data.message)
 *   - A string
 * @param {string} defaultMessage - Fallback message if no error message can be extracted
 * @returns {string} - The extracted error message or default message
 * 
 * @example
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   const message = getErrorMessage(error, "Operation failed");
 *   setSnackbarMessage(message);
 * }
 */
export const getErrorMessage = (error, defaultMessage = "An unexpected error occurred") => {
  // Handle null/undefined
  if (!error) {
    return defaultMessage;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle Redux Toolkit rejected actions (error.payload.message)
  if (error.payload?.message) {
    return error.payload.message;
  }

  // Handle Redux Toolkit rejected actions where payload is the message object
  if (error.payload) {
    if (typeof error.payload === "string") {
      return error.payload;
    }
    if (typeof error.payload === "object") {
      // Check for message property
      if (error.payload.message) {
        return error.payload.message;
      }
      // Check for common error message properties
      if (error.payload.error) {
        return error.payload.error;
      }
      if (error.payload.msg) {
        return error.payload.msg;
      }
    }
  }

  // Handle axios errors (error.response.data.message)
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle axios errors where data is the message object directly
  if (error.response?.data && typeof error.response.data === "object") {
    // Check for common error message properties
    if (error.response.data.error) {
      return error.response.data.error;
    }
    if (error.response.data.msg) {
      return error.response.data.msg;
    }
  }

  // Handle standard Error objects and objects with message property
  if (error.message) {
    return error.message;
  }

  // Handle error.data.message (alternative structure)
  if (error.data?.message) {
    return error.data.message;
  }

  // Handle HTTP status codes with default messages
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return "Bad Request: Please check your input data";
      case 401:
        return "Unauthorized: Please log in again";
      case 403:
        return "Forbidden: You don't have permission to perform this action";
      case 404:
        return "Resource not found";
      case 409:
        return "Conflict: This resource already exists";
      case 422:
        return "Validation error: Please check your input";
      case 500:
        return "Server Error: Please try again later";
      case 503:
        return "Service Unavailable: Please try again later";
      default:
        return defaultMessage;
    }
  }

  // Handle network errors
  if (error.request && !error.response) {
    return "Network Error: Please check your internet connection";
  }

  // Fallback to default message
  return defaultMessage;
};

/**
 * Extract error message and additional error details
 * 
 * @param {Error|Object|string} error - The error object
 * @param {string} defaultMessage - Fallback message
 * @returns {Object} - Object containing message and additional error info
 */
export const getErrorDetails = (error, defaultMessage = "An unexpected error occurred") => {
  const message = getErrorMessage(error, defaultMessage);
  
  return {
    message,
    status: error?.response?.status || null,
    statusText: error?.response?.statusText || null,
    code: error?.code || null,
    isNetworkError: !!(error?.request && !error?.response),
  };
};

