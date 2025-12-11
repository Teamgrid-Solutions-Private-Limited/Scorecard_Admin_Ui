/**
 * Centralized validation helpers
 * Contains all reusable validation functions used across the application
 */

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "Email is required" };
  }
  
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Invalid email address" };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validates full name
 * @param {string} fullName - Full name to validate
 * @param {number} minLength - Minimum length (default: 3)
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateFullName = (fullName, minLength = 3) => {
  if (!fullName || fullName.trim().length < minLength) {
    return {
      isValid: false,
      message: `Full name is required (min ${minLength} characters)`,
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates password
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default: 8)
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password, minLength = 8) => {
  if (!password || password.trim() === "") {
    return { isValid: false, message: "Password is required" };
  }
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters`,
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return { isValid: false, message: "Please confirm your password" };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates user role
 * @param {string} role - Role to validate
 * @param {Array<string>} allowedRoles - Allowed roles (default: ["admin", "editor", "contributor"])
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateRole = (
  role,
  allowedRoles = ["admin", "editor", "contributor"]
) => {
  if (!role || !allowedRoles.includes(role)) {
    return { isValid: false, message: "Role is required" };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates user form data
 * @param {Object} formData - Form data object
 * @param {Object} options - Validation options
 * @param {boolean} options.includePassword - Whether to validate password (default: true)
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateUserForm = (formData, options = {}) => {
  const { includePassword = true } = options;
  const errors = {};

  // Validate full name
  const nameValidation = validateFullName(formData.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.message;
  }

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }

  // Validate password if included
  if (includePassword) {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    // Validate password confirmation
    const confirmPasswordValidation = validatePasswordConfirmation(
      formData.password,
      formData.confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      errors.confirmPassword = confirmPasswordValidation.message;
    }
  }

  // Validate role
  const roleValidation = validateRole(formData.role);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates that at least one term is selected
 * @param {Array} termData - Array of term objects
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateHasSelectedTerms = (termData) => {
  const hasSelectedTerms = termData.some(
    (term) => term.termId && term.termId.toString().trim() !== ""
  );

  if (!hasSelectedTerms) {
    return {
      isValid: false,
      message: "Please select at least one term before saving.",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates that there are no duplicate terms
 * @param {Array} termData - Array of term objects
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateNoDuplicateTerms = (termData) => {
  const termIdCounts = termData
    .map((t) => t.termId)
    .filter(Boolean)
    .reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

  const hasDuplicates = Object.values(termIdCounts).some((count) => count > 1);

  if (hasDuplicates) {
    return {
      isValid: false,
      message: "Duplicate term selected. Each term can only be added once.",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates that only one term is marked as current
 * @param {Array} termData - Array of term objects
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateSingleCurrentTerm = (termData) => {
  const currentTerms = termData.filter((term) => term.currentTerm);

  if (currentTerms.length > 1) {
    return {
      isValid: false,
      message: "Only one term can be marked as current term.",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates term data (combines all term validations)
 * @param {Array} termData - Array of term objects
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateTermData = (termData) => {
  // Check for selected terms
  const hasTermsValidation = validateHasSelectedTerms(termData);
  if (!hasTermsValidation.isValid) {
    return hasTermsValidation;
  }

  // Check for duplicates
  const noDuplicatesValidation = validateNoDuplicateTerms(termData);
  if (!noDuplicatesValidation.isValid) {
    return noDuplicatesValidation;
  }

  // Check for single current term
  const singleCurrentValidation = validateSingleCurrentTerm(termData);
  if (!singleCurrentValidation.isValid) {
    return singleCurrentValidation;
  }

  return { isValid: true, message: "" };
};

/**
 * Validates that a vote is within a term's date and congress range
 * @param {string} voteId - Vote ID
 * @param {string} termId - Term ID
 * @param {Array} allVotes - Array of all votes
 * @param {Array} terms - Array of all terms
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateVoteInTermRange = (voteId, termId, allVotes, terms) => {
  if (!voteId || !termId) {
    return { isValid: false, message: "Invalid selection" };
  }

  const vote = allVotes.find((v) => v._id === voteId);
  const term = terms.find((t) => t._id === termId);

  if (!vote) {
    return { isValid: false, message: "Vote not found" };
  }
  if (!term) {
    return { isValid: false, message: "Term not found" };
  }

  const voteDate = new Date(vote.date);
  const termStart = new Date(`${term.startYear}-01-03`);
  const termEnd = new Date(`${term.endYear}-01-02`);

  const isDateInRange = voteDate >= termStart && voteDate <= termEnd;
  const isCongressInTerm = term.congresses.includes(Number(vote.congress));

  if (!isDateInRange) {
    return {
      isValid: false,
      message: `Selected vote is outside the term range (${term.startYear}-${term.endYear})`,
    };
  }

  if (!isCongressInTerm) {
    return {
      isValid: false,
      message: `This vote (Congress ${
        vote.congress
      }) is not part of the selected term's congresses (${term.congresses.join(
        ", "
      )})`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates that an activity is within a term's date and congress range
 * @param {string} activityId - Activity ID
 * @param {string} termId - Term ID
 * @param {Array} allActivities - Array of all activities
 * @param {Array} terms - Array of all terms
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateActivityInTermRange = (
  activityId,
  termId,
  allActivities,
  terms
) => {
  if (!activityId || !termId) {
    return { isValid: false, message: "Invalid selection" };
  }

  const activity = allActivities.find((a) => a._id === activityId);
  const term = terms.find((t) => t._id === termId);

  if (!activity) {
    return { isValid: false, message: "Activity not found" };
  }
  if (!term) {
    return { isValid: false, message: "Term not found" };
  }

  const activityDate = new Date(activity.date);
  const termStart = new Date(`${term.startYear}-01-03`);
  const termEnd = new Date(`${term.endYear}-01-02`);

  const isDateInRange = activityDate >= termStart && activityDate <= termEnd;
  const isCongressInTerm = term.congresses.includes(
    Number(activity.congress || 0)
  );

  if (!isDateInRange) {
    return {
      isValid: false,
      message: `Selected activity is outside the term range (${term.startYear}-${term.endYear})`,
    };
  }

  if (!isCongressInTerm) {
    return {
      isValid: false,
      message: `This activity (Congress ${
        activity.congress
      }) is not part of the selected term's congresses (${term.congresses.join(
        ", "
      )})`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateRequired = (value, fieldName = "Field") => {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, message: `${fieldName} is required!` };
  }
  if (typeof value === "string" && value.trim() === "") {
    return { isValid: false, message: `${fieldName} is required!` };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates string length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateStringLength = (value, minLength, maxLength, fieldName = "Field") => {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  const str = String(value).trim();
  
  if (minLength !== undefined && str.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (maxLength !== undefined && str.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be no more than ${maxLength} characters` };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether URL is required (default: false)
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateURL = (url, required = false) => {
  if (!url || url.trim() === "") {
    if (required) {
      return { isValid: false, message: "URL is required" };
    }
    return { isValid: true, message: "" };
  }
  
  try {
    new URL(url);
    return { isValid: true, message: "" };
  } catch {
    return { isValid: false, message: "Invalid URL format" };
  }
};

