import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../API";

// Async thunk for user login
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
    console.log(credentials);
    
  try {
    const response = await axios.post(`${API_URL}/user/login`, credentials);
    console.log(response.data);
    
    return response.data; // Includes token and user details
  } catch (error) {
    return rejectWithValue(error.response?.data || "Login failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
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
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
