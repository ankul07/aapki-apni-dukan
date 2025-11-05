import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  adminGetAllProducts,
  createNewReview,
  createProduct,
  deleteProduct,
  getAllProduct,
  getAllProductShop,
} from "../controllers/productController.js";

router.post("/create-product", isAuthenticated, createProduct);
router.get("/get-all-products-shop/:id", getAllProductShop);
router.delete("/delete-shop-product/:id", isAuthenticated, deleteProduct);
router.get("/get-all-products", getAllProduct);
router.get("/admin-all-products", isAuthenticated, adminGetAllProducts);
router.put("/create-new-review", isAuthenticated, createNewReview);
export default router;
