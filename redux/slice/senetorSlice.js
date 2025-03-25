import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../api/API";

// Async thunks for CRUD operations

// Create a senator
export const createSenator = createAsyncThunk(
  "senators/createSenator",
  async (formData, { rejectWithValue }) => {
    console.log("slice",formData);
    
    try {
      const response = await axios.post(`${API_URL}/senator/senators/create/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
      const response = await axios.get(`${API_URL}/senator/senators/view`);
    console.log(response);
    
      return response.data.info;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get senator by ID
export const getSenatorById = createAsyncThunk(
  "senators/getSenatorById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/senator/senators/viewId/${id}`);
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
      const response = await axios.put(`${API_URL}/senator/senators/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete senator
export const deleteSenator = createAsyncThunk(
  "senators/deleteSenator",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/senator/senators/delete/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
  initialState,
  reducers: {},
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
        state.senators = action.payload;
      })
      .addCase(getAllSenators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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

    // Delete senator
    builder
      .addCase(deleteSenator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSenator.fulfilled, (state, action) => {
        state.loading = false;
        // state.senators = state.senators.filter((s) => s.id !== action.payload.id);
      })
      .addCase(deleteSenator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default senatorSlice.reducer;
