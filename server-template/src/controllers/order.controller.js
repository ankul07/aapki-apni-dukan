import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import sellerSchema from "../models/seller.model.js";
import { User } from "../models/user.model.js";

export const getAllOrderOfAdmin = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // ✅ Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // ✅ Check if user is admin
  if (user.role !== "admin") {
    return next(
      new AppError("Access denied. Only admins can view all orders", 403)
    );
  }

  // ✅ Fetch all orders sorted by createdAt (newest first)
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "All orders fetched successfully",
    orders,
    totalOrders: orders.length,
  });
});
//seller
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id; // Logged in seller
  const orderId = req.params.id;
  const { status } = req.body;

  // ✅ Valid statuses
  const validStatuses = [
    "Processing",
    "Transferred to delivery partner",
    "Shipping",
    "Received",
    "On the way",
    "Delivered",
  ];

  // ✅ Check: Status valid hai ya nahi
  if (!status || !validStatuses.includes(status)) {
    return next(new AppError("Please provide a valid order status", 400));
  }

  // ✅ Order find karo
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // ✅ Check: Seller authorized hai ya nahi (cart me seller ka product hai ya nahi)
  const isSeller = order.cart.some(
    (item) =>
      item.seller?._id?.toString() === userId.toString() ||
      item.seller?.toString() === userId.toString()
  );

  if (!isSeller) {
    return next(
      new AppError("You are not authorized to update this order", 403)
    );
  }

  // ✅ Agar status "Transferred to delivery partner" hai toh stock update karo
  if (status === "Transferred to delivery partner") {
    for (const item of order.cart) {
      await updateProductStock(item._id, item.qty);
    }
  }

  // ✅ Order status update karo
  order.status = status;

  // ✅ Agar order delivered hai toh seller ka balance update karo
  if (status === "Delivered") {
    order.deliveredAt = Date.now();
    order.paymentInfo.status = "Succeeded";

    // 10% service charge deduct karke seller ko amount add karo
    const serviceCharge = order.totalPrice * 0.1;
    const sellerAmount = order.totalPrice - serviceCharge;

    await updateSellerBalance(userId, sellerAmount);
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
});

// ✅ Helper function: Seller balance update
async function updateSellerBalance(sellerId, amount) {
  const seller = await sellerSchema.findOne({ userId: sellerId });
  if (seller) {
    seller.availableBalance += amount;
    await seller.save({ validateBeforeSave: false });
  }
}
export const getAllOrdersOfShop = asyncHandler(async (req, res, next) => {
  const sellerId = req.params.id; // Seller ki User ID
  const userId = req.user.id || req.user._id; // Currently logged in user

  // ✅ Check: Logged in user aur seller same hai ya nahi
  if (userId.toString() !== sellerId.toString()) {
    return next(
      new AppError("You are not authorized to view these orders", 403)
    );
  }

  // ✅ Check: User seller hai ya nahi
  const user = await User.findById(sellerId);
  if (!user || user.role !== "seller") {
    return next(new AppError("Seller not found", 404));
  }

  // ✅ Orders find karo jinme seller ke products hain
  // Cart me seller._id ya seller ko match karo
  const orders = await Order.find({
    $or: [{ "cart.seller._id": sellerId }, { "cart.seller": sellerId }],
  })
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 });

  // ✅ Response bhejo
  res.status(200).json({
    success: true,
    totalOrders: orders.length,
    orders,
  });
});
// ✅ Customer refund request karega (User side)
export const orderRefund = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const orderId = req.params.id;

  // Order find karo
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError("Order not found with this id", 404));
  }

  // Check karo - ye order isi user ka hai ya nahi
  if (order.user.toString() !== userId.toString()) {
    return next(
      new AppError("You are not authorized to refund this order", 403)
    );
  }

  // Check karo - order delivered hai ya nahi
  if (order.status !== "Delivered") {
    return next(
      new AppError("You can only request refund for delivered orders", 400)
    );
  }

  // Status update karo to "Processing refund"
  order.status = "Processing refund";

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Refund request submitted successfully!",
    order,
  });
});

// ✅ Seller refund approve karega (Seller side)
export const orderRefundSuccess = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const orderId = req.params.id;

  // Order find karo
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError("Order not found with this id", 404));
  }

  // Check karo - order "Processing refund" status me hai ya nahi
  if (order.status !== "Processing refund") {
    return next(
      new AppError("This order is not in refund processing state", 400)
    );
  }

  // Seller ka profile find karo
  const seller = await sellerSchema.findOne({ userId });

  if (!seller) {
    return next(new AppError("Seller profile not found", 404));
  }

  // Status update karo to "Refund Success"
  order.status = "Refund Success";

  await order.save({ validateBeforeSave: false });

  // ✅ Stock restore karo for each product in cart
  for (const item of order.cart) {
    await updateProductStock(item._id, item.qty);
  }

  // ✅ Seller ke balance se paise minus karo (refund amount)
  seller.availableBalance -= order.totalPrice;

  // Transaction record karo
  seller.transactions.push({
    amount: order.totalPrice,
    status: "Refunded",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await seller.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Order refund successful!",
    order,
  });
});
// ✅ Helper function - Product stock restore karne ke liye
async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  if (product) {
    product.stock += quantity; // Stock wapas add karo
    product.soldOut -= quantity; // Sold count kam karo

    await product.save({ validateBeforeSave: false });
  }
}
// =============================================
// CREATE ORDER IN DATABASE (Final Step)
// =============================================
export const createOrder = asyncHandler(async (req, res, next) => {
  const { cart, shippingAddress, totalPrice, paymentInfo } = req.body;

  const userId = req.user.id || req.user._id;

  // Validate required fields
  if (!cart || cart.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  if (!shippingAddress) {
    return next(new AppError("Shipping address is required", 400));
  }

  if (!totalPrice || totalPrice <= 0) {
    return next(new AppError("Invalid total price", 400));
  }

  if (!paymentInfo || !paymentInfo.type) {
    return next(new AppError("Payment information is required", 400));
  }

  try {
    // Create order in database
    const order = await Order.create({
      cart,
      shippingAddress,
      user: userId,
      totalPrice,
      paymentInfo,
      status: "Processing",
      paidAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return next(new AppError("Failed to create order", 500));
  }
});

export const getAllOrderOfUser = asyncHandler(async (req, res, next) => {
  // Logged in user ki ID (JWT se milegi)
  const loggedInUserId = req.user.id || req.user._id;

  // Jis user ke orders chahiye uski ID (params se milegi)
  const requestedUserId = req.params.userId;

  // ✅ Security Check: Agar user apne alawa kisi aur ke orders dekh raha hai
  // to check karo ki wo admin hai ya nahi
  if (
    loggedInUserId.toString() !== requestedUserId &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorHandler("You are not authorized to view these orders", 403)
    );
  }

  // ✅ Orders fetch karo with full user data
  const orders = await Order.find({ user: requestedUserId })
    .populate({
      path: "user",
      select: "name email phoneNumber avatar nickName addresses createdAt", // Jo fields chahiye wo select karo
    })
    .sort({ createdAt: -1 }); // Latest orders pehle

  // ✅ Response bhejo
  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    orders,
    totalOrders: orders.length,
  });
});
