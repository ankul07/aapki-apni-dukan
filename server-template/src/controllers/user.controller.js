import { User } from "../models/user.model.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendToken } from "../utils/token.utils.js";
import sendMail from "../utils/email.helper.js";
import cloudinary from "../config/cloudinaryConfig.js";
import validator from "validator";
import { generateOTP, getOTPExpiry } from "../utils/otp.utils.js";
import { createOTPEmailContent } from "../utils/emailTemplate.js";
import { processOTPVerification } from "../utils/otpService.js";
import { processOTPResend, sendOTPEmail } from "../utils/otpResendService.js";
import sellerSchema from "../models/seller.model.js";
import { Product } from "../models/product.js";
import couponeCode from "../models/couponCode.model.js";
import { Event } from "../models/event.js";
export const deleteUsers = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const deleteIdRequest = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "admin") {
    return next(new AppError("Only admin can delete users", 403));
  }

  const userToDelete = await User.findById(deleteIdRequest);
  if (!userToDelete) {
    return next(new AppError("User to delete not found", 404));
  }

  if (userId.toString() === deleteIdRequest.toString()) {
    return next(new AppError("Admin cannot delete their own account", 400));
  }

  // ✅ AGAR USER SELLER HAI TOH USKA SAARA DATA DELETE KARO
  if (userToDelete.role === "seller") {
    // Delete seller profile
    await sellerSchema.deleteOne({ userId: deleteIdRequest });

    // Delete all products
    await Product.deleteMany({ seller: deleteIdRequest });

    // Delete all events
    await Event.deleteMany({ seller: deleteIdRequest });

    // Delete all coupon codes
    await couponeCode.deleteMany({ seller: deleteIdRequest });
  }

  // ✅ DELETE USER
  await User.findByIdAndDelete(deleteIdRequest);

  res.status(200).json({
    success: true,
    message:
      userToDelete.role === "seller"
        ? "Seller and all associated data deleted successfully"
        : "User deleted successfully",
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (user.role !== "admin") {
    return next(new AppError("Only admin can get all users", 403));
  }
  const users = await User.find().sort({
    createdAt: -1,
  });
  res.status(201).json({
    success: true,
    message: "User get successfully",
    users,
  });
});

