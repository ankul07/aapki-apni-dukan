import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Initial State
const initialState = {
  loading: false,
  orders: [],
  adminOrders: [],
  error: null,
  success: false,
  message: null,
};

// Get All Orders of User
export const getAllOrdersOfUser = createAsyncThunk(
  "order/getAllOrdersOfUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order/get-all-orders/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch orders" }
      );
    }
  }
);

// Get All Orders of Shop (Seller)
export const getAllOrdersOfShop = createAsyncThunk(
  "order/getAllOrdersOfShop",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order/get-seller-all-orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch orders" }
      );
    }
  }
);

// Get All Orders of Admin
export const getAllOrdersOfAdmin = createAsyncThunk(
  "order/getAllOrdersOfAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/order/admin-all-orders");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch orders" }
      );
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Orders of User
      .addCase(getAllOrdersOfUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllOrdersOfUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "Orders fetched successfully";
        state.orders = action.payload.orders || [];
      })
      .addCase(getAllOrdersOfUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders";
        state.success = false;
      })

      // Get All Orders of Shop
      .addCase(getAllOrdersOfShop.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllOrdersOfShop.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "Orders fetched successfully";
        state.orders = action.payload.orders || [];
      })
      .addCase(getAllOrdersOfShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders";
        state.success = false;
      })

      // Get All Orders of Admin
      .addCase(getAllOrdersOfAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllOrdersOfAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "Orders fetched successfully";
        state.adminOrders = action.payload.orders || []; // ✅ Admin orders alag store
      })
      .addCase(getAllOrdersOfAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders";
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, clearOrders, addOrder } =
  orderSlice.actions;
export default orderSlice.reducer;
