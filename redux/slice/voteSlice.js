import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../api/API';

// Create a vote with file upload
export const createVote = createAsyncThunk(
  'votes/createVote',
  async (formData, { rejectWithValue }) => {
    console.log("CreateVote",formData);
    
    try {
      const response = await axios.post(`${API_URL}/vote/votes/create/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get all votes
export const getAllVotes = createAsyncThunk(
  'votes/getAllVotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vote/votes/viewAll/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get a vote by ID
export const getVoteById = createAsyncThunk(
  'votes/getVoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vote/votes/viewId/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update a vote by ID
export const updateVote = createAsyncThunk(
  'votes/updateVote',
  async ({ id, updatedData }, { rejectWithValue }) => {
    console.log("UpdateVote",id, updatedData);
    
    try {
      const response = await axios.put(`${API_URL}/vote/votes/update/${id}`, updatedData);
      console.log(response);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete a vote by ID
export const deleteVote = createAsyncThunk(
  'votes/deleteVote',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/vote/votes/delete/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const voteSlice = createSlice({
  name: 'votes',
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
      state.loading = false;
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
  },
});

export const { clearVoteState } = voteSlice.actions;

export default voteSlice.reducer;