export const updatedAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  const { country, city, address1, address2, zipCode, addressType } = req.body;

  // ✅ Validation: Check if all required fields are provided
  if (!country || !city || !address1 || !address2 || !zipCode || !addressType) {
    return next(new AppError("All address fields are required!", 400));
  }

  // ✅ Validation: Trim whitespace
  const trimmedCountry = country.trim();
  const trimmedCity = city.trim();
  const trimmedAddress1 = address1.trim();
  const trimmedAddress2 = address2.trim();
  const trimmedZipCode = zipCode.toString().trim();
  const trimmedAddressType = addressType.trim();

  // ✅ Validation: Check if fields are empty after trimming
  if (
    !trimmedCountry ||
    !trimmedCity ||
    !trimmedAddress1 ||
    !trimmedAddress2 ||
    !trimmedZipCode ||
    !trimmedAddressType
  ) {
    return next(new AppError("Address fields cannot be empty!", 400));
  }

  // ✅ Validation: Address1 minimum length
  if (trimmedAddress1.length < 5) {
    return next(
      new AppError("Address 1 must be at least 5 characters long!", 400)
    );
  }

  // ✅ Validation: Address2 minimum length
  if (trimmedAddress2.length < 3) {
    return next(
      new AppError("Address 2 must be at least 3 characters long!", 400)
    );
  }

  // ✅ Validation: Zip code format (4-10 digits)
  const zipCodeRegex = /^\d{4,10}$/;
  if (!zipCodeRegex.test(trimmedZipCode)) {
    return next(new AppError("Invalid zip code! Must be 4-10 digits.", 400));
  }

  // ✅ Validation: Address type should be valid
  const validAddressTypes = ["Default", "Home", "Office"];
  if (!validAddressTypes.includes(trimmedAddressType)) {
    return next(
      new AppError(
        "Invalid address type! Must be Default, Home, or Office.",
        400
      )
    );
  }

  // ✅ Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  // ✅ Check if address already exists (based on addressType)
  const existingAddressIndex = user.addresses.findIndex(
    (addr) => addr.addressType === trimmedAddressType
  );

  // ✅ Create new address object
  const newAddress = {
    country: trimmedCountry,
    city: trimmedCity,
    address1: trimmedAddress1,
    address2: trimmedAddress2,
    zipCode: parseInt(trimmedZipCode, 10),
    addressType: trimmedAddressType,
  };

  // ✅ If address type already exists, update it; otherwise, add new
  if (existingAddressIndex !== -1) {
    user.addresses[existingAddressIndex] = newAddress;
  } else {
    user.addresses.push(newAddress);
  }

  // ✅ Save user
  await user.save();

  // ✅ Send success response
  res.status(200).json({
    success: true,
    message:
      existingAddressIndex !== -1
        ? "Address updated successfully!"
        : "Address added successfully!",
    user: user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  // 2️⃣ Refresh token cookie clear karo
  res.clearCookie("refreshtoken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  // 3️⃣ Success response
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // Get passwords from request body
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // Validate required fields
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new AppError("All fields are required", 400));
  }

  // Validate new password length
  if (newPassword.length < 6) {
    return next(
      new AppError("New password must be at least 6 characters long", 400)
    );
  }

  // Check if new password matches confirm password
  if (newPassword !== confirmPassword) {
    return next(
      new AppError("New password and confirm password do not match", 400)
    );
  }

  // Check if new password is same as old password
  if (oldPassword === newPassword) {
    return next(
      new AppError("New password must be different from old password", 400)
    );
  }

  // Find user with password field (select: false by default)
  const user = await User.findById(userId).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Verify old password
  const isPasswordMatch = await user.comparePassword(oldPassword);

  if (!isPasswordMatch) {
    return next(new AppError("Old password is incorrect", 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const updateUserInfo = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  // Get data from request body
  const { name, email, phoneNumber, nickName } = req.body;

  // Validate required fields
  if (!name || !email) {
    return next(new AppError("Name and email are required", 400));
  }

  // Validate email format
  if (!validator.isEmail(email.trim())) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  // Validate phone number if provided
  if (phoneNumber && phoneNumber.trim() !== "") {
    if (!validator.isMobilePhone(phoneNumber.trim())) {
      return next(new AppError("Please provide a valid phone number", 400));
    }
  }

  // Find the current user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if new email already exists (if email is being changed)
  if (email.trim().toLowerCase() !== user.email) {
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      return next(new AppError("Email already in use by another account", 400));
    }
  }

  // Update user data
  user.name = name.trim();
  user.email = email.trim().toLowerCase();
  user.nickName = nickName ? nickName.trim() : "";
  if (phoneNumber && phoneNumber.trim() !== "") {
    user.phoneNumber = phoneNumber.trim();
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: user,
  });
});
//create user
export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  // 1. Validate required fields
  if (!name || !email || !password) {
    return next(new AppError("Name, email, and password are required", 400));
  }
  if (!validator.isEmail(email)) {
    return next(new AppError("Invalid email format", 400));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (!existingUser.isVerified) {
      if (existingUser.otpExpires > new Date()) {
        return next(
          new AppError(
            "Please verify the OTP sent to your email. You can request a new OTP if needed.",
            403
          )
        );
      }
      await User.findByIdAndDelete(existingUser._id);
    } else {
      return next(new AppError("Email already registered", 409));
    }
  }

  // 3. Generate OTP and set expiry
  const otp = generateOTP();
  const otpExpires = getOTPExpiry();

  const user = await User.create({
    name,
    email,
    password,
    otp,
    otpExpires,
    isVerified: false,
    trustedDevices: [],
  });
  // 5. Send verification email
  try {
    const { subject, message } = createOTPEmailContent(otp, true);
    await sendMail({
      email: user.email,
      subject,
      message,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    await User.findByIdAndDelete(user._id);
    return next(
      new AppError("Failed to send verification email. Please try again.", 500)
    );
  }

  const platform = req.headers["x-platform"] || "unknown";
  if (platform && platform !== "unknown") {
    req.session = req.session || {};
    req.session.pendingDeviceRegistration = {
      userId: user._id,
      platform,
      timestamp: Date.now(),
    };
  }
  user.password = undefined;
  user.otp = undefined;
  res.status(201).json({
    success: true,
    message:
      "User created successfully. Please check your email for the verification OTP.",
    otpPurpose: "verifyEmail",
  });
});
//verify otp
export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp, otpPurpose, deviceInfo } = req.body;
  if (!email || !otp) {
    return next(new AppError("Email and OTP are required", 400));
  }
  if (!otpPurpose) {
    return next(new AppError("OTP purpose is required", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (user.otp !== otp || user.otpExpires < new Date()) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  const result = await processOTPVerification(user, otpPurpose, deviceInfo);
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  if (result.requiresToken) {
    // Get platform from headers (default to web)
    const platform = req.headers["x-platform"] || "web";
    sendToken(result.user, 200, res, platform, result.message);
  } else {
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        email: result.user.email,
      },
    });
  }
});
//resend otp
export const resendOTP = asyncHandler(async (req, res, next) => {
  const { email, otpPurpose } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  if (!otpPurpose) {
    return next(new AppError("OTP purpose is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const emailConfig = await processOTPResend(user, otpPurpose);
  const otp = generateOTP();
  const otpExpires = getOTPExpiry();
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();
  try {
    await sendOTPEmail(user, otp, emailConfig);
    res.status(200).json({
      success: true,
      message: `New OTP for ${otpPurpose} sent successfully`,
      otpPurpose,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return next(
      new AppError("Failed to send verification email. Please try again.", 500)
    );
  }
});

export const authenticate = asyncHandler(async (req, res, next) => {
  const { email, password, deviceInfo } = req.body;

  // 1. Validate email and password
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  // 2. Validate device info - schema ke according saari required fields
  if (
    !deviceInfo ||
    !deviceInfo.deviceId ||
    !deviceInfo.userAgent ||
    !deviceInfo.platform
  ) {
    return next(new AppError("Device information is required", 400));
  }

  // 3. Find user by email
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  // 4. Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError("Invalid credentials", 401));
  }

  // 5. Check if email is verified
  if (!user.isVerified) {
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiry();

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      // Send OTP email
      const { subject, message } = createOTPEmailContent(otp, "verifyEmail");

      await sendMail({
        email: user.email,
        subject,
        message,
      });

      return res.status(200).json({
        success: true,
        message: "Your email is not verified. We've sent an OTP to your email.",
        email: user.email,
        otpPurpose: "verifyEmail", // ✅ Ye add karo
      });
    } catch (error) {
      return next(new AppError("Failed to send verification email", 500));
    }
  }

  // 6. Check if device is trusted
  const deviceIndex = user.trustedDevices.findIndex(
    (d) => d.deviceId === deviceInfo.deviceId && d.isActive
  );

  const isTrustedDevice = deviceIndex >= 0;

  if (isTrustedDevice) {
    // Update last used time for the device
    user.trustedDevices[deviceIndex].lastUsed = Date.now();
    await user.save();

    // Remove sensitive data
    user.password = undefined;

    // Get platform from headers
    // const platform = req.headers["x-platform"] || "web";

    // Send token and login
    sendToken(user, 200, res);
  } else {
    // New device detected - send OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiry();

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      // Send OTP email for device verification - correct purpose string
      const { subject, message } = createOTPEmailContent(otp, "verifyDevice");

      await sendMail({
        email: user.email,
        subject,
        message,
      });

      res.status(200).json({
        success: true,
        message:
          "We noticed a login attempt from a new device. Please verify with the OTP sent to your email.",
        email: user.email,
        otpPurpose: "verifyDevice",
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      return next(
        new AppError(
          "Failed to send verification email. Please try again.",
          500
        )
      );
    }
  }
});

//forgot-password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1. Validate email field
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  // 2. Validate email format
  if (!validator.isEmail(email)) {
    return next(new AppError("Invalid email format", 400));
  }

  // 3. Find user by email
  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    return next(
      new AppError(
        "No account found with this email. Please register first.",
        404
      )
    );
  }

  // 4. Check if email is verified
  // If not verified, send verification OTP instead
  if (!user.isVerified) {
    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = getOTPExpiry();

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      const { subject, message } = createOTPEmailContent(otp, "verifyEmail");

      await sendMail({
        email: user.email,
        subject,
        message,
      });

      return res.status(200).json({
        success: true,
        message:
          "Your email is not verified. We've sent a verification OTP to your email.",
        email: user.email,
        otpPurpose: "verifyEmail",
      });
    } catch (error) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      console.error("Email sending failed:", error);
      return next(
        new AppError(
          "Failed to send verification email. Please try again.",
          500
        )
      );
    }
  }

  // 5. Check for rate limiting (prevent OTP spam)
  // If OTP was sent recently (within 1 minute), don't send again
  if (user.otpExpires && user.otpExpires > new Date()) {
    const timeSinceLastOTP =
      Date.now() - (user.otpExpires.getTime() - 30 * 60 * 1000);
    const oneMinute = 60 * 1000;

    if (timeSinceLastOTP < oneMinute) {
      return next(
        new AppError(
          "OTP was sent recently. Please wait before requesting a new one.",
          429
        )
      );
    }
  }

  // 6. Generate new OTP
  const otp = generateOTP();
  const otpExpires = getOTPExpiry();

  // 7. Save OTP to user
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // 8. Send OTP email
  try {
    const { subject, message } = createOTPEmailContent(otp, "forgotPassword");

    await sendMail({
      email: user.email,
      subject,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset OTP has been sent to your email.",
      email: user.email,
      otpPurpose: "forgotPassword",
    });
  } catch (error) {
    // If email fails, clear the OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.error("Email sending failed:", error);
    return next(
      new AppError(
        "Failed to send password reset email. Please try again later.",
        500
      )
    );
  }
});
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  // 1. Validate required fields
  if (!email || !password || !confirmPassword) {
    return next(
      new AppError("Email, password, and confirm password are required", 400)
    );
  }

  // 2. Validate password match
  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  // 3. Validate password strength (optional but recommended)
  if (password.length < 6) {
    return next(
      new AppError("Password must be at least 6 characters long", 400)
    );
  }

  // 4. Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // 5. Update password (will be hashed by pre-save middleware)
  user.password = password;

  // 6. Clear OTP fields after successful password reset
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  // 7. Send success response
  res.status(200).json({
    success: true,
    message:
      "Password reset successful. You can now login with your new password.",
  });
});
//cloudinary signature
export const getCloudinarySignature = asyncHandler(async (req, res, next) => {
  try {
    // Current timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Optional: Get folder from request body or use default
    const folder = req.body.folder || "user-uploads";

    // Parameters for signature (add more as needed)
    const params = {
      timestamp: timestamp,
      folder: folder,
      // Optional: Add transformations
      // transformation: "w_500,h_500,c_fill",
      // resource_type: "image"
    };

    // Generate signature using Cloudinary's utility
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_CLIENT_SECRET
    );

    // Send response with all required data
    res.status(200).json({
      success: true,
      signature: signature,
      timestamp: timestamp,
      cloudName: process.env.CLOUDINARY_CLIENT_NAME,
      apiKey: process.env.CLOUDINARY_CLIENT_API,
      folder: folder,
    });
  } catch (error) {
    // console.error("Error generating Cloudinary signature:", error);
    return next(new AppError("Failed to generate signature", 500));
  }
});

export const profile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  const user = await User.findById(userId)
    .select(
      "-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires -trustedDevices -updatedAt"
    )
    .lean();

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: user, // ✅ Sab kuch automatically, no manual typing
  });
});
export const updateUserAvatar = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { userAvatar } = req.body;

  // Validate avatar URL
  if (!userAvatar) {
    return next(new AppError("User avatar URL is required", 400));
  }

  // Validate URL format
  if (!validator.isURL(userAvatar)) {
    return next(new AppError("Invalid avatar URL", 400));
  }

  // Find user
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update avatar
  user.avatar = userAvatar;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User avatar updated successfully",
    user: {
      avatar: user.avatar,
    },
  });
});

export const update = asyncHandler(async (req, res, next) => {});
