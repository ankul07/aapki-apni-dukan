import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    text: {
      type: String,
    },
    sender: {
      type: String,
    },
    images: {
      type: String,
    },
  },
  { timestamps: true }
);

export const MessagesModel = mongoose.model("Messages", messagesSchema);
