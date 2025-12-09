import { useState, useEffect, useCallback, useRef } from "react";
import { useSnackbar } from "./useSnackbar";

/**
 * Custom hook for fetching entity data
 * Centralizes data fetching logic used across multiple components
 * 
 * @param {Object} config - Configuration object
 * @param {Function} config.dispatch - Redux dispatch function
 * @param {string|number} config.id - Entity ID (optional, for edit mode)
 * @param {Function} config.getAllTerms - Action to fetch all terms
 * @param {Function} config.getEntityById - Action to fetch entity by ID (optional)
 * @param {Function} config.clearEntityState - Action to clear entity state (optional)
 * @param {Function} config.getAdditionalData - Additional data fetching function (optional)
 * @param {Array} config.additionalActions - Array of additional actions to dispatch (optional)
 * @param {boolean} config.skipIfNoId - Skip fetching if no ID provided (default: false)
 * @returns {Object} Data fetching state and utilities
 */
export const useEntityData = ({
  dispatch,
  id = null,
  getAllTerms,
  getEntityById = null,
  clearEntityState = null,
  getAdditionalData = null,
  additionalActions = [],
  skipIfNoId = false,
}) => {
  const [isDataFetching, setIsDataFetching] = useState(true);
  const { showSnackbar } = useSnackbar();
  // Use ref to store latest additionalActions to avoid dependency issues
  const additionalActionsRef = useRef(additionalActions);
  useEffect(() => {
    additionalActionsRef.current = additionalActions;
  }, [additionalActions]);

  const fetchData = useCallback(async () => {
    // Skip if no ID and skipIfNoId is true
    if (!id && skipIfNoId) {
      setIsDataFetching(false);
      return;
    }

    setIsDataFetching(true);
    try {
      // Helper to safely unwrap promises
      const safeDispatch = async (actionCreator, ...args) => {
        const result = typeof actionCreator === 'function' 
          ? dispatch(actionCreator(...args))
          : dispatch(actionCreator);
        // Check if result has unwrap method (Redux Toolkit thunks)
        return result?.unwrap ? result.unwrap() : result;
      };

      // Always fetch terms if provided (unless skipIfNoId and no id)
      if (getAllTerms && !(skipIfNoId && !id)) {
        await safeDispatch(getAllTerms);
      }

      // Fetch entity by ID if provided
      if (id && getEntityById) {
        // If we have getAdditionalData, fetch both concurrently
        if (getAdditionalData) {
          await Promise.all([
            safeDispatch(getEntityById, id),
            safeDispatch(getAdditionalData, id),
          ]);
        } else {
          await safeDispatch(getEntityById, id);
        }
      } else if (id && getAdditionalData) {
        // If ID provided but no getEntityById, try getAdditionalData
        await safeDispatch(getAdditionalData, id);
      }

      // Fetch additional actions if provided (always, regardless of ID, unless skipIfNoId)
      const currentActions = additionalActionsRef.current;
      if (currentActions.length > 0 && !(skipIfNoId && !id)) {
        await Promise.all(
          currentActions.map((actionCreator) => safeDispatch(actionCreator))
        );
      }

      // Fetch additional data if provided (without ID)
      if (getAdditionalData && !id && !skipIfNoId) {
        await safeDispatch(getAdditionalData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Error loading data. Please try again.", "error");
    } finally {
      setIsDataFetching(false);
    }
  }, [
    dispatch,
    id,
    getAllTerms,
    getEntityById,
    getAdditionalData,
    skipIfNoId,
    showSnackbar,
    // additionalActions is handled via ref to avoid dependency issues
  ]);

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (clearEntityState) {
        dispatch(clearEntityState());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id, fetchData is stable with useCallback

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    isDataFetching,
    setIsDataFetching,
    refetch,
  };
};

