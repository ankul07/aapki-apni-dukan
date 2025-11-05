import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createUPIOrder,
  verifyUPIPayment,
  //   getAllOrderOfUser,
} from "../controllers/payment.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.post(
  "/payment/razorpay/create-order",
  isAuthenticated,
  createRazorpayOrder
);
router.post("/razorpay/verify", isAuthenticated, verifyRazorpayPayment);

// UPI Routes
router.post("/upi/create-order", isAuthenticated, createUPIOrder);
router.post("/upi/verify", isAuthenticated, verifyUPIPayment);

export default router;
