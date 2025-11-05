import mongoose from "mongoose";
const sellerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ✅ User se link
    required: true,
    unique: true,
  },
  shopName: {
    type: String,
    required: [true, "Shop name is required"],
    trim: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    maxLength: [500, "Description cannot exceed 500 characters"],
    default: "",
  },
  shopAddress: {
    type: String,
    required: [true, "Shop address is required"],
    trim: true,
  },
  shopAvatar: {
    type: String,
    default: "",
  },
  zipCode: {
    type: Number,
    required: [true, "Zip code is required"],
    validate: {
      validator: function (v) {
        return /^\d{6}$/.test(v); // ✅ 6 digit validation
      },
      message: "Please provide a valid 6-digit zip code",
    },
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  withdrawMethod: {
    type: Object,
  },
  transactions: [
    {
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        default: "Processing",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const sellerSchema = new mongoose.model("seller", sellerProfileSchema);
export default sellerSchema;
