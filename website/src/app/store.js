import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "../redux/user/userSlice";
import sellerReducer from "../redux/seller/sellerSlice";
import productReducer from "../redux/products/productSlice";
import eventReducer from "../redux/events/eventSlice";
import wishlistReducer from "../redux/wishlist/wishlistSlice";
import cartReducer from "../redux/cart/cartSlice";
import orderReducer from "../redux/order/orderSlice";
// User persist config
const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["isAuthenticated", "user"],
};

// Seller persist config
const sellerPersistConfig = {
  key: "seller",
  storage,
  whitelist: ["seller"], // ✅ bas seller object persist hoga
};

// Apply persistReducer separately
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedSellerReducer = persistReducer(
  sellerPersistConfig,
  sellerReducer
);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    seller: persistedSellerReducer,
    product: productReducer,
    event: eventReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
