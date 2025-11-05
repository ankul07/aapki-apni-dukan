import { React, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RxAvatar } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { uploadToCloudinary } from "../cloudinaryConfig/uploadToCloudinary";
import {
  createSeller,
  clearError,
  clearSuccess,
} from "../../redux/seller/sellerSlice";

const ShopCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, message, seller } = useSelector(
    (state) => state.seller
  );

  const [shopName, setShopName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [description, setDescription] = useState("");
  const [shopAvatar, setShopAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  // Handle success and error from Redux
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

    if (success) {
      toast.success(
        `🎉 Congratulations! "${
          seller?.shopName || "Your shop"
        }" has been created successfully. You are now a seller!`
      );
      dispatch(clearSuccess());

      // Reset form
      setShopName("");
      setPhoneNumber("");
      setShopAddress("");
      setZipCode("");
      setDescription("");
      setShopAvatar(null);
      setAvatarPreview(null);

      // Navigate to seller dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  }, [error, success, seller, dispatch, navigate]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Shop Name validation
    if (!shopName.trim()) {
      newErrors.shopName = "Shop name is required";
    } else if (shopName.trim().length < 3) {
      newErrors.shopName = "Shop name must be at least 3 characters";
    }

    // Phone Number validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = "Please provide a valid 10-digit phone number";
    }

    // Shop Address validation
    if (!shopAddress.trim()) {
      newErrors.shopAddress = "Shop address is required";
    } else if (shopAddress.trim().length < 10) {
      newErrors.shopAddress = "Shop address must be at least 10 characters";
    }

    // Zip Code validation
    if (!zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (!/^\d{6}$/.test(zipCode.trim())) {
      newErrors.zipCode = "Please provide a valid 6-digit zip code";
    }

    // Description validation (optional but if provided, should be valid)
    if (description.trim() && description.trim().length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix all validation errors");
      return;
    }

    try {
      let shopAvatarUrl = null;

      // If user has selected an image, upload it to Cloudinary
      if (shopAvatar) {
        setUploading(true);
        toast.info("Uploading shop logo...");

        const uploadResult = await uploadToCloudinary(
          shopAvatar,
          "shop-avatars"
        );

        setUploading(false);

        if (uploadResult.success) {
          shopAvatarUrl = uploadResult.url;
          toast.success("Shop logo uploaded successfully!");
        } else {
          toast.error(uploadResult.error || "Failed to upload shop logo");
          return; // Stop submission if image upload fails
        }
      }

      // Prepare seller data with Cloudinary URL (not file object)
      const sellerData = {
        shopName: shopName.trim(),
        phoneNumber: phoneNumber.trim(),
        shopAddress: shopAddress.trim(),
        zipCode: zipCode.trim(),
        description: description.trim(),
        shopAvatar: shopAvatarUrl, // This is now a URL string from Cloudinary
      };

      // Dispatch Redux action
      dispatch(createSeller(sellerData));
    } catch (error) {
      console.error("Error creating seller profile:", error);
      toast.error(error.message || "Failed to create seller profile");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, JPG, PNG, WEBP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should not exceed 5MB");
        return;
      }

      setShopAvatar(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Become a Seller
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your shop and start selling
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[35rem]">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Shop Name */}
            <div>
              <label
                htmlFor="shopName"
                className="block text-sm font-medium text-gray-700"
              >
                Shop Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="shopName"
                  id="shopName"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  disabled={loading || uploading}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.shopName ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Enter your shop name"
                />
                {errors.shopName && (
                  <p className="mt-1 text-sm text-red-500">{errors.shopName}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading || uploading}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Shop Address */}
            <div>
              <label
                htmlFor="shopAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Shop Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <textarea
                  name="shopAddress"
                  id="shopAddress"
                  required
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  disabled={loading || uploading}
                  rows="3"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.shopAddress ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Enter complete shop address"
                />
                {errors.shopAddress && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.shopAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Zip Code */}
            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700"
              >
                Zip Code <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="zipCode"
                  id="zipCode"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={loading || uploading}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.zipCode ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Enter 6-digit zip code"
                  maxLength="6"
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                )}
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Shop Description{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading || uploading}
                  rows="4"
                  maxLength="500"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Tell customers about your shop (max 500 characters)"
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.description && (
                      <p className="text-sm text-red-500">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {description.length}/500
                  </p>
                </div>
              </div>
            </div>

            {/* Shop Avatar with Loading Animation */}
            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              >
                Shop Logo{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="mt-2 flex items-center">
                <span className="inline-block h-16 w-16 rounded-full overflow-hidden border-2 border-gray-300 relative">
                  {uploading ? (
                    // Loading Spinner Animation
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Shop avatar preview"
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <RxAvatar className="h-full w-full text-gray-400" />
                  )}
                </span>
                <label
                  htmlFor="file-input"
                  className={`ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                    loading || uploading
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <span>{uploading ? "Uploading..." : "Upload Logo"}</span>
                  <input
                    type="file"
                    name="avatar"
                    id="file-input"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    disabled={loading || uploading}
                    className="sr-only"
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended: Square image, max 5MB (JPEG, PNG, WEBP)
              </p>
              {uploading && (
                <p className="mt-1 text-xs text-blue-600 font-medium">
                  Uploading image to Cloudinary...
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || uploading}
                className={`group relative w-full h-[40px] flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  loading || uploading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Profile...
                  </>
                ) : (
                  "Create Seller Profile"
                )}
              </button>
            </div>

            {/* Back to Dashboard Link */}
            <div className="flex items-center justify-center w-full">
              <h4 className="text-sm text-gray-600">Changed your mind?</h4>
              <Link
                to="/profile"
                className="text-blue-600 pl-2 text-sm hover:underline"
              >
                Back to Profile
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopCreate;
