import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    cart: {
      type: Array,
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Processing",
    },
    paymentInfo: {
      id: {
        type: String,
      },
      status: {
        type: String,
      },
      type: {
        type: String,
        enum: [
          "Cash On Delivery",
          "Razorpay",
          "UPI - Google Pay",
          "UPI - PhonePe",
          "UPI - Paytm",
          "Card",
        ],
      },
      razorpayOrderId: {
        // ✅ Ye add karo
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
