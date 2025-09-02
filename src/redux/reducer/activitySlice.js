import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../API";

// Create an activity with file upload
export const createActivity = createAsyncThunk(
  "activity/createActivity",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/admin/activities/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get all activities
export const getAllActivity = createAsyncThunk(
  "activity/getAllActivity",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/activities/`, {
        headers: { "x-protected-key": "MySuperSecretApiKey123" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get an activity by ID
export const getActivityById = createAsyncThunk(
  "activity/getActivityById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/activities/${id}`, {
        headers: { "x-protected-key": "MySuperSecretApiKey123" },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update an activity by ID
export const updateActivity = createAsyncThunk(
  "activity/updateActivity",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/admin/activities/${id}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete an activity by ID
export const deleteActivity = createAsyncThunk(
  "activity/deleteActivity",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/admin/activities/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Discard changes and revert to previous state
export const discardActivityChanges = createAsyncThunk(
  "activity/discardChanges",
  async (activityId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/admin/activities/discard/${activityId}`
      );
      return response.data;
    } catch (error) {
      // Handle different error formats
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

export const updateActivityStatus = createAsyncThunk(
  "activity/updateActivityStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/admin/activities/status/${id}`,
        { status }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Bulk update trackActivities
export const bulkUpdateTrackActivities = createAsyncThunk(
  "activity/bulkUpdateTrackActivities",
  async ({ ids, trackActivities }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/admin/activities/update-track-activities`,
        { ids, trackActivities },
        {
          headers: {
            "Content-Type": "application/json",
            "x-protected-key": "MySuperSecretApiKey123", // Add if needed
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
const activitySlice = createSlice({
  name: "activity",
  initialState: {
    activities: [],
    activity: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearActivityState: (state) => {
      state.activities = [];
      state.activity = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Activity
    builder
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get All Activities
    builder
      .addCase(getAllActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(getAllActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Activity by ID
    builder
      .addCase(getActivityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActivityById.fulfilled, (state, action) => {
        state.loading = false;
        state.activity = action.payload;
      })
      .addCase(getActivityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Activity
    builder
      .addCase(updateActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Activity
    builder
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Activity Status
    builder
      .addCase(updateActivityStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivityStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.activity;
        if (state.activity && state.activity._id === updated._id) {
          state.activity.status = updated.status;
        }
        const index = state.activities.findIndex((a) => a._id === updated._id);
        if (index !== -1) {
          state.activities[index] = {
            ...state.activities[index],
            status: updated.status,
          };
        }
      })
      .addCase(updateActivityStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Bulk Update Track Activities (moved out)
    builder
      .addCase(bulkUpdateTrackActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateTrackActivities.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.updatedActivities) {
          action.payload.updatedActivities.forEach((updated) => {
            const index = state.activities.findIndex(
              (a) => a._id === updated._id
            );
            if (index !== -1) {
              state.activities[index] = updated;
            }
          });
        }
      })
      .addCase(bulkUpdateTrackActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Bulk update failed";
      });

    // Discard Changes
    builder
      .addCase(discardActivityChanges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(discardActivityChanges.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activity?._id === action.payload._id) {
          state.activity = action.payload;
        }
        const index = state.activities.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
      })
      .addCase(discardActivityChanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to discard changes";
      });
  },
});

export const { clearActivityState } = activitySlice.actions;

export default activitySlice.reducer;
