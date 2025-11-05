import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/styles";
import { uploadToCloudinary } from "../cloudinaryConfig/uploadToCloudinary";
import { toast } from "react-toastify";
import {
  loadSeller,
  updateShopAvatar,
  updateShopProfile,
  clearError,
  clearSuccess,
} from "../../redux/seller/sellerSlice";

const ShopSettings = () => {
  const { seller, loading, success, error, message } = useSelector(
    (state) => state.seller
  );

  const [avatar, setAvatar] = useState();
  const [shopName, setshopName] = useState(seller && seller.shopName);
  const [description, setDescription] = useState(
    seller && seller.description ? seller.description : ""
  );
  const [shopAddress, setshopAddress] = useState(seller && seller.shopAddress);
  const [phoneNumber, setPhoneNumber] = useState(seller && seller.phoneNumber);
  const [zipCode, setZipcode] = useState(seller && seller.zipCode);
  const [uploading, setUploading] = useState(false);

  const dispatch = useDispatch();

  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);
    setAvatar(file);

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, "shop-avatar");

      if (result.success) {
        // Dispatch action to update avatar
        dispatch(updateShopAvatar({ shopAvatar: result.url }));
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();

    const formData = {
      shopName,
      description,
      shopAddress,
      phoneNumber,
      zipCode,
    };
    console.log(formData);
    // Dispatch action to update shop profile
    dispatch(updateShopProfile(formData));
  };

  useEffect(() => {
    dispatch(loadSeller());
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success(message);
      dispatch(clearSuccess());
    }
  }, [error, success, message, dispatch]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="flex w-full min-[800px]:w-[80%] flex-col justify-center my-5">
        <div className="w-full flex items-center justify-center">
          <div className="relative">
            <img
              src={avatar ? URL.createObjectURL(avatar) : seller.shopAvatar}
              alt=""
              className="w-[200px] h-[200px] rounded-full cursor-pointer object-cover"
            />
            <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px]">
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={handleImage}
                accept="image/*"
                disabled={uploading}
              />
              <label htmlFor="image" className="cursor-pointer">
                <AiOutlineCamera />
              </label>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <span className="text-white">Uploading...</span>
              </div>
            )}
          </div>
        </div>

        {/* shop info */}
        <form
          aria-required={true}
          className="flex flex-col items-center"
          onSubmit={updateHandler}
        >
          <div className="w-[100%] flex items-center flex-col min-[800px]:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Name</label>
            </div>
            <input
              type="name"
              placeholder={`${seller.shopName}`}
              value={shopName}
              onChange={(e) => setshopName(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
              required
            />
          </div>
          <div className="w-[100%] flex items-center flex-col min-[800px]:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop description</label>
            </div>
            <input
              type="name"
              placeholder={`${
                seller?.description
                  ? seller.description
                  : "Enter your shop description"
              }`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
            />
          </div>
          <div className="w-[100%] flex items-center flex-col min-[800px]:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Address</label>
            </div>
            <input
              type="name"
              placeholder={seller?.shopAddress}
              value={shopAddress}
              onChange={(e) => setshopAddress(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col min-[800px]:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Phone Number</label>
            </div>
            <input
              type="number"
              placeholder={seller?.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col min-[800px]:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Zip Code</label>
            </div>
            <input
              type="number"
              placeholder={seller?.zipCode}
              value={zipCode}
              onChange={(e) => setZipcode(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col min-[800px]:w-[50%] mt-5">
            <button
              type="submit"
              className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopSettings;
