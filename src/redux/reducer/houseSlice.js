import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, API_PROTECTED_KEY } from "../API";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/auth";

// Async thunks for CRUD operations

// Create a house
export const createHouse = createAsyncThunk(
  "house/createHouse",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/v1/admin/houses/`,
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

// Get all house
export const getAllHouses = createAsyncThunk(
  "house/getAllHouses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/v1/admin/houses/`, {
        headers: { "x-protected-key": API_PROTECTED_KEY },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get house by ID
export const getHouseById = createAsyncThunk(
  "house/getHouseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/v1/admin/houses/${id}`, {
        headers: { "x-protected-key": API_PROTECTED_KEY },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update house
export const updateHouse = createAsyncThunk(
  "house/updateHouse",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/v1/admin/houses/update/${id}`,
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

// Delete house
export const deleteHouse = createAsyncThunk(
  "house/deleteHouse",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue({
          message: "Authentication token not found",
        });
      }

      // Decode token to get user role
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      if (userRole !== "admin") {
        return rejectWithValue({
          message: "You are not authorized to delete houses.",
        });
      }

      const response = await axios.delete(
        `${API_URL}/v1/admin/houses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("DeleteHouseError", error);
      return rejectWithValue(error.response?.data || "Delete failed");
    }
  }
);

// Thunk to update representative status
export const updateRepresentativeStatus = createAsyncThunk(
  "representatives/updateStatus",
  async ({ id, publishStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/v1/admin/houses/status/${id}`,
        { publishStatus }
      );
      return response.data.representative;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || "Error updating status"
      });
    }
  }
);

export const discardHouseChanges = createAsyncThunk(
  "house/discardChanges",
  async (houseId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/v1/admin/houses/discard/${houseId}`
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

// Bulk publish representatives
export const bulkPublishHouses = createAsyncThunk(
  "house/bulkPublish",
  async (houseIds, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue({
          message: "Authentication token not found",
        });
      }

      // Decode token to get user role
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      if (userRole !== "admin") {
        return rejectWithValue({
          message: "You are not authorized to bulk publish houses.",
        });
      }

      const response = await axios.post(
        `${API_URL}/v1/admin/house-data/bulk-publish`,
        { houseIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: () => true, // Don't throw on any status code
        }
      );

      // Return response data regardless of status code
      // The component will handle success/failure based on the data
      return response.data;
    } catch (error) {
      console.error("Bulk publish error:", error);
      return rejectWithValue(
        error.response?.data || { message: "Bulk publish failed" }
      );
    }
  }
);

// Initial state
const initialState = {
  houses: [],
  house: null,
  loading: false,
  error: null,
};

// Slice
const houseSlice = createSlice({
  name: "house",
  initialState,
  reducers: {
    clearHouseState: (state) => {
      state.house = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create house
    builder
      .addCase(createHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHouse.fulfilled, (state, action) => {
        state.loading = false;
        // state.house.push(action.payload);
      })
      .addCase(createHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get all house
    builder
      .addCase(getAllHouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllHouses.fulfilled, (state, action) => {
        state.loading = false;
        state.houses = action.payload;
      })
      .addCase(getAllHouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get house by ID
    builder
      .addCase(getHouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.house = action.payload;
      })
      .addCase(getHouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update house
    builder
      .addCase(updateHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHouse.fulfilled, (state, action) => {
        state.loading = false;
        // const index = state.house.findIndex((s) => s.id === action.payload.id);
        // if (index !== -1) {
        //   state.house[index] = action.payload;
        // }
      })
      .addCase(updateHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete house
    builder
      .addCase(deleteHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHouse.fulfilled, (state, action) => {
        state.loading = false;
        // state.house = state.house.filter((s) => s.id !== action.payload.id);
        // state.successMessage = "Representative deleted successfully.";
      })
      .addCase(deleteHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update representative status
    builder
      .addCase(updateRepresentativeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRepresentativeStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.houses.findIndex((r) => r._id === updated._id);
        if (index !== -1) {
          state.houses[index] = updated;
        }
      })
      .addCase(updateRepresentativeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // Discard House Changes
    builder.addCase(discardHouseChanges.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(discardHouseChanges.fulfilled, (state, action) => {
      state.loading = false;

      if (state.house && state.house._id === action.payload.house._id) {
        state.house = action.payload.house;
      }

      const idx = state.houses.findIndex(
        (h) => h._id === action.payload.house._id
      );
      if (idx !== -1) {
        state.houses[idx] = action.payload.house;
      }
    });
    builder.addCase(discardHouseChanges.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "Failed to discard changes";
    });

    // Bulk publish representatives
    builder
      .addCase(bulkPublishHouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkPublishHouses.fulfilled, (state, action) => {
        state.loading = false;
        // Update the published representatives in state
        const results = action.payload.results || [];
        results.forEach((result) => {
          const index = state.houses.findIndex(
            (h) => h._id === result.houseId
          );
          if (index !== -1) {
            state.houses[index].publishStatus = "published";
          }
        });
      })
      .addCase(bulkPublishHouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default houseSlice.reducer;

export const { clearHouseState } = houseSlice.actions;
