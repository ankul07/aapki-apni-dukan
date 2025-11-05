import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import sellerSchema from "../models/seller.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.js";
import { Event } from "../models/event.js";
import couponeCode from "../models/couponCode.model.js";

export const deleteWithDrawMehtod = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // ✅ Check if user exists and is a seller
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "seller") {
    return next(new AppError("Only sellers can delete payment methods", 403));
  }

  // ✅ Find seller profile
  const seller = await sellerSchema.findOne({ userId });

  if (!seller) {
    return next(new AppError("Seller profile not found", 404));
  }

  // ✅ Check if withdrawMethod exists
  if (
    !seller.withdrawMethod ||
    Object.keys(seller.withdrawMethod).length === 0
  ) {
    return next(new AppError("No payment method found to delete", 404));
  }

  // ✅ Delete withdrawMethod (set to empty object or null)
  seller.withdrawMethod = {};
  await seller.save();

  // ✅ Send success response
  res.status(200).json({
    success: true,
    message: "Payment method deleted successfully",
  });
});
export const updatePaymentMethod = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // ✅ Check if user exists and is a seller
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "seller") {
    return next(new AppError("Only sellers can update payment methods", 403));
  }

  // ✅ Get withdrawMethod from request body
  const { withdrawMethod } = req.body;

  // ✅ Validate withdrawMethod object
  if (!withdrawMethod || typeof withdrawMethod !== "object") {
    return next(
      new AppError("Please provide valid payment method details", 400)
    );
  }

  // ✅ Validate required fields
  const {
    bankName,
    bankCountry,
    bankSwiftCode,
    bankAccountNumber,
    bankHolderName,
    bankAddress,
  } = withdrawMethod;

  if (
    !bankName ||
    !bankCountry ||
    !bankSwiftCode ||
    !bankAccountNumber ||
    !bankHolderName ||
    !bankAddress
  ) {
    return next(new AppError("All bank details are required", 400));
  }

  // ✅ Find seller profile and update withdrawMethod
  const seller = await sellerSchema.findOneAndUpdate(
    { userId },
    { withdrawMethod },
    { new: true, runValidators: true }
  );

  if (!seller) {
    return next(new AppError("Seller profile not found", 404));
  }

  // ✅ Send success response
  res.status(200).json({
    success: true,
    message: "Payment method updated successfully",
    data: {
      withdrawMethod: seller.withdrawMethod,
    },
  });
});
export const deleteSeller = asyncHandler(async (req, res, next) => {
  const deleteIdRequest = req.params.id;

  // ✅ PEHLE USER KA ROLE CHECK KARO
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return next(new AppError("User not found", 404));
  }

  const seller = await sellerSchema.findById(deleteIdRequest);
  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  // ✅ Authorization check - Admin ya khud ka seller account
  if (
    currentUser.role !== "admin" &&
    seller.userId.toString() !== userId.toString()
  ) {
    return next(
      new AppError("You are not authorized to delete this seller", 403)
    );
  }

  // ✅ DELETE ALL ASSOCIATED DATA
  const sellerUserId = seller.userId;

  await Product.deleteMany({ seller: sellerUserId });
  await Event.deleteMany({ seller: sellerUserId });
  await couponeCode.deleteMany({ seller: sellerUserId });
  await sellerSchema.findByIdAndDelete(deleteIdRequest);
  await User.findByIdAndUpdate(sellerUserId, { role: "user" }, { new: true });

  res.status(200).json({
    success: true,
    message: "Seller and all associated data deleted successfully",
  });
});

export const getAllSellers = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (user.role !== "admin") {
    return next(new AppError("Only admin can get all users", 403));
  }
  const sellers = await sellerSchema
    .find()
    .sort({
      createdAt: -1,
    })
    .populate("userId", "name email avatar");

  res.status(201).json({
    success: true,
    message: "User get successfully",
    sellers,
  });
});

