import express from "express";
import {
  authenticate,
  changePassword,
  createUser,
  deleteUsers,
  forgotPassword,
  getAllUsers,
  getCloudinarySignature,
  logout,
  profile,
  resendOTP,
  resetPassword,
  update,
  updateUserAvatar,
  updateUserInfo,
  updatedAddress,
  verifyOTP,
} from "../controllers/user.controller.js";
import {
  isAuthenticated,
  refreshToken,
} from "../middlewares/auth.middleware.js";
const router = express.Router();

//get cloudinary signature
router.post("/signature", getCloudinarySignature);
//create user
router.post("/create-user", createUser);
//verify-otp
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", authenticate);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", isAuthenticated, profile);
router.put("/update-user-avatar", isAuthenticated, updateUserAvatar);
router.put("/update-user-info", isAuthenticated, updateUserInfo);
router.put("/update-user-password", isAuthenticated, changePassword);
router.put("/updateuser", update);
router.get("/logout", isAuthenticated, logout);
router.put("/update-user-addresses", isAuthenticated, updatedAddress);
router.get("/admin-all-users", isAuthenticated, getAllUsers);
router.delete("/delete-user/:id", isAuthenticated, deleteUsers);
router.get("/refresh-token", refreshToken);

export default router;
