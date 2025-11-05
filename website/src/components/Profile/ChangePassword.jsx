import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/styles";
import { toast } from "react-toastify";
import {
  changePassword,
  clearError,
  clearSuccess,
} from "../../redux/user/userSlice";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, message, success, error } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const passwordChangeHandler = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (oldPassword.trim() === "") {
      toast.error("Please enter your current password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword === oldPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    const formData = {
      oldPassword: oldPassword.trim(),
      newPassword: newPassword.trim(),
      confirmPassword: confirmPassword.trim(),
    };

    dispatch(changePassword(formData)).then((res) => {
      if (res.payload?.success === true) {
        toast.success(res.payload.message || "");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <div className="w-full px-5">
      <h1 className="block text-[25px] text-center font-[600] text-[#000000ba] pb-2">
        Change Password
      </h1>
      <div className="w-full">
        <form
          onSubmit={passwordChangeHandler}
          className="flex flex-col items-center"
        >
          {/* Old Password */}
          <div className="w-[100%] min-[800px]:w-[50%] mt-5">
            <label className="block pb-2">Enter your old password</label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <div
                className="absolute right-8 top-3 cursor-pointer"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? (
                  <AiOutlineEye size={20} />
                ) : (
                  <AiOutlineEyeInvisible size={20} />
                )}
              </div>
            </div>
          </div>

          {/* New Password */}
          <div className="w-[100%] min-[800px]:w-[50%] mt-2">
            <label className="block pb-2">Enter your new password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div
                className="absolute right-8 top-3 cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <AiOutlineEye size={20} />
                ) : (
                  <AiOutlineEyeInvisible size={20} />
                )}
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="w-[100%] min-[800px]:w-[50%] mt-2">
            <label className="block pb-2">Enter your confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`${styles.input} !w-[95%] mb-4 min-[800px]:mb-0`}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div
                className="absolute right-8 top-3 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <AiOutlineEye size={20} />
                ) : (
                  <AiOutlineEyeInvisible size={20} />
                )}
              </div>
            </div>

            <input
              className="w-[95%] h-[40px] border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer hover:bg-[#3a24db] hover:text-white transition-all duration-300"
              value="Update"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
