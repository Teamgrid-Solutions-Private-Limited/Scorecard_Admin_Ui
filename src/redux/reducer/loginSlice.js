import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../utils/apiClient";
import { getToken, getUserRole, setToken, setUser, setRole, logout as authLogout } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("v1/user/login", credentials);

      return response.data; // Includes token and user details
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("Authentication token not found");
      }
      // Check user role
      const userRole = getUserRole();
      if (userRole !== "admin") {
        return rejectWithValue("Access denied: Admins only");
      }
      const response = await api.get("v1/user/users");
      return response.data;
    } catch (error) {
      if (error.message && error.message.includes("Access denied")) {
        return rejectWithValue("Access denied: Admins only");
      }
      return rejectWithValue(error.message || "Failed to fetch users");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("Authentication token not found");
      }
      const userRole = getUserRole();
      if (userRole !== "admin") {
        return rejectWithValue("You are not authorized to update users.");
      }
      const response = await api.put(`v1/user/users/update/${userId}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("Authentication token not found");
      }
      const userRole = getUserRole();
      if (userRole !== "admin") {
        return rejectWithValue("You are not authorized to delete users.");
      }
      await api.delete(`v1/user/users/delete/${userId}`);
      return userId; // Return the deleted user's ID
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete user");
    }
  }
);

export const addUser = createAsyncThunk(
  "users/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("Authentication token not found");
      }
      const userRole = getUserRole();
      if (userRole !== "admin") {
        return rejectWithValue("You are not authorized to add users.");
      }
      const response = await api.post("v1/user/users/create", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to add user"
      });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    role: null, // Add role to state
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.users = [];
      // Use auth utility for consistent logout
      authLogout();
    },
    clearUsers: (state) => {
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
        // Use auth utilities for consistent storage
        setToken(action.payload.token);
        setUser(action.payload.user.fullName);
        setRole(action.payload.user.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Optionally clear users if access denied
        if (action.payload === "Access denied: Admins only") {
          state.users = [];
        }
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload.user._id ? action.payload.user : user
        );
        if (state.user && state.user._id === action.payload.user._id) {
          state.user = action.payload.user;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearUsers } = authSlice.actions;
export default authSlice.reducer;
