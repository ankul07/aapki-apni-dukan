import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaExclamationTriangle,
  FaRocket,
} from "react-icons/fa";
import { BiSad } from "react-icons/bi";
import { HiArrowLeft } from "react-icons/hi";
import { MdError } from "react-icons/md";

const NotFound = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center px-6 py-12 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-[15%] right-[10%] animate-bounce">
        <FaExclamationTriangle className="w-12 h-12 text-orange-400 opacity-60" />
      </div>
      <div className="absolute top-[60%] left-[8%] animate-bounce delay-300">
        <MdError className="w-16 h-16 text-red-400 opacity-50" />
      </div>
      <div className="absolute bottom-[20%] right-[15%] animate-bounce delay-500">
        <BiSad className="w-14 h-14 text-purple-400 opacity-60" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* 404 Number with Animation */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[250px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 leading-none animate-pulse">
            404
          </h1>

          {/* Decorative Elements around 404 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <FaRocket className="w-16 h-16 text-orange-500 animate-bounce" />
          </div>
          <div className="absolute bottom-0 left-1/4 translate-y-1/2">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full animate-ping"></div>
          </div>
          <div className="absolute bottom-0 right-1/4 translate-y-1/2">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full animate-ping delay-300"></div>
          </div>
        </div>

        {/* Sad Face Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <BiSad className="w-32 h-32 text-purple-600 animate-bounce" />
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          The page you're looking for seems to have wandered off into the
          digital void. Don't worry though, we'll help you find your way back!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/" className="group">
            <button className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden flex items-center gap-3">
              <HiArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="relative z-10">Go Back Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </Link>

          <Link to="/products" className="group">
            <button className="px-8 py-4 bg-white text-gray-800 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl border-2 border-purple-200 hover:border-purple-400 hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <FaSearch className="w-5 h-5 text-purple-600 group-hover:rotate-12 transition-transform duration-300" />
              Browse Products
            </button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border border-purple-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <FaHome className="w-5 h-5 text-purple-600" />
            Quick Links
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/"
              className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 text-gray-700 font-semibold"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="p-3 bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 text-gray-700 font-semibold"
            >
              Products
            </Link>
            <Link
              to="/events"
              className="p-3 bg-gradient-to-br from-orange-50 to-purple-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 text-gray-700 font-semibold"
            >
              Events
            </Link>
            <Link
              to="/faq"
              className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 text-gray-700 font-semibold"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-12">
          <p className="text-gray-500 italic text-sm">
            "Not all who wander are lost... but this page definitely is! 🗺️"
          </p>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute top-[25%] left-[5%] w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
      <div className="absolute top-[70%] right-[10%] w-2 h-2 bg-pink-400 rounded-full animate-ping delay-500"></div>
      <div className="absolute bottom-[30%] left-[15%] w-4 h-4 bg-orange-400 rounded-full animate-ping delay-1000"></div>
      <div className="absolute top-[40%] right-[20%] w-2 h-2 bg-purple-500 rounded-full animate-ping delay-700"></div>
    </section>
  );
};

export default NotFound;
