import express from "express";
import {
  createOrder,
  getAllOrderOfAdmin,
  getAllOrderOfUser,
  getAllOrdersOfShop,
  orderRefund,
  orderRefundSuccess,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Final Order Creation
router.post("/create-order", isAuthenticated, createOrder);

router.get("/get-all-orders/:userId", isAuthenticated, getAllOrderOfUser);
router.put("/order-refund/:id", isAuthenticated, orderRefund);
router.put("/order-refund-success/:id", isAuthenticated, orderRefundSuccess);
router.get("/get-seller-all-orders/:id", isAuthenticated, getAllOrdersOfShop);
router.put("/update-order-status/:id", isAuthenticated, updateOrderStatus);
//admin
router.get("/admin-all-orders", isAuthenticated, getAllOrderOfAdmin);
export default router;