export const createSeller = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // Extract data from request body
  const {
    shopName,
    phoneNumber,
    shopAddress,
    zipCode,
    description,
    shopAvatar,
  } = req.body;

  // Validate required fields
  if (!shopName || !phoneNumber || !shopAddress || !zipCode) {
    return next(new AppError("Please provide all required fields", 400));
  }

  // Check if seller already exists for this user
  const existingSeller = await sellerSchema.findOne({ userId });
  if (existingSeller) {
    return next(
      new AppError("Seller profile already exists for this user", 400)
    );
  }

  // Check if shop name is already taken
  const shopNameExists = await sellerSchema.findOne({
    shopName: { $regex: new RegExp(`^${shopName}$`, "i") }, // Case insensitive check
  });
  if (shopNameExists) {
    return next(
      new AppError("Shop name already exists. Please choose another name", 400)
    );
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (user.role !== "seller") {
    user.role = "seller";
    await user.save();
  }
  // Create new seller
  const newSeller = await sellerSchema.create({
    userId,
    shopName: shopName.trim(),
    phoneNumber: phoneNumber.trim(),
    shopAddress: shopAddress.trim(),
    zipCode: zipCode.trim(),
    description: description?.trim() || "",
    shopAvatar: shopAvatar || null, // Cloudinary URL from frontend
  });

  // Populate user details if needed
  await newSeller.populate("userId", "name email");

  res.status(201).json({
    success: true,
    message: "Seller profile created successfully",
    seller: newSeller,
  });
});
export const sellerProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // Check if user exists and populate necessary fields
  const user = await User.findById(userId).select(
    "name email role avatar phoneNumber"
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if user has seller role
  if (user.role !== "seller") {
    return next(
      new AppError("Access denied. You are not registered as a seller", 403)
    );
  }

  // Find seller profile for the logged-in user
  const seller = await sellerSchema
    .findOne({ userId })
    .populate("userId", "name email avatar phoneNumber");

  if (!seller) {
    return next(
      new AppError(
        "Seller profile not found. Please create your seller profile first",
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    message: "Seller profile fetched successfully",
    seller: seller,
  });
});
export const updateShopAvatar = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { shopAvatar } = req.body;

  // Validate shopAvatar URL
  if (!shopAvatar) {
    return next(new AppError("Shop avatar URL is required", 400));
  }

  // Find seller profile
  const seller = await sellerSchema.findOne({ userId });

  if (!seller) {
    return next(
      new AppError(
        "Seller profile not found. Please create your seller profile first",
        404
      )
    );
  }

  // Update shop avatar
  seller.shopAvatar = shopAvatar;
  await seller.save();

  res.status(200).json({
    success: true,
    message: "Shop avatar updated successfully",
    seller: {
      shopAvatar: seller.shopAvatar,
    },
  });
});

export const updateShopProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  const { shopName, description, shopAddress, phoneNumber, zipCode } = req.body;

  // Find seller profile
  const seller = await sellerSchema.findOne({ userId });

  if (!seller) {
    return next(
      new AppError(
        "Seller profile not found. Please create your seller profile first",
        404
      )
    );
  }

  // Check if shop name is being changed and if new name already exists
  if (shopName && shopName.trim() !== seller.shopName) {
    const shopNameExists = await sellerSchema.findOne({
      shopName: { $regex: new RegExp(`^${shopName.trim()}$`, "i") },
      _id: { $ne: seller._id }, // Exclude current seller
    });

    if (shopNameExists) {
      return next(
        new AppError(
          "Shop name already exists. Please choose another name",
          400
        )
      );
    }
    seller.shopName = shopName.trim();
  }

  // Validate zipCode if provided
  if (zipCode && !/^\d{6}$/.test(zipCode.toString())) {
    return next(new AppError("Please provide a valid 6-digit zip code", 400));
  }

  // Update fields only if provided
  if (description !== undefined) seller.description = description.trim();
  if (shopAddress) seller.shopAddress = shopAddress.trim();
  if (phoneNumber) seller.phoneNumber = phoneNumber.toString().trim();
  if (zipCode) seller.zipCode = zipCode;

  await seller.save();

  // Populate user details
  await seller.populate("userId", "name email avatar");

  res.status(200).json({
    success: true,
    message: "Shop profile updated successfully",
    seller: seller,
  });
});
export const getSellerInfo = asyncHandler(async (req, res, next) => {
  const sellerId = req.params.id; // ✅ Ye seller ki userId hai (User model se)

  console.log("Fetching seller info for userId:", sellerId);

  // Step 1: Verify seller exists in User model
  const sellerUser = await User.findById(sellerId);
  if (!sellerUser) {
    return next(new AppError("Seller not found", 404));
  }

  // Step 2: Check if user is actually a seller
  if (sellerUser.role !== "seller") {
    return next(new AppError("This user is not a seller", 400));
  }

  // Step 3: Fetch seller profile (using userId reference)
  const seller = await sellerSchema.findOne({ userId: sellerId });
  if (!seller) {
    return next(new AppError("Seller profile not found", 404));
  }

  // Step 4: Fetch all products of this seller
  const products = await Product.find({ seller: sellerId });
  const totalProducts = products.length;

  // Step 5: Calculate average rating
  let totalRatingSum = 0;
  let totalReviewCount = 0;

  for (const product of products) {
    if (product.reviews && product.reviews.length > 0) {
      const productRatingSum = product.reviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      totalRatingSum += productRatingSum;
      totalReviewCount += product.reviews.length;
    }
  }

  const averageRating =
    totalReviewCount > 0 ? (totalRatingSum / totalReviewCount).toFixed(1) : 0;

  // Step 6: Response
  res.status(200).json({
    success: true,
    message: "Seller information fetched successfully",
    seller,
    totalProducts,
    averageRating: Number(averageRating),
  });
});
