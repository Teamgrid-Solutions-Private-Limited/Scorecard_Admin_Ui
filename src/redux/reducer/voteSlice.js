import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../API";
import { jwtDecode } from "jwt-decode";

// Create a vote with file upload
export const createVote = createAsyncThunk(
  "votes/createVote",
  async (formData, { rejectWithValue }) => {
    console.log("CreateVote", formData);

    try {
      const response = await axios.post(
        `${API_URL}/vote/votes/create/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(response);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get all votes
export const getAllVotes = createAsyncThunk(
  "votes/getAllVotes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vote/votes/viewAll/`, {
        headers: { "x-protected-key": "MySuperSecretApiKey123" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get a vote by ID
export const getVoteById = createAsyncThunk(
  "votes/getVoteById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vote/votes/viewId/${id}`, {
        headers: { "x-protected-key": "MySuperSecretApiKey123" },
      });
      console.log("GetVoteById", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update a vote by ID
export const updateVote = createAsyncThunk(
  "votes/updateVote",
  async ({ id, updatedData }, { rejectWithValue }) => {
    console.log("UpdateVote", id, updatedData);

    try {
      const response = await axios.put(
        `${API_URL}/vote/votes/update/${id}`,
        updatedData
      );
      console.log(response);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete a vote by ID
// Delete a vote by ID
export const deleteVote = createAsyncThunk(
  "votes/deleteVote",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue({
          message: "Authentication token not found",
        });
      }

      // Optional: Check role
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      if (userRole !== "admin") {
        return rejectWithValue({
          message: "You are not authorized to delete votes.",
        });
      }

      const response = await axios.delete(
        `${API_URL}/vote/votes/delete/${id}`,
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
// export const deleteVote = createAsyncThunk(
//   "votes/deleteVote",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await axios.delete(`${API_URL}/vote/votes/delete/${id}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// Update vote status (publish/draft)
export const updateVoteStatus = createAsyncThunk(
  "votes/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/vote/votes/status/${id}`, {
        status,
      });
      return response.data.vote; // return updated vote object
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Add this to your existing voteSlice.js
export const bulkUpdateSbaPosition = createAsyncThunk(
  'votes/bulkUpdateSbaPosition',
  async ({ ids, sbaPosition }, { rejectWithValue }) => {
    try {
      // Ensure sbaPosition is capitalized as expected by backend
      const formattedSbaPosition =
        sbaPosition && typeof sbaPosition === 'string'
          ? sbaPosition.charAt(0).toUpperCase() + sbaPosition.slice(1).toLowerCase()
          : sbaPosition;
      const response = await axios.patch(
        'http://localhost:4000/vote/update/bulk-update-sbaPosition',
        { ids, sbaPosition: formattedSbaPosition },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-protected-key': 'MySuperSecretApiKey123',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const voteSlice = createSlice({
  name: "votes",
  initialState: {
    votes: [],
    vote: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearVoteState: (state) => {
      state.votes = [];
      state.vote = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Vote
    builder.addCase(createVote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createVote.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(createVote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get All Votes
    builder.addCase(getAllVotes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllVotes.fulfilled, (state, action) => {
      state.loading = false;
      state.votes = action.payload;
    });
    builder.addCase(getAllVotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Vote by ID
    builder.addCase(getVoteById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getVoteById.fulfilled, (state, action) => {
      state.vote = action.payload;
    });
    builder.addCase(getVoteById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Vote
    builder.addCase(updateVote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateVote.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(updateVote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Vote
    builder.addCase(deleteVote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteVote.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(deleteVote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Vote Status (Publish/Draft)
    builder.addCase(updateVoteStatus.fulfilled, (state, action) => {
      const updatedVote = action.payload;
      const index = state.votes.findIndex((v) => v._id === updatedVote._id);
      if (index !== -1) {
        state.votes[index] = updatedVote;
      }
    });
    builder.addCase(updateVoteStatus.rejected, (state, action) => {
      state.error = action.payload;
    });
    // Add these cases to your existing extraReducers builder
    builder.addCase(bulkUpdateSbaPosition.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(bulkUpdateSbaPosition.fulfilled, (state, action) => {
      state.loading = false;
      // Update the local state with the modified bills
      const updatedBills = action.payload.updatedBills;
      updatedBills.forEach(updatedBill => {
        const index = state.votes.findIndex(v => v._id === updatedBill._id);
        if (index !== -1) {
          state.votes[index] = updatedBill;
        }
      });
    });

    builder.addCase(bulkUpdateSbaPosition.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to update bills';
    });
  },
});

export const { clearVoteState } = voteSlice.actions;

export default voteSlice.reducer;
