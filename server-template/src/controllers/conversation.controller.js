import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { ConversationModel } from "../models/conversation.model.js";

// ✅ Create new conversation
export const createNewConversation = asyncHandler(async (req, res, next) => {
  const { groupTitle, userId, sellerId } = req.body;

  // Validation
  if (!userId || !sellerId) {
    return next(new AppError("userId and sellerId are required", 400));
  }

  // Check if conversation already exists
  const isConversationExist = await ConversationModel.findOne({ groupTitle });

  if (isConversationExist) {
    return res.status(200).json({
      success: true,
      conversation: isConversationExist,
    });
  }

  // Create new conversation
  const conversation = await ConversationModel.create({
    members: [userId, sellerId],
    groupTitle: groupTitle,
  });

  res.status(201).json({
    success: true,
    conversation,
  });
});

// ✅ Get all conversations for seller
export const getAllConversationSeller = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Seller ID is required", 400));
  }

  const conversations = await ConversationModel.find({
    members: {
      $in: [id],
    },
  }).sort({ updatedAt: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    conversations,
  });
});

// ✅ Get all conversations for user
export const getAllConversationUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("User ID is required", 400));
  }

  const conversations = await ConversationModel.find({
    members: {
      $in: [id],
    },
  }).sort({ updatedAt: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    conversations,
  });
});

// ✅ Update last message in conversation
export const updateLastMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { lastMessage, lastMessageId } = req.body;

  if (!id) {
    return next(new AppError("Conversation ID is required", 400));
  }

  if (!lastMessage || !lastMessageId) {
    return next(
      new AppError("lastMessage and lastMessageId are required", 400)
    );
  }

  const conversation = await ConversationModel.findByIdAndUpdate(
    id,
    {
      lastMessage,
      lastMessageId,
    },
    { new: true, runValidators: true }
  );

  if (!conversation) {
    return next(new AppError("Conversation not found", 404));
  }

  res.status(200).json({
    success: true,
    conversation,
  });
});
