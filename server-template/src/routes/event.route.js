import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createEvent,
  deleteEvent,
  getAllEventShop,
  getAllEvents,
} from "../controllers/event.controller.js";

router.post("/create-event", isAuthenticated, createEvent);
router.get("/get-all-events/:id", isAuthenticated, getAllEventShop);
router.delete("/delete-shop-event/:id", isAuthenticated, deleteEvent);
router.get("/get-all-events", getAllEvents);
export default router;
