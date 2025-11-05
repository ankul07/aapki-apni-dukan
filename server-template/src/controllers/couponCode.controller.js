import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import sellerSchema from "../models/seller.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.js";
import { Event } from "../models/event.js";
import couponCode from "../models/couponCode.model.js";

export const createCouponCode = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { name, value, minAmount, maxAmount, selectedProducts } = req.body;
  // Validate required fields
  if (!name || !value) {
    return next(new AppError("Coupon name and value are required", 400));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "seller") {
    return next(new AppError("Only sellers can create coupon codes", 403));
  }
  // Check if seller profile exists
  const sellerProfile = await sellerSchema.findOne({ userId });
  if (!sellerProfile) {
    return next(new AppError("Seller profile not found", 404));
  }
  // Check if coupon code already exists for this seller
  const existingCoupon = await couponCode.findOne({ name, seller: userId });
  if (existingCoupon) {
    return next(new AppError("Coupon code with this name already exists", 400));
  }
  // Validate value (should be between 1-100 for percentage)
  if (value < 1 || value > 100) {
    return next(
      new AppError("Discount value must be between 1 and 100 percent", 400)
    );
  }
  // Validate min and max amount
  if (minAmount && maxAmount && minAmount > maxAmount) {
    return next(
      new AppError("Minimum amount cannot be greater than maximum amount", 400)
    );
  }
  const newCoupon = await couponCode.create({
    name: name.toUpperCase().trim(),
    value,
    minAmount: minAmount || 0,
    maxAmount: maxAmount || null,
    seller: userId,
    selectedProduct: selectedProducts || null,
  });

  res.status(201).json({
    success: true,
    message: "Coupon code created successfully",
    couponCode: newCoupon,
  });
});

// Get all events of a specific shop/seller
export const getCouponCode = asyncHandler(async (req, res, next) => {
  const sellerId = req.params.id;
  // Validate seller ID
  if (!sellerId) {
    return next(new AppError("Seller ID is required", 400));
  }

  // Check if seller exists
  const seller = await User.findById(sellerId);
  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  if (seller.role !== "seller") {
    return next(new AppError("Invalid seller ID", 400));
  }
  // Get all coupon codes for this seller
  const couponCodes = await couponCode
    .find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .select("-__v");

  res.status(200).json({
    success: true,
    count: couponCodes.length,
    couponCodes,
  });
});

export const deleteCouponCode = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const couponId = req.params.id;
  // Validate coupon ID
  if (!couponId) {
    return next(new AppError("Coupon ID is required", 400));
  }

  // Find coupon code
  const coupon = await couponCode.findById(couponId);
  if (!coupon) {
    return next(new AppError("Coupon code not found", 404));
  }

  // Check if the logged-in user is the owner of this coupon
  if (coupon.seller.toString() !== userId.toString()) {
    return next(
      new AppError("You are not authorized to delete this coupon code", 403)
    );
  }

  // Delete coupon
  await couponCode.findByIdAndDelete(couponId);

  res.status(200).json({
    success: true,
    message: "Coupon code deleted successfully",
  });
});
export const getCouponCodeValue = asyncHandler(async (req, res, next) => {
  const couponName = req.params.name;

  // Validate coupon name
  if (!couponName) {
    return next(new AppError("Coupon name is required", 400));
  }

  // Find coupon by name
  const coupon = await couponCode
    .findOne({ name: couponName.toUpperCase().trim() })
    .populate("seller", "name email shopAvatar");

  if (!coupon) {
    return next(new AppError("Invalid coupon code", 404));
  }

  res.status(200).json({
    success: true,
    couponCode: coupon,
  });
});
