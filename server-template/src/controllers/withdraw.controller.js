import { User } from "../models/user.model.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import sendMail from "../utils/email.helper.js";
import { Withdraw } from "../models/withdraw.js";
import sellerSchema from "../models/seller.model.js";
export const updateWithdrawRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const withdrawId = req.params.id;
  const { sellerId } = req.body; // ✅ Ye seller document ki _id hai

  // ✅ Step 1: Check if logged-in user is admin
  const user = await User.findById(userId);
  if (!user || user.role !== "admin") {
    return next(new AppError("Access denied. Admin privileges required.", 403));
  }

  // ✅ Step 2: Find and update withdraw request
  const withdraw = await Withdraw.findByIdAndUpdate(
    withdrawId,
    {
      status: "succeed", // or "Approved" based on your flow
    },
    { new: true }
  );

  if (!withdraw) {
    return next(new AppError("Withdrawal request not found", 404));
  }

  // ✅ Step 3: Find seller profile by seller document ID
  const seller = await sellerSchema.findById(sellerId);
  if (!seller) {
    return next(new AppError("Seller profile not found", 404));
  }

  // ✅ Step 4: Create transaction object
  const transaction = {
    amount: withdraw.amount,
    status: withdraw.status,
    createdAt: withdraw.createdAt,
    updatedAt: new Date(),
  };

  // ✅ Step 5: Add transaction to seller's transactions array
  seller.transactions.push(transaction);
  await seller.save();

  // ✅ Step 6: Get seller's email from User model using seller.userId
  const sellerUser = await User.findById(seller.userId);
  if (!sellerUser) {
    return next(new AppError("Seller user not found", 404));
  }

  // ✅ Step 7: Send confirmation email
  try {
    await sendMail({
      email: sellerUser.email,
      subject: "Payment Confirmation - Withdrawal Request Approved",
      message: `Hello ${sellerUser.name},\n\nYour withdrawal request of ₹${withdraw.amount} has been approved and is on the way.\n\nDelivery time depends on your bank's processing rules and usually takes 3-7 business days.\n\nThank you for being a valued seller!\n\nBest regards,\nYour Team`,
    });
  } catch (error) {
    console.error("Email sending failed:", error.message);
    // Don't fail the request if email fails, just log it
  }

  // ✅ Step 8: Send success response
  res.status(200).json({
    success: true,
    message: "Withdrawal request updated successfully",
    withdraw,
  });
});

export const getAllWithdrawRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // Check if user exists
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if user is admin
  if (user.role !== "admin") {
    return next(new AppError("Only admins can access withdraw requests", 403));
  }

  // Fetch all withdraw requests sorted by newest first
  const withdraws = await Withdraw.find().sort({ createdAt: -1 });

  // Fetch shop details for each withdraw request
  const withdrawsWithShopInfo = await Promise.all(
    withdraws.map(async (withdraw) => {
      const shopInfo = await sellerSchema.findOne({
        userId: withdraw.seller,
      });

      return {
        _id: withdraw._id,
        amount: withdraw.amount,
        status: withdraw.status,
        createdAt: withdraw.createdAt,
        updatedAt: withdraw.updatedAt,
        seller: withdraw.seller, // Just seller ID
        shopInfo: shopInfo
          ? {
              shopName: shopInfo.shopName,
              phoneNumber: shopInfo.phoneNumber,
              description: shopInfo.description,
              shopAddress: shopInfo.shopAddress,
              shopAvatar: shopInfo.shopAvatar,
              zipCode: shopInfo.zipCode,
              availableBalance: shopInfo.availableBalance,
              withdrawMethod: shopInfo.withdrawMethod,
              shopId: shopInfo._id,
            }
          : null,
      };
    })
  );

  res.status(200).json({
    success: true,
    withdraws: withdrawsWithShopInfo,
  });
});

export const createWithdrawRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { amount } = req.body;

  // ✅ Amount validation
  if (!amount || amount <= 0) {
    return next(new AppError("Please provide a valid withdrawal amount", 400));
  }

  // ✅ User fetch karo (seller hona chahiye)
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "seller") {
    return next(
      new AppError("Only sellers can create withdrawal requests", 403)
    );
  }

  // ✅ Seller profile fetch karo
  const sellerProfile = await sellerSchema.findOne({ userId: userId });
  if (!sellerProfile) {
    return next(new AppError("Seller profile not found", 404));
  }

  // ✅ Check if seller has enough balance
  if (sellerProfile.availableBalance < amount) {
    return next(
      new AppError(
        `Insufficient balance. Available: ₹${sellerProfile.availableBalance}`,
        400
      )
    );
  }

  // ✅ Create withdrawal request
  const withdraw = await Withdraw.create({
    seller: userId,
    amount: Number(amount),
    status: "Processing",
  });

  // ✅ Deduct amount from seller's available balance
  sellerProfile.availableBalance -= Number(amount);

  // ✅ Add transaction to seller's transaction history
  sellerProfile.transactions.push({
    amount: Number(amount),
    status: "Processing",
    createdAt: new Date(),
  });

  await sellerProfile.save();

  // ✅ Send email notification to seller
  try {
    await sendMail({
      email: user.email,
      subject: "Withdrawal Request Submitted",
      message: `Hello ${user.name},\n\nYour withdrawal request of ₹${amount} has been submitted successfully.\n\nStatus: Processing\nExpected processing time: 3-7 business days.\n\nThank you!`,
    });
  } catch (error) {
    console.error("Email sending failed:", error.message);
    // Email fail hone par bhi withdrawal create ho jayega
  }

  res.status(201).json({
    success: true,
    message: "Withdrawal request created successfully",
    withdraw,
  });
});
