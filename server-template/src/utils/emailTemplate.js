/**
 * Create OTP email content with dynamic purpose
 * @param {string} otp - The OTP code
 * @param {string} purpose - Purpose of OTP (verifyEmail, verifyDevice, resetPassword, forgotPassword)
 * @returns {object} - { subject, message }
 */
export const createOTPEmailContent = (otp, purpose = "verifyEmail") => {
  // Configuration for different purposes
  const configs = {
    verifyEmail: {
      subject: "Email Verification - Your OTP Code",
      title: "Verify Your Email",
      description:
        "Thank you for registering! Please use the following OTP to verify your email address:",
    },
    verifyDevice: {
      subject: "Device Verification - Your OTP Code",
      title: "Verify Your New Device",
      description:
        "A new device is trying to access your account. Please use the following OTP to verify:",
    },
    resetPassword: {
      subject: "Password Reset - Your OTP Code",
      title: "Reset Your Password",
      description:
        "You requested to reset your password. Please use the following OTP:",
    },
    forgotPassword: {
      subject: "Password Reset - Your OTP Code",
      title: "Reset Your Password",
      description:
        "You requested to reset your password. Please use the following OTP:",
    },
  };

  // Get config based on purpose (default to verifyEmail)
  const config = configs[purpose] || configs.verifyEmail;

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${config.title}</h2>
      <p style="font-size: 16px; color: #555;">
        ${config.description}
      </p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #4CAF50; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p style="font-size: 14px; color: #777;">
        This OTP is valid for <strong>30 minutes</strong>. Please do not share this code with anyone.
      </p>
      <p style="font-size: 14px; color: #777;">
        If you didn't request this, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return { subject: config.subject, message };
};

export const createWelcomeEmail = (name) => {
  const subject = "Welcome! Your Account is Verified";

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome, ${name}! 🎉</h2>
      <p style="font-size: 16px; color: #555;">
        Your email has been successfully verified. You can now access all features of our platform.
      </p>
      <p style="font-size: 14px; color: #777;">
        Thank you for joining us!
      </p>
    </div>
  `;

  return { subject, message };
};
