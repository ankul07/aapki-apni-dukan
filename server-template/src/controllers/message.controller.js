import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { MessagesModel } from "../models/message.model.js";
import { ConversationModel } from "../models/conversation.model.js";

// ✅ Create new message (with optional image)
export const createNewMessage = asyncHandler(async (req, res, next) => {
  const { conversationId, sender, text } = req.body;

  // Validation
  if (!conversationId || !sender || !text) {
    return next(
      new AppError("conversationId, sender, and text are required", 400)
    );
  }

  // Check if conversation exists
  const conversationExists = await ConversationModel.findById(conversationId);
  if (!conversationExists) {
    return next(new AppError("Conversation not found", 404));
  }

  // Prepare message data
  const messageData = {
    conversationId,
    sender,
    text,
  };

  // If image is uploaded (handle through multer middleware in route)
  if (req.file) {
    messageData.images = req.file.filename; // or req.file.path depending on your multer config
  }

  // Create message
  const message = await MessagesModel.create(messageData);

  // Update conversation's last message
  await ConversationModel.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    lastMessageId: message._id,
  });

  res.status(201).json({
    success: true,
    message,
  });
});

// ✅ Get all messages for a conversation
export const getAllMessages = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // conversationId

  if (!id) {
    return next(new AppError("Conversation ID is required", 400));
  }

  const messages = await MessagesModel.find({
    conversationId: id,
  }).sort({ createdAt: 1 }); // Oldest first

  res.status(200).json({
    success: true,
    messages,
  });
});
