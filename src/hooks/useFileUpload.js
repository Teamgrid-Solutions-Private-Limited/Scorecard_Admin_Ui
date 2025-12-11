import { useCallback } from "react";

/**
 * Custom hook for handling file uploads
 * Centralizes file upload logic used across multiple components
 * 
 * @param {Function} setFormData - Function to update form data
 * @param {Function} setLocalChanges - Function to update local changes (optional)
 * @param {Function} setEditedFields - Function to update edited fields (optional)
 * @param {Object} originalFormData - Original form data for comparison (optional)
 * @param {string} fieldName - Field name for the file (default: "photo")
 * @returns {Object} File upload handler and utilities
 */
export const useFileUpload = ({
  setFormData,
  setLocalChanges = null,
  setEditedFields = null,
  originalFormData = null,
  fieldName = "photo",
}) => {
  /**
   * Handle file input change
   * @param {Event} event - File input change event
   */
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const displayFieldName = fieldName === "photo" ? "Photo" : fieldName;

    // Track changes if tracking functions provided
    if (setLocalChanges) {
      if (!setLocalChanges.toString().includes(displayFieldName)) {
        setLocalChanges((prev) => {
          if (!prev.includes(displayFieldName)) {
            return [...prev, displayFieldName];
          }
          return prev;
        });
      }
    }

    if (setEditedFields && originalFormData) {
      const changes = Object.keys({ ...originalFormData, [fieldName]: file.name }).filter(
        (key) => {
          if (key === fieldName) {
            return file.name !== (originalFormData[key]?.name || originalFormData[key]);
          }
          return false;
        }
      );
      if (changes.length > 0) {
        setEditedFields((prev) => {
          if (!prev.includes(fieldName)) {
            return [...prev, fieldName];
          }
          return prev;
        });
      }
    }

    // Update form data
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  }, [setFormData, setLocalChanges, setEditedFields, originalFormData, fieldName]);

  /**
   * Handle file upload with readMore field (for Activity/Vote components)
   * @param {Event} event - File input change event
   * @param {string} readMoreType - Type of readMore (file or url)
   */
  const handleReadMoreFileUpload = useCallback((event, readMoreType = "file") => {
    const file = event.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      readMore: readMoreType === "file" ? file.name : prev.readMore,
    }));

    if (setEditedFields && originalFormData) {
      const changes = Object.keys({ ...originalFormData, readMore: file.name }).filter(
        (key) => {
          if (key === "readMore") {
            return file.name !== originalFormData.readMore;
          }
          return false;
        }
      );
      if (changes.length > 0) {
        setEditedFields((prev) => {
          if (!prev.includes("readMore")) {
            return [...prev, "readMore"];
          }
          return prev;
        });
      }
    }
  }, [setFormData, setEditedFields, originalFormData]);

  return {
    handleFileChange,
    handleReadMoreFileUpload,
  };
};

