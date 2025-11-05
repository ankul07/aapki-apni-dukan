import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Initial State
const initialState = {
  loading: false,
  events: [], // ✅ All events list
  event: null, // ✅ Single event detail
  error: null,
  success: false,
  message: null,
};

// Create Event (Seller only)
export const createEvent = createAsyncThunk(
  "event/createEvent",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await api.post("/event/create-event", eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get All Events of a Seller
export const getAllEventsShop = createAsyncThunk(
  "event/getAllEventsShop",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/event/get-all-events/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete Event
export const deleteEvent = createAsyncThunk(
  "event/deleteEvent",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/event/delete-shop-event/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearEvent: (state) => {
      state.event = null; // ✅ Single event clear
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.events.push(action.payload.event); // ✅ Correct property
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create event";
        state.success = false;
      })

      // Get All Events (Shop)
      .addCase(getAllEventsShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEventsShop.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events; // ✅ Correct property
      })
      .addCase(getAllEventsShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to get events";
      })

      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        // ✅ Remove deleted event from array
        if (action.payload.deletedEvent?.id) {
          state.events = state.events.filter(
            (event) => event._id !== action.payload.deletedEvent.id
          );
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete event";
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, clearEvent } = eventSlice.actions;
export default eventSlice.reducer;
