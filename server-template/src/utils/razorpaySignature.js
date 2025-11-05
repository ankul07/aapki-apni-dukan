import crypto from "crypto";

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - True if signature is valid, false otherwise
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    // Generate signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac("sha256", "5YgZ8KayyKRLkpfFqznn2P9d")
      .update(orderId + "|" + paymentId)
      .digest("hex");

    // Compare generated signature with received signature
    return generatedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};
