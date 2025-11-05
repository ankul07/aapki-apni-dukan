import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createNewConversation,
  getAllConversationSeller,
  getAllConversationUser,
} from "../controllers/conversation.controller.js";
const router = express.Router();

router.post("/create-new-conversation", isAuthenticated, createNewConversation);
router.get(
  "/get-all-conversation-user/:id",
  isAuthenticated,
  getAllConversationUser
);
router.get(
  "/get-all-conversation-seller/:id",
  isAuthenticated,
  getAllConversationSeller
);
export default router;
