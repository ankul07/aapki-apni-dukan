import AppError from "./AppError.js";

/**
 * Handle email verification OTP
 * - Marks user email as verified
 * - Adds device to trusted devices
 */
const handleEmailVerification = async (user, deviceInfo) => {
  user.isVerified = true;

  // Add device to trusted devices if provided
  if (deviceInfo && deviceInfo.deviceId) {
    if (typeof user.addTrustedDevice === "function") {
      user.addTrustedDevice(deviceInfo);
    } else {
      user.trustedDevices.push(deviceInfo);
    }
  }

  await user.save();
  return user;
};

/**
 * Handle device verification OTP
 * - Only adds new device to trusted list
 * - Requires email to be already verified
 */
const handleDeviceVerification = async (user, deviceInfo) => {
  // Check if email is verified
  if (!user.isVerified) {
    throw new AppError("Email must be verified before adding device", 400);
  }

  // Device info is mandatory for device verification
  if (!deviceInfo || !deviceInfo.deviceId) {
    throw new AppError("Device information is required", 400);
  }

  // Add device to trusted devices
  if (typeof user.addTrustedDevice === "function") {
    user.addTrustedDevice(deviceInfo);
  } else {
    user.trustedDevices.push(deviceInfo);
  }

  await user.save();
  return user;
};

/**
 * Handle password reset OTP
 * - Validates OTP for password reset flow
 * - Does not modify user verification status
 */
const handlePasswordReset = async (user, deviceInfo) => {
  // Password reset logic will be implemented here
  // For now, just validate that user exists and OTP is valid
  // Actual password update will happen in a separate endpoint

  await user.save();
  return user;
};

/**
 * Handle forgot password OTP
 * - Similar to password reset
 * - Validates OTP for forgot password flow
 */
const handleForgotPassword = async (user, deviceInfo) => {
  // Forgot password logic will be implemented here
  // This is typically the same as password reset
  // You might want to merge these two handlers

  await user.save();
  return user;
};

/**
 * Main OTP verification processor
 * Routes to appropriate handler based on OTP purpose
 * Returns object with user and response metadata
 */
const otpHandlers = {
  verifyEmail: handleEmailVerification,
  verifyDevice: handleDeviceVerification,
  resetPassword: handlePasswordReset,
  forgotPassword: handleForgotPassword,
};

// Response configurations for different OTP purposes
const responseConfigs = {
  verifyEmail: {
    requiresToken: true,
    message: "Email verified successfully",
  },
  verifyDevice: {
    requiresToken: true,
    message: "Device verified successfully",
  },
  resetPassword: {
    requiresToken: true,
    message: "OTP verified. You can now reset your password",
  },
  forgotPassword: {
    requiresToken: false,
    message: "OTP verified. You can now reset your password",
  },
};

export const processOTPVerification = async (user, otpPurpose, deviceInfo) => {
  const handler = otpHandlers[otpPurpose];

  if (!handler) {
    throw new AppError("Invalid OTP purpose", 400);
  }

  const updatedUser = await handler(user, deviceInfo);
  const responseConfig = responseConfigs[otpPurpose];

  return {
    user: updatedUser,
    requiresToken: responseConfig.requiresToken,
    message: responseConfig.message,
  };
};

// Export individual handlers for testing purposes
export {
  handleEmailVerification,
  handleDeviceVerification,
  handlePasswordReset,
  handleForgotPassword,
};
