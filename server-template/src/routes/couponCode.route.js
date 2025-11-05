import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createCouponCode,
  deleteCouponCode,
  getCouponCode,
  getCouponCodeValue,
} from "../controllers/couponCode.controller.js";

router.post("/create-coupon-code", isAuthenticated, createCouponCode);
router.get("/get-coupon/:id", isAuthenticated, getCouponCode);
router.delete("/delete-coupon/:id", isAuthenticated, deleteCouponCode);
router.get("/get-coupon-value/:name", isAuthenticated, getCouponCodeValue);
export default router;
