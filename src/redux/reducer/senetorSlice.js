import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../API";
import { jwtDecode } from "jwt-decode";

// Async thunks for CRUD operations

// Create a senator
export const createSenator = createAsyncThunk(
  "senators/createSenator",
  async (formData, { rejectWithValue }) => {
    console.log("slice", formData);

    try {
      const response = await axios.post(
        `${API_URL}/senator/senators/create/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
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
    //  console.log('Making API request to:', `${API_URL}/senator/senators/view`);
      const response = await axios.get(`${API_URL}/senator/senators/view`,{
        headers: { 'x-protected-key': 'MySuperSecretApiKey123' },
      });
      //console.log('Full API Response:', response);
      //console.log('Response Data:', response.data);
      //console.log('Response Info:', response.data?.info);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      const senators = response.data;
      //console.log('Processed Senators Data:', senators);
      
      if (!Array.isArray(senators)) {
        throw new Error('Received data is not an array');
      }
      
      return senators;
    } catch (error) {
      console.error('Error in getAllSenators:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get senator by ID
export const getSenatorById = createAsyncThunk(
  "senators/getSenatorById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/senator/senators/viewId/${id}`,
        {
          headers: { "x-protected-key": "MySuperSecretApiKey123" },
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
        `${API_URL}/senator/senators/update/${id}`,
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
      const token = localStorage.getItem("token");
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
        `${API_URL}/senator/senators/delete/${id}`,
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
      const response = await axios.patch(
        `${API_URL}/senator/senators/status/${id}`,
        { publishStatus }
      );
      return response.data.senator;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
       // console.log('Reducer: Setting senators with payload:', action.payload);
        state.senators = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllSenators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.senators = [];
        console.error('Reducer: Error fetching senators:', action.payload);
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
        // const index = state.senators.findIndex((s) => s.id === action.payload.id);
        // if (index !== -1) {
        //   state.senators[index] = action.payload;
        // }
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
    // Update senator status
    // builder
    //   .addCase(updateSenatorStatus.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(updateSenatorStatus.fulfilled, (state, action) => {
    //     state.loading = false;
    //     const updated = action.payload;
    //     const index = state.senators.findIndex((s) => s._id === updated._id);
    //     if (index !== -1) {
    //       state.senators[index] = updated;
    //     }
    //   })

    //   .addCase(updateSenatorStatus.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload;
    //   });
  },
});

export default senatorSlice.reducer;
export const { clearSenatorState } = senatorSlice.actions;