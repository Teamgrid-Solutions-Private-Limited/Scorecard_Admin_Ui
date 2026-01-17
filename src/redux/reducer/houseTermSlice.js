import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, API_PROTECTED_KEY } from "../API";

// Async thunks
export const createHouseData = createAsyncThunk(
  "houseData/createHouseData",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/admin/house-data/`,
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllHouseData = createAsyncThunk(
  "houseData/getAllHouseData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/house-data/`, {
        headers: { "x-protected-key": API_PROTECTED_KEY },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getHouseDataById = createAsyncThunk(
  "houseData/getHouseDataById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/admin/house-data/viewID/${id}`,
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

export const getHouseDataByHouseId = createAsyncThunk(
  "houseData/getHouseDataByHouseId",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/admin/house-data/viewbyhouse/${id}`,
        {
          headers: { "x-protected-key": API_PROTECTED_KEY },
        }
      );

      return response.data.terms;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateHouseData = createAsyncThunk(
  "houseData/updateHouseData",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/admin/house-data/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteHouseData = createAsyncThunk(
  "houseData/deleteHouseData",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/admin/house-data/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateHouseScores = createAsyncThunk(
  "houseData/updateHouseScores",
  async (updates, { rejectWithValue }) => {
    try {
   
      
      const response = await axios.put(
        `${API_URL}/api/v1/admin/house-data/scores/update`,
        { updates }
      );
      
      return response.data;
    } catch (error) {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  houseData: [],
  currentHouse: null,
  loading: false,
  error: null,
};

// Slice
const houseDataSlice = createSlice({
  name: "houseData",
  initialState,
  reducers: {
    clearHouseDataState: (state) => {
      state.currentHouse = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Senator Data
      .addCase(createHouseData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHouseData.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createHouseData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Senator Data
      .addCase(getAllHouseData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllHouseData.fulfilled, (state, action) => {
        state.loading = false;
        state.houseData = action.payload;
      })
      .addCase(getAllHouseData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Senator Data by ID
      .addCase(getHouseDataById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHouseDataById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHouse = action.payload;
      })
      .addCase(getHouseDataById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getHouseDataByHouseId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHouseDataByHouseId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHouse = action.payload;
      })
      .addCase(getHouseDataByHouseId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Senator Data
      .addCase(updateHouseData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHouseData.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateHouseData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Senator Data
      .addCase(deleteHouseData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHouseData.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteHouseData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update House Scores (Bulk)
      .addCase(updateHouseScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHouseScores.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateHouseScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default houseDataSlice.reducer;

export const { clearHouseDataState } = houseDataSlice.actions;
