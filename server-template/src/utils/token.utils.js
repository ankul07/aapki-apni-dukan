export const sendToken = (user, statusCode, res) => {
  // Generate JWT access and refresh tokens
  const accessToken = user.getAccessToken();
  const refreshToken = user.getRefreshToken();
  const userData = user.toObject();
  delete userData.password;
  delete userData.otpExpires;
  delete userData.otp;
  delete userData.resetPasswordOtp;
  delete userData.resetPasswordOtpExpires;
  delete userData.trustedDevices;
  delete userData.updatedAt;
  // Cookie options for storing the refresh token
  const refreshTokenOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    sameSite: "none",
    secure: true, // Allows requests from the same site; change to 'none' for cross-site cookies in production
  };

  // Send response with tokens and user data
  res
    .status(statusCode)
    .cookie("refreshtoken", refreshToken, refreshTokenOptions) // Set refresh token in HTTP-only cookie
    .json({
      success: true,
      message: "User Login Successfully",
      data: user, // Send user data (consider omitting sensitive fields)
      accessToken, // Send access token in response
    });
};
