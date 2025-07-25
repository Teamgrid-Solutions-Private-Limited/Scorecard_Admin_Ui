import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../API";
import { jwtDecode } from "jwt-decode";

// Async thunks for CRUD operations

// Create a house
export const createHouse = createAsyncThunk(
  "house/createHouse",
  async (formData, { rejectWithValue }) => {
    console.log("createHouse", formData);

    try {
      const response = await axios.post(`${API_URL}/house/house/create`, formData, {
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

// Get all house
export const getAllHouses = createAsyncThunk(
  "house/getAllHouses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/house/house/view`, {
        headers: { 'x-protected-key': 'MySuperSecretApiKey123' },
      });
      console.log(response);

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
      const response = await axios.get(`${API_URL}/house/house/viewId/${id}`, {
        headers: { 'x-protected-key': 'MySuperSecretApiKey123' },
      });
      console.log("GetHouseById", response.data);
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
      const response = await axios.put(`${API_URL}/house/house/update/${id}`, formData, {
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

// Delete house
export const deleteHouse = createAsyncThunk(
  "house/deleteHouse",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
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
        `${API_URL}/house/house/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("DeleteHouse", response.data);
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
        `${API_URL}/house/representatives/status/${id}`,
        { publishStatus }
      );
      return response.data.representative;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error updating status"
      );
    }
  }
);
// export const deleteHouse = createAsyncThunk(
//   "house/deleteHouse",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await axios.delete(`${API_URL}/house/house/delete/${id}`);
//       console.log("DeleteHouse", response.data);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

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
    }
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
  },
});

export default houseSlice.reducer;


export const { clearHouseState } = houseSlice.actions


