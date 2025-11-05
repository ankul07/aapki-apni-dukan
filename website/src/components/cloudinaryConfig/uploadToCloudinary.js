import api from "../../services/api";
import axios from "axios";
export async function uploadToCloudinary(file, folder = "uploads") {
  try {
    // 1. Get signature from your backend
    const signatureResponse = await api.post(
      `/user/signature`,
      { folder }, // shorthand for { folder: folder }
      {
        // If you’ve globally set Authorization header or using credentials-based JWT
        withCredentials: true, // if cookies are being used
      }
    );
    console.log("This is signature Response Data", signatureResponse);
    const signatureData = signatureResponse.data;

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signatureData.signature);
    formData.append("timestamp", signatureData.timestamp);
    formData.append("api_key", signatureData.apiKey);
    formData.append("folder", signatureData.folder);

    const uploadResponse = await axios.post(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      url: uploadResponse.data.secure_url,
      publicId: uploadResponse.data.public_id,
      data: uploadResponse.data,
    };
  } catch (error) {
    console.error("Upload failed:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Upload failed",
    };
  }
}
