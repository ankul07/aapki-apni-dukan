import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { razorpayInstance } from "../config/razorpay.config.js";
import { verifyRazorpaySignature } from "../utils/razorpaySignature.js";

// =============================================
// RAZORPAY PAYMENT - CREATE ORDER
// =============================================
export const createRazorpayOrder = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    return next(new AppError("Invalid amount", 400));
  }

  try {
    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise (already multiplied by 100 in frontend)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.id || req.user._id,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      message: "Razorpay order created successfully",
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return next(
      new AppError("Failed to create Razorpay order. Please try again.", 500)
    );
  }
});

// =============================================
// RAZORPAY PAYMENT - VERIFY SIGNATURE
// =============================================
export const verifyRazorpayPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError("Missing payment verification details", 400));
  }

  try {
    // Verify signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return next(new AppError("Invalid payment signature", 400));
    }

    // Signature verified successfully
    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return next(new AppError("Payment verification failed", 500));
  }
});

// =============================================
// UPI PAYMENT - CREATE ORDER
// =============================================
export const createUPIOrder = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    return next(new AppError("Invalid amount", 400));
  }

  try {
    // Create Razorpay order for UPI
    const options = {
      amount: amount, // Amount in paise
      currency: "INR",
      receipt: `upi_receipt_${Date.now()}`,
      notes: {
        userId: req.user.id || req.user._id,
        paymentMethod: "UPI",
      },
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      message: "UPI order created successfully",
    });
  } catch (error) {
    console.error("UPI order creation error:", error);
    return next(
      new AppError("Failed to create UPI order. Please try again.", 500)
    );
  }
});

// =============================================
// UPI PAYMENT - VERIFY SIGNATURE
// =============================================
export const verifyUPIPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError("Missing payment verification details", 400));
  }

  try {
    // Verify signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return next(new AppError("Invalid payment signature", 400));
    }

    // Signature verified successfully
    res.status(200).json({
      success: true,
      message: "UPI payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("UPI payment verification error:", error);
    return next(new AppError("UPI payment verification failed", 500));
  }
});
