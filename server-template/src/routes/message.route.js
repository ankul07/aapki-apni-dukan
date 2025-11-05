import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createNewMessage,
  getAllMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/get-all-messages/:id", isAuthenticated, getAllMessages);
router.post("/create-new-message", isAuthenticated, createNewMessage);
export default router;
