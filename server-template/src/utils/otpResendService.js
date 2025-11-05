import AppError from "./AppError.js";
import { createOTPEmailContent } from "./emailTemplate.js";
import sendMail from "./email.helper.js";

/**
 * Handle email verification OTP resend
 * - Checks if email is already verified
 */
const handleEmailVerificationResend = async (user) => {
  if (user.isVerified) {
    throw new AppError("Email is already verified", 400);
  }

  return {
    purpose: "verifyEmail",
  };
};

/**
 * Handle device verification OTP resend
 * - Ensures email is verified before device verification
 */
const handleDeviceVerificationResend = async (user) => {
  if (!user.isVerified) {
    throw new AppError("Email must be verified before adding device", 400);
  }

  return {
    purpose: "verifyDevice",
  };
};

/**
 * Handle password reset OTP resend
 * - No specific validation needed
 */
const handlePasswordResetResend = async (user) => {
  return {
    purpose: "resetPassword",
  };
};

/**
 * Handle forgot password OTP resend
 * - Same as password reset
 */
const handleForgotPasswordResend = async (user) => {
  return {
    purpose: "forgotPassword",
  };
};

// OTP Resend handlers mapping
const resendHandlers = {
  verifyEmail: handleEmailVerificationResend,
  verifyDevice: handleDeviceVerificationResend,
  resetPassword: handlePasswordResetResend,
  forgotPassword: handleForgotPasswordResend,
};

/**
 * Main OTP resend processor
 * Routes to appropriate handler based on OTP purpose
 * Returns email configuration
 */
export const processOTPResend = async (user, otpPurpose) => {
  const handler = resendHandlers[otpPurpose];

  if (!handler) {
    throw new AppError("Invalid OTP purpose", 400);
  }

  // Run validation and get email config
  const emailConfig = await handler(user);

  return {
    purpose: emailConfig.purpose,
  };
};

/**
 * Send OTP email
 * - Generates email content based on purpose
 * - Sends email to user
 */
export const sendOTPEmail = async (user, otp, emailConfig) => {
  const { subject, message } = createOTPEmailContent(
    otp,
    emailConfig.messageType
  );

  await sendMail({
    email: user.email,
    subject,
    message,
  });
};

// Export individual handlers for testing
export {
  handleEmailVerificationResend,
  handleDeviceVerificationResend,
  handlePasswordResetResend,
  handleForgotPasswordResend,
};
