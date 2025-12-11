import { useState, useCallback } from "react";

/**
 * Custom hook for managing snackbar state and actions
 * Centralizes snackbar functionality used across multiple components
 * 
 * @returns {Object} Snackbar state and control functions
 */
export const useSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  /**
   * Show snackbar with message and severity
   * @param {string} msg - Message to display
   * @param {string} sev - Severity level (success, error, warning, info)
   */
  const showSnackbar = useCallback((msg, sev = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  /**
   * Hide snackbar
   * @param {Event} event - Event object
   * @param {string} reason - Reason for closing (clickaway, timeout, etc.)
   */
  const hideSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  }, []);

  /**
   * Reset snackbar state
   */
  const resetSnackbar = useCallback(() => {
    setOpen(false);
    setMessage("");
    setSeverity("success");
  }, []);

  return {
    open,
    message,
    severity,
    showSnackbar,
    hideSnackbar,
    resetSnackbar,
    // Legacy compatibility aliases
    openSnackbar: open,
    snackbarMessage: message,
    snackbarSeverity: severity,
    setOpenSnackbar: setOpen,
    setSnackbarMessage: setMessage,
    setSnackbarSeverity: setSeverity,
    handleSnackbarOpen: showSnackbar,
    handleSnackbarClose: hideSnackbar,
  };
};

