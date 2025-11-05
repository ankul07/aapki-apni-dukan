import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import sellerSchema from "../models/seller.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";

export const createProduct = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // Check if user exists and is a seller
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "seller") {
    return next(new AppError("Only sellers can create products", 403));
  }

  // Check if seller profile exists
  const sellerProfile = await sellerSchema.findOne({ userId });
  if (!sellerProfile) {
    return next(
      new AppError(
        "Seller profile not found. Please create a seller profile first",
        404
      )
    );
  }

  // Extract and process data from req.body
  const {
    name,
    description,
    category,
    tags,
    originalPrice,
    discountPrice,
    stock,
    images,
  } = req.body;

  // Process tags (convert string to array if needed)
  const tagsArray =
    typeof tags === "string"
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      : tags;

  // Extract image URLs from cloudinary response
  const imageUrls = images.map((img) => img.url);

  // Create product
  const product = await Product.create({
    name,
    description,
    category,
    tags: tagsArray,
    originalPrice: Number(originalPrice),
    discountPrice: Number(discountPrice),
    stock: Number(stock),
    images: imageUrls,
    seller: userId,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});
export const getAllProductShop = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // Validate user ID
  if (!userId) {
    return next(new AppError("User ID is required", 400));
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if user is a seller
  if (user.role !== "seller") {
    return next(new AppError("User is not a seller", 400));
  }

  // Check if seller profile exists and get it
  const sellerProfile = await sellerSchema.findOne({ userId: userId });
  if (!sellerProfile) {
    return next(new AppError("Seller profile not found", 404));
  }

  // Get all products of this seller
  const products = await Product.find({ seller: userId })
    .sort({ createdAt: -1 })
    .lean(); // Convert to plain JavaScript objects

  // Add seller info to each product
  const productsWithSeller = products.map((product) => ({
    ...product,
    seller: {
      _id: user._id,
      name: user.name,
      email: user.email,
      shopName: sellerProfile.shopName,
      shopAvatar: sellerProfile.shopAvatar,
      shopAddress: sellerProfile.shopAddress,
      description: sellerProfile.description,
      phoneNumber: sellerProfile.phoneNumber,
      zipCode: sellerProfile.zipCode,
    },
  }));

  res.status(200).json({
    success: true,
    count: productsWithSeller.length,
    message: "Seller products fetched successfully",
    products: productsWithSeller,
  });
});
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const productId = req.params.id;

  // Validate product ID
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  // Check if user is a seller
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "seller") {
    return next(new AppError("Only sellers can delete products", 403));
  }

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check if the product belongs to this seller
  if (product.seller.toString() !== userId.toString()) {
    return next(
      new AppError("You are not authorized to delete this product", 403)
    );
  }

  // Delete product and cleanup references
  await Product.findByIdAndDelete(productId);

  // Cleanup: Remove product reviews references from User model if stored elsewhere
  // (Currently reviews are embedded in Product, so they'll be deleted automatically)

  // Optional: You can add additional cleanup here if needed
  // For example, if you have a separate Order model that references products,
  // you might want to handle that here

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
export const getAllProduct = asyncHandler(async (req, res, next) => {
  // Get all products
  const products = await Product.find()
    .populate("seller", "name email shopAvatar")
    .sort({ createdAt: -1 }); // Latest first

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    products,
  });
});
//admin route
export const adminGetAllProducts = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "admin") {
    return next(new AppError("Only admin can get products", 403));
  }
  const products = await Product.find().sort({
    createdAt: -1,
  });

  res.status(201).json({
    success: true,
    products,
  });
});

//review for a product
export const createNewReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId, orderId } = req.body; // user yahan se hata do

  // User authenticated middleware se milega
  const userId = req.user.id || req.user._id;

  // Product find karo
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Review object banao - user ID backend se use karo
  const review = {
    user: userId, // ✅ Backend se authenticated user
    rating,
    comment,
  };

  // Check karo - user ne pehle review kiya hai ya nahi
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === userId.toString()
  );

  if (isReviewed) {
    // Update existing review
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === userId.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    // Add new review
    product.reviews.push(review);
  }

  // Average rating calculate karo
  let totalRating = 0;
  product.reviews.forEach((rev) => {
    totalRating += rev.rating;
  });

  product.ratings = totalRating / product.reviews.length;

  // Product save karo
  await product.save({ validateBeforeSave: false });

  // Order me isReviewed flag true karo
  await Order.findByIdAndUpdate(
    orderId,
    { $set: { "cart.$[elem].isReviewed": true } },
    { arrayFilters: [{ "elem._id": productId }], new: true }
  );

  res.status(200).json({
    success: true,
    message: "Review added successfully!",
  });
});
