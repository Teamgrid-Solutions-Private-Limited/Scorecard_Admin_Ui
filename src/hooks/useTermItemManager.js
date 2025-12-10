import { useCallback } from "react";
import { compareValues } from "../helpers/fieldHelpers";

/**
 * Custom hook for managing term items (votes, activities, pastVotes)
 * Centralizes add, remove, and change handlers for term items
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.type - Type of item ('vote', 'activity', 'pastVote')
 * @param {string} config.dataPath - Path to the array in term data (e.g., 'votesScore', 'activitiesScore')
 * @param {string} config.idField - Field name for the ID (e.g., 'voteId', 'activityId')
 * @param {string} config.fieldKeyPrefix - Prefix for field keys (e.g., 'ScoredVote', 'TrackedActivity')
 * @param {Array} config.allItems - Array of all available items (allVotes, allActivities)
 * @param {string} config.removedItemsKey - Key in removedItems state (e.g., 'votes', 'activities')
 * @param {Array} config.termData - Current term data array
 * @param {Function} config.setTermData - Function to update term data
 * @param {Array} config.originalTermData - Original term data for comparison
 * @param {Array} config.localChanges - Array of local changes
 * @param {Function} config.setLocalChanges - Function to update local changes
 * @param {Object} config.formData - Form data object
 * @param {Function} config.setFormData - Function to update form data
 * @param {Object} config.removedItems - Removed items tracking object
 * @param {Function} config.setRemovedItems - Function to update removed items
 * @param {Function} config.validateInTermRange - Validation function (optional)
 * @param {Function} config.setSelectionError - Function to set selection errors (optional)
 * @param {Function} config.getCurrentEditor - Function to get current editor object (optional)
 * @returns {Object} Handlers for add, remove, and change operations
 */
