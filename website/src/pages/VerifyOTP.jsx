import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { MdEmail } from "react-icons/md";
import { BiRefresh } from "react-icons/bi";
import { getDeviceInfo } from "../utils/getDevice";
import {
  verifyOTP,
  clearError,
  clearSuccess,
  resendOTP,
} from "../redux/user/userSlice";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error, success, message } = useSelector(
    (state) => state.user
  );

  const [email, setEmail] = useState("");
  const [otpPurpose, setOtpPurpose] = useState("");

  // Get email and otpPurpose from navigation state or localStorage
  useEffect(() => {
    const stateEmail = location.state?.email;
    const stateOtpPurpose = location.state?.otpPurpose;

    if (stateEmail && stateOtpPurpose) {
      setEmail(stateEmail);
      setOtpPurpose(stateOtpPurpose);
      localStorage.setItem("tempEmail", stateEmail);
      localStorage.setItem("tempOtpPurpose", stateOtpPurpose);
    } else {
      const storedEmail = localStorage.getItem("tempEmail");
      const storedOtpPurpose = localStorage.getItem("tempOtpPurpose");

      if (storedEmail && storedOtpPurpose) {
        setEmail(storedEmail);
        setOtpPurpose(storedOtpPurpose);
      } else {
        toast.error("Session expired. Please try again.");
        navigate("/login");
      }
    }
  }, [location, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle success/error from Redux
  useEffect(() => {
    if (success) {
      if (isVerifying) {
        toast.success(message);
        localStorage.removeItem("tempEmail");
        localStorage.removeItem("tempOtpPurpose");
        dispatch(clearSuccess());

        // 🎯 Navigate based on OTP purpose
        if (otpPurpose === "forgotPassword") {
          // Forgot password verified - go to reset password page
          navigate("/reset-password", {
            state: {
              email,
              verified: true,
            },
          });
        } else {
          // verifyEmail or verifyDevice - go to dashboard
          navigate("/");
        }
      } else {
        // This was a resend OTP success
        toast.success(message || "OTP has been resent to your email");
        dispatch(clearSuccess());
      }
      setIsVerifying(false);
    }
    if (error) {
      toast.error(message);
      dispatch(clearError());
      setIsVerifying(false);
    }
  }, [
    success,
    error,
    message,
    navigate,
    dispatch,
    isVerifying,
    otpPurpose,
    email,
  ]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    const deviceInfo = getDeviceInfo();
    const formData = {
      email,
      otp: otpString,
      otpPurpose,
      deviceInfo,
    };
    dispatch(verifyOTP(formData));
  };

  const handleResendOTP = () => {
    if (!canResend) return;

    setIsVerifying(false);
    dispatch(resendOTP({ email, otpPurpose }));

    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0].focus();
  };

  // Dynamic heading based on purpose
  const getHeading = () => {
    switch (otpPurpose) {
      case "verifyEmail":
        return "Verify Your Email";
      case "verifyDevice":
        return "Verify New Device";
      case "forgotPassword":
        return "Verify Password Reset";
      default:
        return "Verify OTP";
    }
  };

  const getDescription = () => {
    switch (otpPurpose) {
      case "verifyEmail":
        return "We've sent a 6-digit verification code to";
      case "verifyDevice":
        return "We've sent a 6-digit code to verify your new device to";
      case "forgotPassword":
        return "We've sent a password reset code to";
      default:
        return "We've sent a 6-digit code to";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MdEmail className="text-blue-600 text-3xl" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {getHeading()}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {getDescription()}
        </p>
        <p className="text-center text-sm font-medium text-gray-900">{email}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                Enter OTP
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend OTP in{" "}
                  <span className="font-semibold text-blue-600">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <BiRefresh className="mr-1 text-lg" />
                  Resend OTP
                </button>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
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
                    Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("tempEmail");
                  localStorage.removeItem("tempOtpPurpose");
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
  );
};

export default VerifyOTP;
