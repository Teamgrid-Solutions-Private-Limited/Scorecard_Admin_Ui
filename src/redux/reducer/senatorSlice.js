import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, API_PROTECTED_KEY } from "../API";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/auth";

// Async thunks for CRUD operations

// Create a senator
export const createSenator = createAsyncThunk(
  "senators/createSenator",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/v1/admin/senators/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get all senators
export const getAllSenators = createAsyncThunk(
  "senators/getAllSenators",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/v1/admin/senators/`, {
        headers: { "x-protected-key": API_PROTECTED_KEY },
      });

      if (!response.data) {
        throw new Error("No data received from API");
      }

      const senators = response.data;

      if (!Array.isArray(senators)) {
        throw new Error("Received data is not an array");
      }

      return senators;
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue({
        message: error.response?.data?.message || error.response?.data || error.message || "Operation failed"
      });
    }
  }
);

// Get senator by ID
export const getSenatorById = createAsyncThunk(
  "senators/getSenatorById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/v1/admin/senators/${id}`,
        {
          headers: { "x-protected-key": API_PROTECTED_KEY },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update senator
export const updateSenator = createAsyncThunk(
  "senators/updateSenator",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/v1/admin/senators/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const deleteSenator = createAsyncThunk(
  "senators/deleteSenator",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue({
          message: "Authentication token not found",
        });
      }

      // Decode the JWT token to get user information
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role; // Make sure this matches your JWT payload structure

      if (userRole !== "admin") {
        return rejectWithValue({
          message: "You are not authorized to delete senators.",
        });
      }

      const response = await axios.delete(
        `${API_URL}/v1/admin/senators/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Delete failed");
    }
  }
);

// Thunk to update senator status
export const updateSenatorStatus = createAsyncThunk(
  "senators/updateStatus",
  async ({ id, publishStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/v1/admin/senators/status/${id}`,
        { publishStatus }
      );
      return response.data.senator;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || error.response?.data || error.message || "Operation failed"
      });
    }
  }
);

// Discard changes for a senator
export const discardSenatorChanges = createAsyncThunk(
  "senators/discardChanges",
  async (senatorId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/v1/admin/senators/discard/${senatorId}`
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue({ message: "No response from server" });
      } else {
        return rejectWithValue({ message: error.message });
      }
    }
  }
);

// Initial state
const initialState = {
  senators: [],
  senator: null,
  loading: false,
  error: null,
};

// Slice
const senatorSlice = createSlice({
  name: "senators",
  initialState: {
    senators: [],
    senator: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSenatorState: (state) => {
      state.senator = null; // Clear the selected senator
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create senator
    builder
      .addCase(createSenator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSenator.fulfilled, (state, action) => {
        state.loading = false;
        // state.senators.push(action.payload);
      })
      .addCase(createSenator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get all senators
    builder
      .addCase(getAllSenators.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSenators.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.senators = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllSenators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.senators = [];
        console.error("Reducer: Error fetching senators:", action.payload);
      });

    // Get senator by ID
    builder
      .addCase(getSenatorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSenatorById.fulfilled, (state, action) => {
        state.loading = false;
        state.senator = action.payload;
      })
      .addCase(getSenatorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update senator
    builder
      .addCase(updateSenator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSenator.fulfilled, (state, action) => {
        state.loading = false;
        
      })
      .addCase(updateSenator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteSenator.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSenator.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.id;
        state.senators = state.senators.filter((s) => s._id !== deletedId);
        state.successMessage = "Senator deleted successfully.";
      })
      .addCase(deleteSenator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error deleting senator";
      });
    // Update senator status
    builder
      .addCase(updateSenatorStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSenatorStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.senators.findIndex((s) => s._id === updated._id);
        if (index !== -1) {
          state.senators[index] = updated;
        }
      })

      .addCase(updateSenatorStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error deleting senator";
      });
    // Discard Senator Changes
    builder.addCase(discardSenatorChanges.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(discardSenatorChanges.fulfilled, (state, action) => {
      state.loading = false;
      // Update the current senator with the reverted data
      if (state.senator && state.senator._id === action.payload.senator._id) {
        state.senator = action.payload.senator;
      }
      // Optionally, update in senators list if needed
      const idx = state.senators.findIndex(
        (s) => s._id === action.payload.senator._id
      );
      if (idx !== -1) {
        state.senators[idx] = action.payload.senator;
      }
    });
    builder.addCase(discardSenatorChanges.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "Failed to discard changes";
    });
  },
});

export default senatorSlice.reducer;

export const { clearSenatorState } = senatorSlice.actions;

