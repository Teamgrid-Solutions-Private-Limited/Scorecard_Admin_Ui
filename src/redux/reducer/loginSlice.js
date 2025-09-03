import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../API";
import { jwtDecode } from "jwt-decode";

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/user/login`, credentials);

      return response.data; // Includes token and user details
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication token not found");
      }
      // Decode JWT to get user role
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      if (userRole !== "admin") {
        return rejectWithValue("Access denied: Admins only");
      }
      const response = await axios.get(`${API_URL}/user/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return rejectWithValue("Access denied: Admins only");
      }
      return rejectWithValue(error.response?.data || "Failed to fetch users");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication token not found");
      }
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      if (userRole !== "admin") {
        return rejectWithValue("You are not authorized to update users.");
      }
      const response = await axios.put(
        `${API_URL}/user/users/update/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication token not found");
      }
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      if (userRole !== "admin") {
        return rejectWithValue("You are not authorized to delete users.");
      }
      await axios.delete(`${API_URL}/user/users/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return userId; // Return the deleted user's ID
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete user");
    }
  }
);

export const addUser = createAsyncThunk(
  "users/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Authentication token not found");
      }
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      if (userRole !== "admin") {
        return rejectWithValue("You are not authorized to add users.");
      }
      const response = await axios.post(`${API_URL}/api/invite`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to add user"
      );
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
      localStorage.removeItem("token");
      localStorage.removeItem("role");
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
        state.role = action.payload.user.role; // Set role
        localStorage.setItem("token", action.payload.token);
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
        // Do not set state.loading here
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        // Do not set state.loading here
        state.users = state.users.map((user) =>
          user._id === action.payload.user._id ? action.payload.user : user
        );
        if (state.user && state.user._id === action.payload.user._id) {
          state.user = action.payload.user;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        // Do not set state.loading here
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        // Do not set state.loading here
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        // Do not set state.loading here
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        // Do not set state.loading here
      })

      // Add User
      .addCase(addUser.pending, (state) => {
        // Do not set state.loading here
      })
      .addCase(addUser.fulfilled, (state, action) => {
        // Do not set state.loading here
      })
      .addCase(addUser.rejected, (state, action) => {
        // Do not set state.loading here
      });
  },
});

export const { logout, clearUsers } = authSlice.actions;
export default authSlice.reducer;