export const useTermItemManager = (config) => {
  const {
    type,
    dataPath,
    idField,
    fieldKeyPrefix,
    allItems,
    removedItemsKey,
    termData,
    setTermData,
    originalTermData,
    localChanges,
    setLocalChanges,
    formData,
    setFormData,
    removedItems,
    setRemovedItems,
    validateInTermRange = null,
    setSelectionError = null,
    getCurrentEditor = null,
  } = config;

  /**
   * Add a new item to a term
   * @param {number} termIndex - Index of the term
   */
  const handleAdd = useCallback((termIndex) => {
    setTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              [dataPath]: [
                ...(term[dataPath] || []),
                { [idField]: "", score: "" },
              ],
            }
          : term
      )
    );
  }, [setTermData, dataPath, idField]);

  /**
   * Remove an item from a term
   * @param {number} termIndex - Index of the term
   * @param {number} itemIndex - Index of the item to remove
   */
  const handleRemove = useCallback((termIndex, itemIndex) => {
    const itemToRemove = termData[termIndex]?.[dataPath]?.[itemIndex];
    if (!itemToRemove) return;

    const removedFieldKey = `term${termIndex}_${fieldKeyPrefix}_${itemIndex + 1}_removed`;
    const addedFieldKey = `term${termIndex}_${fieldKeyPrefix}_${itemIndex + 1}`;

    // Check if this was a newly added empty item
    const isNewEmptyItem = !itemToRemove?.[idField] && 
                          (!itemToRemove?.score || itemToRemove.score === "");

    // Check original data to see if this item existed in the database
    const originalTerm = originalTermData[termIndex] || {};
    const originalItems = originalTerm[dataPath] || [];
    const originalItemAtIndex = originalItems[itemIndex];
    const existedInOriginal = originalItemAtIndex && 
                             (originalItemAtIndex[idField] || originalItemAtIndex.score);

    // If the item has an ID and is being removed, track it (only if it existed in original)
    if (itemToRemove?.[idField] && 
        itemToRemove[idField].toString().trim() !== "" && 
        existedInOriginal) {
      const item = allItems.find((i) => i._id === itemToRemove[idField]);
      if (item) {
        setRemovedItems((prev) => ({
          ...prev,
          [removedItemsKey]: [
            ...(prev[removedItemsKey] || []),
            {
              termIndex,
              itemIndex: itemIndex,
              [idField]: itemToRemove[idField],
              title: item.title,
              fieldKey: removedFieldKey,
            },
          ],
        }));

        // Use getCurrentEditor if provided, otherwise create default
        const currentEditor = getCurrentEditor ? getCurrentEditor() : {
          editorId: null,
          editorName: "Unknown Editor",
          editedAt: new Date().toISOString(),
        };

        setFormData((prev) => ({
          ...prev,
          fieldEditors: {
            ...prev.fieldEditors,
            [removedFieldKey]: currentEditor,
          },
        }));
      }
    }

    // Update localChanges
    setLocalChanges((prev) => {
      let cleanedChanges;

      if (isNewEmptyItem && !existedInOriginal) {
        // If it's a newly added empty item that didn't exist in original, 
        // completely remove both addition and removal markers
        cleanedChanges = prev.filter(
          (change) => change !== addedFieldKey && change !== removedFieldKey
        );
      } else if (existedInOriginal) {
        // For items that existed in original data, clean up the addition marker and add removal marker
        cleanedChanges = prev.filter((change) => change !== addedFieldKey);
        // Only add removal marker if it's not already there
        if (!cleanedChanges.includes(removedFieldKey)) {
          cleanedChanges = [...cleanedChanges, removedFieldKey];
        }
      } else {
        // For other cases, just clean up the addition marker
        cleanedChanges = prev.filter((change) => change !== addedFieldKey);
      }

      return cleanedChanges;
    });

    // Remove the item from the data
    setTermData((prev) => {
      return prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              [dataPath]: term[dataPath].filter((_, i) => i !== itemIndex),
            }
          : term
      );
    });
  }, [
    termData,
    dataPath,
    idField,
    fieldKeyPrefix,
    originalTermData,
    allItems,
    removedItemsKey,
    setTermData,
    setLocalChanges,
    setFormData,
    setRemovedItems,
  ]);

  /**
   * Handle change to an item field
   * @param {number} termIndex - Index of the term
   * @param {number} itemIndex - Index of the item
   * @param {string} field - Field name being changed
   * @param {any} value - New value
   */
  const handleChange = useCallback((termIndex, itemIndex, field, value) => {
    const itemChangeId = `term${termIndex}_${fieldKeyPrefix}_${itemIndex + 1}`;

    // Validation (only for idField changes)
    if (field === idField && value && validateInTermRange) {
      const termId = termData[termIndex]?.termId;
      const validation = validateInTermRange(value, termId);

      if (!validation.isValid) {
        if (setSelectionError) {
          setSelectionError({
            show: true,
            message: validation.message,
            type: type,
          });
        }
        return;
      }
    }

    setTermData((prev) => {
      const newTerms = prev.map((term, index) => {
        if (index !== termIndex) return term;

        const newItems = (term[dataPath] || []).map((item, i) =>
          i === itemIndex ? { ...item, [field]: value } : item
        );

        return { ...term, [dataPath]: newItems };
      });

      const originalTerm = originalTermData[termIndex] || {};
      const originalItem = originalTerm[dataPath]?.[itemIndex] || {};
      const isActualChange = compareValues(value, originalItem[field]);

      if (isActualChange && !localChanges.includes(itemChangeId)) {
        setLocalChanges((prev) => [...prev, itemChangeId]);
      } else if (!isActualChange && localChanges.includes(itemChangeId)) {
        setLocalChanges((prev) => prev.filter((f) => f !== itemChangeId));
      }

      return newTerms;
    });
  }, [
    termData,
    dataPath,
    idField,
    fieldKeyPrefix,
    originalTermData,
    localChanges,
    setTermData,
    setLocalChanges,
    validateInTermRange,
    setSelectionError,
    type,
  ]);

  return {
    handleAdd,
    handleRemove,
    handleChange,
  };
};

