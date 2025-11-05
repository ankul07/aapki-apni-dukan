import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Lottie from "lottie-react";
import animationData from "../assets/animations/107043-success.json";
import { FiCheckCircle } from "react-icons/fi";

const OrderSuccessPage = () => {
  return (
    <div>
      <Header />
      <Success />
      <Footer />
    </div>
  );
};

const Success = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Auto redirect to home page after 5 seconds
  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/");
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const handleViewOrders = () => {
    navigate("/profile?tab=orders");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-[600px] w-full bg-white rounded-lg shadow-lg p-8">
        {/* Success Animation */}
        <div className="flex justify-center mb-6">
          <Lottie
            animationData={animationData}
            loop={false}
            autoplay={true}
            style={{ width: 200, height: 200 }}
          />
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FiCheckCircle className="text-green-500 text-5xl" />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-3">
          Order Placed Successfully! 🎉
        </h2>

        <p className="text-center text-lg text-gray-600 mb-6">
          Thank you for your purchase! Your order has been confirmed and will be
          delivered soon.
        </p>

        {/* Order Details Box */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Order Status:</span>
            <span className="text-green-600 font-semibold">Confirmed ✓</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Status:</span>
            <span className="text-green-600 font-semibold">Successful ✓</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            Redirecting to home page in{" "}
            <span className="font-bold text-[#f63b60]">{countdown}</span>{" "}
            seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleViewOrders}
            className="flex-1 bg-[#f63b60] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#d63350] transition-all duration-300 transform hover:scale-105"
          >
            View My Orders
          </button>

          <button
            onClick={handleGoHome}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
          >
            Continue Shopping
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            📧 Order confirmation has been sent to your email
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
