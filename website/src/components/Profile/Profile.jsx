import React, { useState, useEffect } from "react";
import { AiOutlineCamera } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/styles";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "../cloudinaryConfig/uploadToCloudinary";
import {
  updateUserAvatar,
  updateUserInformation,
  clearError,
  clearSuccess,
} from "../../redux/user/userSlice";

const Profile = () => {
  const { user, message, success, error } = useSelector((state) => state.user);
  const [name, setName] = useState(user && user.name);
  const [email, setEmail] = useState(user && user.email);
  const [phoneNumber, setPhoneNumber] = useState(user && user.phoneNumber);
  const [nickName, setNickName] = useState(user && user.nickName);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();

  // ✅ Success aur Error handle karne ke liye useEffect
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

    if (success && message) {
      toast.success(message);
      dispatch(clearSuccess());
    }
  }, [error, success, message, dispatch]);

  // ✅ Component unmount hone par states clear karna
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      toast.error("Name is required!");
      return;
    }

    if (!email || email.trim() === "") {
      toast.error("Email is required!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (!phoneNumber) {
      toast.error("Phone number is required!");
      return;
    }

    if (phoneNumber.toString().length !== 10) {
      toast.error("Phone number must be exactly 10 digits!");
      return;
    }

    const formData = {
      name: name.trim(),
      email: email.trim(),
      phoneNumber,
      nickName: nickName.trim() || "",
    };

    dispatch(updateUserInformation(formData));
  };

  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    if (!file) return;
    setUploading(true);

    try {
      const result = await uploadToCloudinary(file, "user-avatar");

      if (result.success) {
        dispatch(updateUserAvatar({ userAvatar: result.url }));
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

  return (
    <div className="w-full">
      <div className="flex justify-center w-full">
        <div className="relative">
          <img
            src={
              user?.avatar ||
              "https://i.pinimg.com/1200x/87/cb/51/87cb5105534eb59bda373a9bee12b26a.jpg"
            }
            className="w-[150px] h-[150px] rounded-full object-cover border-[3px] border-[#3ad132]"
            alt="User Avatar"
          />
          <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[5px] right-[5px]">
            <input
              type="file"
              id="image"
              className="hidden"
              onChange={handleImage}
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
      <br />
      <br />
      <div className="w-full px-5">
        <form onSubmit={handleSubmit}>
          <div className="w-full min-[800px]:flex block pb-3">
            <div className="w-[100%] min-[800px]:w-[50%]">
              <label className="block pb-2">Full Name</label>
              <input
                type="text"
                className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-[100%] min-[800px]:w-[50%]">
              <label className="block pb-2">Email Address</label>
              <input
                type="text"
                className={`${styles.input} !w-[95%] mb-1 min-[800px]:mb-0`}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full min-[800px]:flex block pb-3">
            <div className="w-[100%] min-[800px]:w-[50%]">
              <label className="block pb-2">Phone Number</label>
              <input
                type="number"
                className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="w-[100%] min-[800px]:w-[50%]">
              <label className="block pb-2">Enter your Nick Name</label>
              <input
                type="text"
                className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
              />
            </div>
          </div>
          <input
            className="w-[250px] h-[40px] border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer"
            value="Update"
            type="submit"
          />
        </form>
      </div>
    </div>
  );
};

export default Profile;
