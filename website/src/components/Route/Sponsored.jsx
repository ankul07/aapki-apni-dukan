import React from "react";
import { FaApple, FaMicrosoft, FaGoogle, FaAmazon } from "react-icons/fa";
import { SiSamsung, SiSony, SiLg, SiDell } from "react-icons/si";

const Sponsored = () => {
  const brands = [
    {
      name: "Apple",
      icon: FaApple,
      color: "text-gray-800",
      bgColor: "bg-gray-100",
    },
    {
      name: "Samsung",
      icon: SiSamsung,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Microsoft",
      icon: FaMicrosoft,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      name: "Sony",
      icon: SiSony,
      color: "text-gray-900",
      bgColor: "bg-gray-100",
    },
    {
      name: "LG",
      icon: SiLg,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      name: "Dell",
      icon: SiDell,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Google",
      icon: FaGoogle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Amazon",
      icon: FaAmazon,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6 mb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Trusted By Leading Brands
          </h2>
          <p className="text-gray-600 text-lg">
            Join thousands of happy customers worldwide
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {brands.map((brand, index) => {
            const Icon = brand.icon;
            return (
              <div
                key={index}
                className={`${brand.bgColor} rounded-2xl p-6 flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer group`}
              >
                <Icon
                  className={`${brand.color} text-5xl mb-3 group-hover:scale-125 transition-transform duration-300`}
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                  {brand.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-2">
              50K+
            </h3>
            <p className="text-gray-600 font-medium">Products</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
              1M+
            </h3>
            <p className="text-gray-600 font-medium">Happy Customers</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">
              100+
            </h3>
            <p className="text-gray-600 font-medium">Brands</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
              24/7
            </h3>
            <p className="text-gray-600 font-medium">Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sponsored;
