import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  wishlist: localStorage.getItem("wishlistItems")
    ? JSON.parse(localStorage.getItem("wishlistItems"))
    : [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload;
      const isItemExist = state.wishlist.find((i) => i._id === item._id);

      if (isItemExist) {
        // Already exists, update it
        state.wishlist = state.wishlist.map((i) =>
          i._id === isItemExist._id ? item : i
        );
      } else {
        // New item, add to wishlist
        state.wishlist.push(item);
      }

      // Update localStorage
      localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
    },

    removeFromWishlist: (state, action) => {
      // action.payload ab sirf _id hai
      state.wishlist = state.wishlist.filter((i) => i._id !== action.payload);

      // Update localStorage
      localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
    },

    // Optional: Clear entire wishlist
    clearWishlist: (state) => {
      state.wishlist = [];
      localStorage.removeItem("wishlistItems");
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
