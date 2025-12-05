import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, API_PROTECTED_KEY } from "../API";

// Async thunks
export const createSenatorData = createAsyncThunk(
  "senatorData/createSenatorData",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/admin/senator-data/`,
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllSenatorData = createAsyncThunk(
  "senatorData/getAllSenatorData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/admin/senator-data/`,
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

export const getSenatorDataById = createAsyncThunk(
  "senatorData/getSenatorDataById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/admin/senator-data/viewID/${id}`,
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

export const getSenatorDataBySenetorId = createAsyncThunk(
  "senatorData/getSenatorDataBySenetorId",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/admin/senator-data/viewbysenator/${id}`,
        {
          headers: { "x-protected-key": API_PROTECTED_KEY },
        }
      );
      return response.data.info;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSenatorData = createAsyncThunk(
  "senatorData/updateSenatorData",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/admin/senator-data/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSenatorData = createAsyncThunk(
  "senatorData/deleteSenatorData",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/admin/senator-data/${id}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  senatorData: [],
  currentSenator: null,
  loading: false,
  error: null,
};

// Slice
const senatorDataSlice = createSlice({
  name: "senatorData",
  initialState,
  reducers: {
    clearSenatorDataState: (state) => {
      state.currentSenator = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Senator Data
      .addCase(createSenatorData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSenatorData.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createSenatorData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Senator Data
      .addCase(getAllSenatorData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSenatorData.fulfilled, (state, action) => {
        state.loading = false;
        state.senatorData = action.payload;
      })
      .addCase(getAllSenatorData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Senator Data by ID
      .addCase(getSenatorDataById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSenatorDataById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSenator = action.payload;
      })
      .addCase(getSenatorDataById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSenatorDataBySenetorId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSenatorDataBySenetorId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSenator = action.payload;
      })
      .addCase(getSenatorDataBySenetorId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Senator Data
      .addCase(updateSenatorData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSenatorData.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateSenatorData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Senator Data
      .addCase(deleteSenatorData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSenatorData.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteSenatorData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default senatorDataSlice.reducer;
export const { clearSenatorDataState } = senatorDataSlice.actions;
