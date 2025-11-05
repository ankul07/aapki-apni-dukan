import crypto from "crypto";

export const generateOTP = () => {
  const buffer = crypto.randomBytes(3); // 3 bytes = 24 bits
  const number = parseInt(buffer.toString("hex"), 16);
  const otp = (number % 900000) + 100000; // Ensures 6-digit number
  return otp.toString();
};

export const getOTPExpiry = () => {
  return new Date(Date.now() + 30 * 60 * 1000);
};
export const isOTPExpired = (otpExpires) => {
  return new Date() > otpExpires;
};
export const verifyOTP = (inputOTP, storedOTP) => {
  return inputOTP === storedOTP;
};
