import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../API";

// Create an activity with file upload
export const createActivity = createAsyncThunk(
  "activity/createActivity",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/activity/activity/create/`,
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
      const response = await axios.get(
        `${API_URL}/activity/activity/viewAll/`,
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

// Get an activity by ID
export const getActivityById = createAsyncThunk(
  "activity/getActivityById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/activity/activity/viewId/${id}`,
        {
          headers: { "x-protected-key": "MySuperSecretApiKey123" },
        }
      );
      console.log("GetActivityById", response.data);
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
        `${API_URL}/activity/activity/update/${id}`,
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
        `${API_URL}/activity/activity/delete/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Discard changes and revert to previous state
export const discardActivityChanges = createAsyncThunk(
  'activity/discardChanges',
  async (activityId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/activity/discard/${activityId}`
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
        `${API_URL}/activity/activity/status/${id}`,
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
        `${API_URL}/activity/update/bulk-update-track-activities`,
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
// export const bulkUpdateTrackActivities = createAsyncThunk(
//   "activity/bulkUpdateTrackActivities",
//   async ({ ids, trackActivities }, { rejectWithValue }) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/activity/update/bulk-update-track-activities`,
//         { ids, trackActivities }
//       );
//       console.log("BulkUpdateTrackActivities", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("BulkUpdateTrackActivities Error:", error);
//       return rejectWithValue(error.response?.data || "Server error");
//     }
//   }
// );

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
    builder.addCase(createActivity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createActivity.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(createActivity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get All Activities
    builder.addCase(getAllActivity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllActivity.fulfilled, (state, action) => {
      state.loading = false;
      state.activities = action.payload;
    });
    builder.addCase(getAllActivity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Activity by ID
    builder.addCase(getActivityById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getActivityById.fulfilled, (state, action) => {
      state.loading = false;
      state.activity = action.payload;
    });
    builder.addCase(getActivityById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Activity
    builder.addCase(updateActivity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateActivity.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(updateActivity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Activity
    builder.addCase(deleteActivity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteActivity.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(deleteActivity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    // Update Activity Status
    builder.addCase(updateActivityStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateActivityStatus.fulfilled, (state, action) => {
      console.log("Payload:", action.payload);
      state.loading = false;
      const updated = action.payload.activity;

      // update single activity if it's being viewed
      if (state.activity && state.activity._id === updated._id) {
        state.activity.status = updated.status;
      }

      // update the activity in the list
      const index = state.activities.findIndex((a) => a._id === updated._id);
      if (index !== -1) {
        state.activities[index] = {
          ...state.activities[index],
          status: updated.status,
        };

        builder
          .addCase(bulkUpdateTrackActivities.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(bulkUpdateTrackActivities.fulfilled, (state, action) => {
            state.loading = false;
            // Update the state with the modified activities
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
      }
    });

    builder.addCase(updateActivityStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

   builder.addCase(discardActivityChanges.pending, (state) => {
  state.loading = true;
  state.error = null;
});

builder.addCase(discardActivityChanges.fulfilled, (state, action) => {
  state.loading = false;
  // Update the current activity
  if (state.activity?._id === action.payload._id) {
    state.activity = action.payload;
  }
  // Update in activities list
  const index = state.activities.findIndex(a => a._id === action.payload._id);
  if (index !== -1) {
    state.activities[index] = action.payload;
  }
});

builder.addCase(discardActivityChanges.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload?.message || "Failed to discard changes";
});
  },
});

export const { clearActivityState } = activitySlice.actions;

export default activitySlice.reducer;
