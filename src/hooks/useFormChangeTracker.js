import { useState, useCallback, useEffect } from "react";
import { compareValues } from "../helpers/fieldHelpers";

/**
 * Custom hook for tracking form changes against original data
 * Centralizes form change tracking logic used across multiple components
 * 
 * @param {Object} config - Configuration object
 * @param {Object} config.originalFormData - Original form data to compare against
 * @param {boolean} config.useLocalChanges - Whether to use localChanges array (true) or editedFields array (false)
 * @param {Object} config.formData - External formData state (optional, if not provided, hook manages its own)
 * @param {Function} config.setFormData - External setFormData function (optional)
 * @param {Array} config.localChanges - External localChanges state (optional)
 * @param {Function} config.setLocalChanges - External setLocalChanges function (optional)
 * @param {Array} config.editedFields - External editedFields state (optional)
 * @param {Function} config.setEditedFields - External setEditedFields function (optional)
 * @param {Function} config.compareValues - Custom compare function (optional)
 * @returns {Object} Form data, change tracking state, and handlers
 */
export const useFormChangeTracker = ({
  originalFormData = null,
  useLocalChanges = true,
  formData: externalFormData = null,
  setFormData: externalSetFormData = null,
  localChanges: externalLocalChanges = null,
  setLocalChanges: externalSetLocalChanges = null,
  editedFields: externalEditedFields = null,
  setEditedFields: externalSetEditedFields = null,
  compareValues: customCompareValues = null,
} = {}) => {
  // Use external state if provided, otherwise manage internally
  const [internalFormData, setInternalFormData] = useState({});
  const [internalLocalChanges, setInternalLocalChanges] = useState([]);
  const [internalEditedFields, setInternalEditedFields] = useState([]);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const formData = externalFormData !== null ? externalFormData : internalFormData;
  const setFormData = externalSetFormData || setInternalFormData;
  const localChanges = externalLocalChanges !== null ? externalLocalChanges : internalLocalChanges;
  const setLocalChanges = externalSetLocalChanges || setInternalLocalChanges;
  const editedFields = externalEditedFields !== null ? externalEditedFields : internalEditedFields;
  const setEditedFields = externalSetEditedFields || setInternalEditedFields;
  
  const compareFn = customCompareValues || compareValues;

  /**
   * Handle form field change
   * @param {Event} event - Input change event
   */
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      if (originalFormData) {
        const isActualChange = compareFn(newData[name], originalFormData[name]);
        
        if (useLocalChanges) {
          setLocalChanges((prevChanges) => {
            if (isActualChange && !prevChanges.includes(name)) {
              return [...prevChanges, name];
            } else if (!isActualChange && prevChanges.includes(name)) {
              return prevChanges.filter((field) => field !== name);
            }
            return prevChanges;
          });
        } else {
          // Update editedFields by comparing all fields
          const changes = Object.keys(newData).filter((key) =>
            compareFn(newData[key], originalFormData[key])
          );
          setEditedFields(changes);
        }
        
        setHasLocalChanges(isActualChange || Object.keys(newData).some(key => 
          compareFn(newData[key], originalFormData[key])
        ));
      }
      
      return newData;
    });
  }, [originalFormData, useLocalChanges, setFormData, setLocalChanges, setEditedFields, setHasLocalChanges, compareFn]);

  /**
   * Handle rich text editor change
   * @param {string} content - Editor content
   * @param {string} fieldName - Field name being edited
   */
  const handleEditorChange = useCallback((content, fieldName) => {
    if (!hasLocalChanges) {
      setHasLocalChanges(true);
    }
    
    setFormData((prev) => {
      const newData = { ...prev, [fieldName]: content };
      
      if (originalFormData) {
        if (useLocalChanges) {
          const isActualChange = compareFn(newData[fieldName], originalFormData[fieldName]);
          setLocalChanges((prevChanges) => {
            if (isActualChange && !prevChanges.includes(fieldName)) {
              return [...prevChanges, fieldName];
            } else if (!isActualChange && prevChanges.includes(fieldName)) {
              return prevChanges.filter((field) => field !== fieldName);
            }
            return prevChanges;
          });
        } else {
          const changes = Object.keys(newData).filter((key) =>
            compareFn(newData[key], originalFormData[key])
          );
          setEditedFields(changes);
        }
      }
      
      return newData;
    });
  }, [originalFormData, useLocalChanges, hasLocalChanges, setFormData, setLocalChanges, setEditedFields, setHasLocalChanges, compareFn]);

  /**
   * Reset form data and change tracking
   */
  const resetForm = useCallback((newFormData = {}) => {
    setFormData(newFormData);
    setLocalChanges([]);
    setEditedFields([]);
    setHasLocalChanges(false);
  }, []);

  /**
   * Update form data programmatically
   */
  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    setFormData,
    localChanges,
    setLocalChanges,
    editedFields,
    setEditedFields,
    hasLocalChanges,
    setHasLocalChanges,
    handleChange,
    handleEditorChange,
    resetForm,
    updateFormData,
  };
};

