import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const isItemExist = state.cart.find((i) => i._id === item._id);

      if (isItemExist) {
        // Item already exists, update it
        state.cart = state.cart.map((i) =>
          i._id === isItemExist._id ? item : i
        );
      } else {
        // New item, add to cart
        state.cart.push(item);
      }

      // Update localStorage
      localStorage.setItem("cartItems", JSON.stringify(state.cart));
    },

    removeFromCart: (state, action) => {
      // action.payload ab sirf _id hai
      state.cart = state.cart.filter((i) => i._id !== action.payload);

      // Update localStorage
      localStorage.setItem("cartItems", JSON.stringify(state.cart));
    },

    // Optional: Clear entire cart
    clearCart: (state) => {
      state.cart = [];
      localStorage.removeItem("cartItems");
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
