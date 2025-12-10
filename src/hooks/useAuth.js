import { useMemo, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

/**
 * Custom hook for managing authentication state
 * Centralizes token decoding and user role access
 * 
 * @returns {Object} Authentication state and user information
 */
export const useAuth = () => {
  const authData = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return {
          token: null,
          decodedToken: null,
          userRole: null,
          userId: null,
          isAuthenticated: false,
        };
      }

      const decodedToken = jwtDecode(token);
      const userRole = decodedToken?.role || null;
      const userId = decodedToken?.userId || null;
      const userName = localStorage.getItem("user") || "Unknown User";

      return {
        token,
        decodedToken,
        userRole,
        userId,
        userName,
        isAuthenticated: true,
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return {
        token: null,
        decodedToken: null,
        userRole: null,
        userId: null,
        isAuthenticated: false,
      };
    }
  }, []);

  /**
   * Get current editor object for tracking edits
   * @returns {Object} Editor information object
   */
  const getCurrentEditor = useCallback(() => {
    return {
      editorId: authData.userId,
      editorName: authData.userName,
      editedAt: new Date().toISOString(),
    };
  }, [authData.userId, authData.userName]);

  return {
    ...authData,
    getCurrentEditor,
  };
};

