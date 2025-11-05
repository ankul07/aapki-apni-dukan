import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Initial State
const initialState = {
  loading: false,
  products: [], // ✅ All products list

  product: null, // ✅ Single product detail
  error: null,
  success: false,
  message: null,
};

// Create Product (Seller only)
export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post("/product/create-product", productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllProductsShop = createAsyncThunk(
  "product/getAllProductsShop",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/get-all-products-shop/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/product/delete-shop-product/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const getAllProducts = createAsyncThunk(
  "product/getAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/get-all-products`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const productSlice = createSlice({
  name: "product",
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
    clearProduct: (state) => {
      state.product = null; // Single product clear karne ke liye
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.products.push(action.payload.product); // Add to list
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create product";
        state.success = false;
      })
      // Get all products shop
      .addCase(getAllProductsShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProductsShop.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        // ✅ SUCCESS KO TRUE NAHI KIYA - Ye GET operation hai, toast nahi chahiye
      })
      .addCase(getAllProductsShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to get products";
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        // ✅ Optionally remove deleted product from array
        if (action.payload.deletedProduct?.id) {
          state.products = state.products.filter(
            (product) => product._id !== action.payload.deletedProduct.id
          );
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete product";
        state.success = false;
      })
      // Get All Products (Public)
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        // ✅ SUCCESS KO TRUE NAHI KIYA - Ye GET operation hai, toast nahi chahiye
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load products";
      });
  },
});

export const { clearError, clearSuccess, clearProduct } = productSlice.actions;
export default productSlice.reducer;
