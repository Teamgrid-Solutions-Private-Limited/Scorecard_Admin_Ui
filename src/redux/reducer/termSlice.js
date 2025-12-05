import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, API_PROTECTED_KEY } from "../API";

// Create a term
export const createTerm = createAsyncThunk(
  "terms/createTerm",
  async (termData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/term/terms/create/`,
        termData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get all terms
export const getAllTerms = createAsyncThunk(
  "terms/getAllTerms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/term/terms/viewAll/`, {
        headers: { "x-protected-key": API_PROTECTED_KEY },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get term by ID
export const getTermById = createAsyncThunk(
  "terms/getTermById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/term/terms/viewId/${id}`, {
        headers: { "x-protected-key": API_PROTECTED_KEY },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update a term
export const updateTerm = createAsyncThunk(
  "terms/updateTerm",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/term/terms/update/${id}`,
        updatedData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete a term
export const deleteTerm = createAsyncThunk(
  "terms/deleteTerm",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/term/terms/delete/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const termSlice = createSlice({
  name: "terms",
  initialState: {
    terms: [],
    term: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTermState: (state) => {
      state.terms = [];
      state.term = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Term
    builder.addCase(createTerm.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTerm.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(createTerm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get All Terms
    builder.addCase(getAllTerms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllTerms.fulfilled, (state, action) => {
      state.loading = false;
      state.terms = action.payload;
    });
    builder.addCase(getAllTerms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Term by ID
    builder.addCase(getTermById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTermById.fulfilled, (state, action) => {
      state.loading = false;
      state.term = action.payload;
    });
    builder.addCase(getTermById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Term
    builder.addCase(updateTerm.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTerm.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(updateTerm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Term
    builder.addCase(deleteTerm.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTerm.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(deleteTerm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearTermState } = termSlice.actions;

export default termSlice.reducer;
