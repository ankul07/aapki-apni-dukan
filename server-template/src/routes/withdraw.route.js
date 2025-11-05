import express from "express";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createWithdrawRequest,
  getAllWithdrawRequest,
  updateWithdrawRequest,
} from "../controllers/withdraw.controller.js";
const router = express.Router();
router.post("/create-withdraw-request", isAuthenticated, createWithdrawRequest);

router.get("/get-all-withdraw-request", isAuthenticated, getAllWithdrawRequest);
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  updateWithdrawRequest
);

export default router;
