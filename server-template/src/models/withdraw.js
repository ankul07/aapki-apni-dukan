import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller information is required"],
    },
    amount: {
      type: Number,
      required: [true, "Withdrawal amount is required"],
      min: [1, "Amount must be at least ₹1"],
    },
    status: {
      type: String,
      enum: ["Processing", "Approved", "Completed", "Rejected"],
      default: "Processing",
    },
  },
  {
    timestamps: true,
  }
);

export const Withdraw = mongoose.model("Withdraw", withdrawSchema);
