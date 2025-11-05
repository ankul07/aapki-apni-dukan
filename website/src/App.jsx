import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  VerifyOTP,
  LoginPage,
  SignupPage,
  ShopCreatePage,
  ProductDetailsPage,
  ProfilePage,
  BestSellingPage,
  ProductsPage,
  EventsPage,
  FAQPage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  OrderDetailsPage,
  TrackOrderPage,
  NotFound,
  UserInbox,
} from "./Routes/Routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import { loadUser } from "./redux/user/userSlice";
import {
  AdminDashboardEvents,
  AdminDashboardOrders,
  AdminDashboardPage,
  AdminDashboardProducts,
  AdminDashboardSellers,
  AdminDashboardUsers,
  AdminDashboardWithdraw,
} from "./Routes/Admin.routes";
import { useSelector, useDispatch } from "react-redux";
import {
  ShopAllCoupouns,
  ShopAllEvents,
  ShopAllOrders,
  ShopAllProducts,
  ShopAllRefunds,
  ShopCreateEvents,
  ShopCreateProduct,
  ShopDashboardPage,
  ShopHomePage,
  ShopInboxPage,
  ShopOrderDetails,
  ShopPreviewPage,
  ShopSettingsPage,
  ShopWithDrawMoneyPage,
} from "./Routes/ShopRoutes";
import { loadSeller } from "./redux/seller/sellerSlice";
import { getAllProducts } from "./redux/products/productSlice";
import { getAllEvents } from "./redux/events/eventSlice";
import ProtectedRoute from "./Routes/ProtectedRoute";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      dispatch(loadUser());
      dispatch(loadSeller());
    }

    dispatch(getAllProducts());
    dispatch(getAllEvents());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/otp-verify" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/best-selling" element={<BestSellingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />

        {/* ========== USER ROUTES (Login Required) ========== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <UserInbox />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/track/order/:id"
          element={
            <ProtectedRoute>
              <TrackOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-create"
          element={
            <ProtectedRoute>
              <ShopCreatePage />
            </ProtectedRoute>
          }
        />

        {/* ========== SELLER ROUTES (Seller Role Required) ========== */}
        <Route
          path="/shop/:id"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-messages"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopInboxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-product"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopCreateProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-orders"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopAllOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-refunds"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopAllRefunds />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopOrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-products"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopAllProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-event"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopCreateEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-events"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopAllEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-coupouns"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopAllCoupouns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-withdraw-money"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ShopWithDrawMoneyPage />
            </ProtectedRoute>
          }
        />

        {/* ========== ADMIN ROUTES (Admin Role Required) ========== */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-sellers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardSellers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-events"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-withdraw-request"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardWithdraw />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
};

export default App;
