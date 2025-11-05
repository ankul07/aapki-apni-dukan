import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createSeller,
  deleteSeller,
  deleteWithDrawMehtod,
  getAllSellers,
  getSellerInfo,
  sellerProfile,
  updatePaymentMethod,
  updateShopAvatar,
  updateShopProfile,
} from "../controllers/seller.controller.js";

router.post("/create-seller", isAuthenticated, createSeller);
router.get("/seller-profile", isAuthenticated, sellerProfile);
router.put("/update-seller-profile", isAuthenticated, updateShopProfile);
router.put("/update-seller-avatar", isAuthenticated, updateShopAvatar);
router.get("/admin-all-sellers", isAuthenticated, getAllSellers);
router.delete("/delete-seller/:id", isAuthenticated, deleteSeller);
router.get("/get-shop-info/:id", isAuthenticated, getSellerInfo);
router.put("/update-payment-methods", isAuthenticated, updatePaymentMethod);
router.delete("/delete-withdraw-method", isAuthenticated, deleteWithDrawMehtod);

export default router;
