import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Initial State
const initialState = {
  loading: false,
  seller: null,
  sellers: [],
  error: null,
  success: false,
  message: null,
};

export const createSeller = createAsyncThunk(
  "seller/createSeller",
  async (sellerData, { rejectWithValue }) => {
    try {
      const response = await api.post("/seller/create-seller", sellerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const loadSeller = createAsyncThunk(
  "seller/loadSeller",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/seller/seller-profile");

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateShopAvatar = createAsyncThunk(
  "seller/updateShopAvatar",
  async (shopAvatar, { rejectWithValue }) => {
    try {
      const response = await api.put(
        "/seller/update-seller-avatar",
        shopAvatar
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateShopProfile = createAsyncThunk(
  "seller/updateShopProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/seller/update-seller-profile", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const getAllSellers = createAsyncThunk(
  "seller/getAllSellers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/seller/admin-all-sellers");

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
//slice
const sellerSlice = createSlice({
  name: "seller",
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(loadSeller.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload?.success ?? true;
        state.seller = action.payload?.seller || null;
      })
      .addCase(loadSeller.rejected, (state, action) => {
        state.loading = false;
        state.seller = null;
        state.error = action.payload?.error || "Failed to load user";
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      })

      .addCase(createSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createSeller.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.seller = action.payload.seller;
      })
      .addCase(createSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Registration failed";
        state.success = action.payload?.success || false;
        state.message = action.payload?.message || "An error occurred";
      })
      .addCase(updateShopAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(updateShopAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;
        if (state.seller) {
          state.seller.shopAvatar = action.payload.seller.shopAvatar; // ✅ Correct
        }
      })
      .addCase(updateShopAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Avatar post failed";
        state.success = action.payload?.success || false;
        state.message = action.payload?.message || "An error occurred";
      })
      .addCase(updateShopProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(updateShopProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.seller = action.payload.seller;
      })
      .addCase(updateShopProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Update Profile failed";
        state.success = action.payload?.success || false;
        state.message = action.payload?.message || "An error occurred";
      })
      .addCase(getAllSellers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(getAllSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload?.success ?? true;
        state.sellers = action.payload?.sellers || null;
        state.message = action.payload.message;
      })
      .addCase(getAllSellers.rejected, (state, action) => {
        state.loading = false;
        state.seller = null;
        state.error = action.payload?.error;
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      });
    // Verify OTP
  },
});

export const { clearError, clearSuccess } = sellerSlice.actions;
export default sellerSlice.reducer;
