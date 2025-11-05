import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxLength: [200, "Event name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxLength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    start_Date: {
      type: Date,
      required: [true, "Event start date is required"],
    },
    Finish_Date: {
      type: Date,
      required: [true, "Event finish date is required"],
      validate: {
        validator: function (v) {
          return v > this.start_Date;
        },
        message: "Finish date must be after start date",
      },
    },
    status: {
      type: String,
      enum: ["Running", "Completed", "Cancelled"],
      default: "Running",
    },
    originalPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      required: [true, "Event price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Event stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxLength: [500, "Comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // ✅ Seller reference (shopId + shop object ki jagah)
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller information is required"],
    },
    soldOut: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // ✅ Automatic createdAt & updatedAt
  }
);

export const Event = mongoose.model("Event", eventSchema);
