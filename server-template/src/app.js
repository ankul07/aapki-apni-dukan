import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";

const app = express();

/**
 * @desc Enable CORS (Cross-Origin Resource Sharing)
 * @config Allows requests from all origins (*), enables credentials, and restricts HTTP methods
 */
app.use(
  cors({
    origin: "https://aapki-apni-dukan.vercel.app", //", // Allow requests from this origin
    credentials: true, // Allow cookies and authorization headers
    methods: ["POST", "GET", "DELETE", "PUT"], // Allowed HTTP methods
  })
);

// app.use(
//   cors({
//     origin: "http://localhost:5173", //", // Allow requests from this origin
//     credentials: true, // Allow cookies and authorization headers
//     methods: ["POST", "GET", "DELETE", "PUT"], // Allowed HTTP methods
//   })
// );

// Middleware to parse incoming JSON data
app.use(express.json());

/**
 * @desc Middleware to parse cookies from incoming requests
 */
app.use(cookieParser());

/**
 * @route   GET /test
 * @desc    A test route to check server status
 * @access  Public
 */
app.get("/test", (req, res) => {
  res.send("<h1>Welcome to root path!</h1>");
});
app.get("/keep-alive", (req, res) => {
  res.status(200).send("ok");
});
/**
 * @desc Middleware to parse URL-encoded bodies
 * @config Extended: true allows for rich objects and arrays
 * @config Limit: "50mb" increases the payload limit
 */
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/**
 * @desc Import and use user-related routes
 */
import userRoutes from "./routes/user.routes.js";
import sellerRoutes from "./routes/seller.route.js";
import productRoutes from "./routes/product.route.js";
import eventRoutes from "./routes/event.route.js";
import couponRoutes from "./routes/couponCode.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentReducer from "./routes/payment.route.js";
import withdrawReducer from "./routes/withdraw.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";

app.use("/api/v2/user", userRoutes);
app.use("/api/v2/seller", sellerRoutes);
app.use("/api/v2/product", productRoutes);
app.use("/api/v2/event", eventRoutes);
app.use("/api/v2/coupon", couponRoutes);
app.use("/api/v2/order", orderRoutes);
app.use("/api/v2/payment", paymentReducer);
app.use("/api/v2/withdraw", withdrawReducer);
app.use("/api/v2/conversation", conversationRoutes);
app.use("/api/v2/message", messageRoutes);

/**
 * @desc Global error handling middleware
 */
app.use(globalErrorHandler);

export default app;
