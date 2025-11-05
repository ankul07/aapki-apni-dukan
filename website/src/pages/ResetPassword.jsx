import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLock,
} from "react-icons/ai";
import { MdCheckCircle } from "react-icons/md";
import {
  clearError,
  clearSuccess,
  resetPassword,
} from "../redux/user/userSlice";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { loading, error, success, message } = useSelector(
    (state) => state.user
  );

  // Check if user came from OTP verification or has valid session
  useEffect(() => {
    const stateEmail = location.state?.email;
    const verified = location.state?.verified;

    if (stateEmail && verified) {
      // Fresh from OTP verification - store in localStorage
      setEmail(stateEmail);
      localStorage.setItem("resetEmail", stateEmail);
      localStorage.setItem("resetVerified", "true");
    } else {
      // Page refresh or direct access - check localStorage
      const storedEmail = localStorage.getItem("resetEmail");
      const storedVerified = localStorage.getItem("resetVerified");

      if (storedEmail && storedVerified === "true") {
        // Valid session exists
        setEmail(storedEmail);
      } else {
        // No valid session
        toast.error("Please verify OTP first");
        navigate("/forgot-password");
      }
    }
  }, [location, navigate]);

  // Handle success and error
  useEffect(() => {
    if (success) {
      toast.success(message || "Password reset successful!");

      // Clear localStorage
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetVerified");

      dispatch(clearSuccess());

      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }

    if (error) {
      toast.error(error.message || "Failed to reset password");
      dispatch(clearError());
    }
  }, [success, error, message, dispatch, navigate]);

  // Password validation
  const validatePassword = () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    if (!/(?=.*[a-z])/.test(password)) {
      toast.error("Password must contain at least one lowercase letter");
      return false;
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      toast.error("Password must contain at least one uppercase letter");
      return false;
    }

    if (!/(?=.*\d)/.test(password)) {
      toast.error("Password must contain at least one number");
      return false;
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      toast.error(
        "Password must contain at least one special character (@$!%*?&)"
      );
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    const formData = {
      email,
      password,
      confirmPassword,
    };

    await dispatch(resetPassword(formData));
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    if (strength <= 2) return { text: "Weak", color: "text-red-600" };
    if (strength <= 4) return { text: "Medium", color: "text-yellow-600" };
    return { text: "Strong", color: "text-green-600" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex items-center justify-center p-4">
      <div className="overflow-y-auto max-h-full w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-md py-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <AiOutlineLock className="text-blue-600 text-3xl" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a new password for your account
          </p>
          <p className="text-center text-sm font-medium text-gray-900">
            {email}
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md pb-8">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {showPassword ? (
                    <AiOutlineEye
                      className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-gray-600"
                      size={20}
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                      className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-gray-600"
                      size={20}
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
                {/* Password Strength Indicator */}
                {password && (
                  <p
                    className={`mt-1 text-sm ${passwordStrength.color} font-medium`}
                  >
                    Password strength: {passwordStrength.text}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {showConfirmPassword ? (
                    <AiOutlineEye
                      className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-gray-600"
                      size={20}
                      onClick={() => setShowConfirmPassword(false)}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                      className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-gray-600"
                      size={20}
                      onClick={() => setShowConfirmPassword(true)}
                    />
                  )}
                </div>
                {/* Match Indicator */}
                {confirmPassword && password && (
                  <div className="mt-1 flex items-center">
                    {password === confirmPassword ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <MdCheckCircle className="mr-1" />
                        Passwords match
                      </div>
                    ) : (
                      <p className="text-red-600 text-sm">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Password must contain:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    One uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    One lowercase letter (a-z)
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    One number (0-9)
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
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
                      Resetting Password...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("resetEmail");
                    localStorage.removeItem("resetVerified");
                    navigate("/login");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
