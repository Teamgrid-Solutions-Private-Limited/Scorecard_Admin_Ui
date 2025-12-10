# Utility Abstractions

This directory contains centralized utility abstractions to replace direct usage of browser APIs and improve code maintainability.

## Available Utilities

### 1. Storage (`storage.js`)

Centralized localStorage abstraction with error handling and JSON serialization.

**Usage:**
```javascript
import { getItem, setItem, removeItem, STORAGE_KEYS, clearPaginationStorage } from '../utils/storage';

// Get item
const token = getItem(STORAGE_KEYS.TOKEN);

// Set item
setItem(STORAGE_KEYS.USER, userData);

// Remove item
removeItem(STORAGE_KEYS.TOKEN);

// Clear pagination storage
clearPaginationStorage();
```

**Benefits:**
- Type-safe storage keys
- Automatic JSON serialization/deserialization
- Error handling
- Consistent API across the application

### 2. Auth (`auth.js`)

Authentication utility for token management, user info, and role checking.

**Usage:**
```javascript
import { 
  getToken, 
  setToken, 
  isAuthenticated, 
  getUserRole, 
  getUserId, 
  hasRole, 
  isAdmin,
  getEditorInfo,
  logout 
} from '../utils/auth';

// Check authentication
if (isAuthenticated()) {
  // User is logged in
}

// Get user role
const role = getUserRole();

// Check specific role
if (hasRole('admin')) {
  // User is admin
}

// Get editor info for tracking edits
const editorInfo = getEditorInfo();

// Logout
logout();
```

**Benefits:**
- Centralized token management
- Automatic token expiration checking
- Role-based access control helpers
- Consistent authentication state

### 3. API Client (`apiClient.js`)

Centralized axios instance with interceptors for authentication and error handling.

**Usage:**
```javascript
import { api } from '../utils/apiClient';

// GET request
const response = await api.get('/user/users');
const users = response.data;

// POST request
const response = await api.post('/user/login', credentials);

// PUT request
const response = await api.put(`/user/users/update/${userId}`, userData);

// DELETE request
await api.delete(`/user/users/delete/${userId}`);
```

**Benefits:**
- Automatic token injection
- Global error handling
- Automatic redirect on 401/403
- Consistent request/response handling
- No need to manually add Authorization headers

### 4. Form Validation (`../helpers/validationHelpers.js`)

Centralized form validation functions.

**Usage:**
```javascript
import { 
  validateEmail, 
  validateRequired, 
  validateForm,
  validateUserForm 
} from '../helpers/validationHelpers';

// Single field validation
const emailResult = validateEmail(email);
if (!emailResult.isValid) {
  console.error(emailResult.message);
}

// Form validation with schema
const schema = {
  email: (value) => validateEmail(value),
  name: (value) => validateRequired(value, "Name"),
  age: (value) => validateNumber(value, { min: 18, max: 100, fieldName: "Age" })
};

const result = validateForm(formData, schema);
if (!result.isValid) {
  console.error(result.errors);
}
```

**Benefits:**
- Reusable validation functions
- Consistent error messages
- Schema-based validation
- Type-safe validation results

## Migration Guide

### Replacing localStorage

**Before:**
```javascript
const token = localStorage.getItem('token');
localStorage.setItem('user', JSON.stringify(userData));
localStorage.removeItem('token');
```

**After:**
```javascript
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage';

const token = getItem(STORAGE_KEYS.TOKEN);
setItem(STORAGE_KEYS.USER, userData);
removeItem(STORAGE_KEYS.TOKEN);
```

### Replacing axios calls

**Before:**
```javascript
import axios from 'axios';
import { API_URL } from '../redux/API';

const token = localStorage.getItem('token');
const response = await axios.post(
  `${API_URL}/user/login`,
  credentials,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

**After:**
```javascript
import { api } from '../utils/apiClient';

const response = await api.post('/user/login', credentials);
```

### Replacing auth checks

**Before:**
```javascript
import { jwtDecode } from 'jwt-decode';

const token = localStorage.getItem('token');
if (!token) return null;
const decoded = jwtDecode(token);
const role = decoded.role;
```

**After:**
```javascript
import { getUserRole, isAuthenticated } from '../utils/auth';

if (!isAuthenticated()) return null;
const role = getUserRole();
```

## Best Practices

1. **Always use the abstractions** - Don't use `localStorage` or `axios` directly
2. **Use STORAGE_KEYS constants** - Prevents typos and ensures consistency
3. **Use api client** - All API calls should go through the `api` wrapper
4. **Use auth utilities** - All authentication checks should use auth utilities
5. **Use validation helpers** - All form validation should use centralized helpers

## Storage Keys

All storage keys are defined in `STORAGE_KEYS` constant:
- `STORAGE_KEYS.TOKEN` - Authentication token
- `STORAGE_KEYS.USER` - User information
- `STORAGE_KEYS.ROLE` - User role (legacy)
- `STORAGE_KEYS.PAGINATION_*` - Data grid pagination states