/**
 * Validates date
 * @param {string|Date} date - Date to validate
 * @param {boolean} required - Whether date is required (default: false)
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateDate = (date, required = false) => {
  if (!date) {
    if (required) {
      return { isValid: false, message: "Date is required" };
    }
    return { isValid: true, message: "" };
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: "Invalid date format" };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validates number
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether number is required (default: false)
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {string} options.fieldName - Name of the field (for error message)
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateNumber = (value, options = {}) => {
  const { required = false, min, max, fieldName = "Field" } = options;
  
  if (value === null || value === undefined || value === "") {
    if (required) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    return { isValid: true, message: "" };
  }
  
  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, message: `${fieldName} must be no more than ${max}` };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validates form data against a schema
 * @param {Object} formData - Form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} - { isValid: boolean, errors: Object }
 * 
 * @example
 * const schema = {
 *   email: (value) => validateEmail(value),
 *   name: (value) => validateRequired(value, "Name"),
 *   age: (value) => validateNumber(value, { min: 18, max: 100, fieldName: "Age" })
 * };
 * const result = validateForm(formData, schema);
 */
export const validateForm = (formData, schema) => {
  const errors = {};
  
  for (const [field, validator] of Object.entries(schema)) {
    const value = formData[field];
    const result = validator(value);
    
    if (!result.isValid) {
      errors[field] = result.message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};