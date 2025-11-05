import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import sellerSchema from "../models/seller.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.js";
import { Event } from "../models/event.js";
export const getAllEventShop = asyncHandler(async (req, res, next) => {
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

  // Get all events of this seller
  const events = await Event.find({ seller: userId })
    .sort({ createdAt: -1 })
    .lean(); // Convert to plain JavaScript objects

  // Add seller info to each event
  const eventsWithSeller = events.map((event) => ({
    ...event,
    seller: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      shopName: sellerProfile.shopName,
      shopAvatar: sellerProfile.shopAvatar,
      shopAddress: sellerProfile.shopAddress,
      description: sellerProfile.description,
      zipCode: sellerProfile.zipCode,
    },
  }));

  res.status(200).json({
    success: true,
    count: eventsWithSeller.length,
    message: "Seller events fetched successfully",
    events: eventsWithSeller,
  });
});

export const createEvent = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  try {
    const {
      name,
      description,
      category,
      tags,
      originalPrice,
      discountPrice,
      stock,
      start_Date,
      Finish_Date,
      images,
      seller,
    } = req.body;

    // ✅ 1. Validate required fields
    if (!name || !description || !category || !discountPrice || !stock) {
      return next(new AppError("Please provide all required fields", 400));
    }

    if (!start_Date || !Finish_Date) {
      return next(new AppError("Event dates are required", 400));
    }

    if (!images || images.length === 0) {
      return next(new AppError("Please upload at least one image", 400));
    }

    // ✅ 3. Check if user is a seller
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.role !== "seller") {
      return next(
        new AppError(
          "Only sellers can create events. Please upgrade to seller account",
          403
        )
      );
    }

    // ✅ 4. Verify seller profile exists
    const sellerProfile = await sellerSchema.findOne({ userId });
    if (!sellerProfile) {
      return next(
        new AppError(
          "Seller profile not found. Please complete your seller profile first",
          404
        )
      );
    }

    // ✅ 5. Validate dates
    const startDate = new Date(start_Date);
    const finishDate = new Date(Finish_Date);
    const currentDate = new Date();

    if (startDate < currentDate) {
      return next(new AppError("Event start date cannot be in the past", 400));
    }

    if (finishDate <= startDate) {
      return next(new AppError("Event end date must be after start date", 400));
    }

    // ✅ 6. Validate prices
    if (originalPrice && discountPrice > originalPrice) {
      return next(
        new AppError(
          "Discount price cannot be greater than original price",
          400
        )
      );
    }

    // ✅ 7. Create event
    const event = await Event.create({
      name,
      description,
      category,
      tags: Array.isArray(tags) ? tags : [],
      originalPrice: originalPrice || null,
      discountPrice,
      stock,
      start_Date: startDate,
      Finish_Date: finishDate,
      images,
      seller: userId,
      status: "Running",
    });

    // ✅ 8. Send response
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return next(new AppError(error.message || "Failed to create event", 500));
  }
});

// Get all events of a specific shop/seller

export const deleteEvent = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const eventId = req.params.id;

  // Validate event ID
  if (!eventId) {
    return next(new AppError("Event ID is required", 400));
  }

  // Check if user is a seller
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "seller") {
    return next(new AppError("Only sellers can delete events", 403));
  }

  // Find the event
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check if the event belongs to this seller
  if (event.seller.toString() !== userId.toString()) {
    return next(
      new AppError("You are not authorized to delete this event", 403)
    );
  }

  // Delete event
  await Event.findByIdAndDelete(eventId);

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});
export const getAllEvents = asyncHandler(async (req, res, next) => {
  // Get all events
  const events = await Event.find()
    .populate("seller", "name email avatar")
    .sort({ createdAt: -1 }); // Latest first

  res.status(200).json({
    success: true,
    message: "Events fetched successfully",
    events,
  });
});
//admin event
// export const getAllEventsAdmin = asyncHandler(async (req, res, next) => {});
