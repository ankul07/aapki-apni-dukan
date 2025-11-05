import React, { useState } from "react";
import styles from "../../styles/styles";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import api from "../../services/api";
const server = import.meta.env.VITE_SERVER;
import { toast } from "react-toastify";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const paymentSubmit = () => {
    if (
      address1 === "" ||
      address2 === "" ||
      zipCode === "" ||
      country === "" ||
      city === "" ||
      phoneNumber === ""
    ) {
      toast.error("Please fill all delivery address fields!");
    } else if (phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number!");
    } else {
      const shippingAddress = {
        address1,
        address2,
        zipCode,
        country,
        city,
      };

      const orderData = {
        cart,
        totalPrice,
        subTotalPrice,
        shipping,
        discountPrice,
        shippingAddress,
        user: {
          ...user,
          phoneNumber: phoneNumber,
        },
      };

      // update local storage with the updated orders array
      localStorage.setItem("latestOrder", JSON.stringify(orderData));
      navigate("/payment");
    }
  };

  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  // this is shipping cost variable
  const shipping = subTotalPrice * 0.1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = couponCode;

    await api.get(`${server}/coupon/get-coupon-value/${name}`).then((res) => {
      console.log(res.data);
      const shopId = res.data.couponCode?.shopId;
      const couponCodeValue = res.data.couponCode?.value;
      if (res.data.couponCode !== null) {
        const isCouponValid =
          cart && cart.filter((item) => item.shopId === shopId);

        if (isCouponValid.length === 0) {
          toast.error("Coupon code is not valid for this shop");
          setCouponCode("");
        } else {
          const eligiblePrice = isCouponValid.reduce(
            (acc, item) => acc + item.qty * item.discountPrice,
            0
          );
          const discountPrice = (eligiblePrice * couponCodeValue) / 100;
          setDiscountPrice(discountPrice);
          setCouponCodeData(res.data.couponCode);
          setCouponCode("");
        }
      }
      if (res.data.couponCode === null) {
        toast.error("Coupon code doesn't exists!");
        setCouponCode("");
      }
    });
  };

  const discountPercentenge = couponCodeData ? discountPrice : "";

  const totalPrice = couponCodeData
    ? (subTotalPrice + shipping - discountPercentenge).toFixed(2)
    : (subTotalPrice + shipping).toFixed(2);

  console.log(discountPercentenge);

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] min-[1000px]:w-[70%] block min-[800px]:flex">
        <div className="w-full min-[800px]:w-[65%]">
          <ShippingInfo
            user={user}
            country={country}
            setCountry={setCountry}
            city={city}
            setCity={setCity}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            address1={address1}
            setAddress1={setAddress1}
            address2={address2}
            setAddress2={setAddress2}
            zipCode={zipCode}
            setZipCode={setZipCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
          />
        </div>
        <div className="w-full min-[800px]:w-[35%] min-[800px]:mt-0 mt-8">
          <CartData
            handleSubmit={handleSubmit}
            totalPrice={totalPrice}
            shipping={shipping}
            subTotalPrice={subTotalPrice}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            discountPercentenge={discountPercentenge}
          />
        </div>
      </div>
      <div
        className={`${styles.button} w-[150px] min-[800px]:w-[280px] mt-10`}
        onClick={paymentSubmit}
      >
        <h5 className="text-white">Go to Payment</h5>
      </div>
    </div>
  );
};

const ShippingInfo = ({
  user,
  country,
  setCountry,
  city,
  setCity,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  setZipCode,
  phoneNumber,
  setPhoneNumber,
}) => {
  const handleSavedAddressSelect = (item) => {
    setAddress1(item.address1);
    setAddress2(item.address2);
    setZipCode(item.zipCode);
    setCountry(item.country);
    setCity(item.city);
  };

  return (
    <div className="w-full min-[800px]:w-[95%] bg-white rounded-md p-5 pb-8">
      <h5 className="text-[18px] font-[500]">Shipping Address</h5>
      <br />
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={user && user.name}
              required
              readOnly
              className={`${styles.input} !w-[95%] bg-gray-100`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={user && user.email}
              required
              readOnly
              className={`${styles.input} bg-gray-100`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setPhoneNumber(value);
                }
              }}
              placeholder="Enter 10 digit phone number"
              maxLength="10"
              className={`${styles.input} !w-[95%]`}
            />
            {phoneNumber && phoneNumber.length < 10 && (
              <p className="text-red-500 text-xs mt-1">
                Phone number must be 10 digits
              </p>
            )}
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">
              Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              placeholder="Enter zip code"
              className={`${styles.input}`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              className="w-[95%] border h-[40px] rounded-[5px] px-2"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              <option className="block pb-2" value="">
                Choose your country
              </option>
              {Country &&
                Country.getAllCountries().map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              className="w-[95%] border h-[40px] rounded-[5px] px-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={!country}
            >
              <option className="block pb-2" value="">
                Choose your City
              </option>
              {State &&
                State.getStatesOfCountry(country).map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">
              Address1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Enter address line 1"
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">
              Address2 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              required
              placeholder="Enter address line 2"
              className={`${styles.input}`}
            />
          </div>
        </div>
      </form>

      <h5
        className="text-[18px] cursor-pointer inline-block border-b-2 border-blue-500 text-blue-600 hover:text-blue-800 mt-4"
        onClick={() => setUserInfo(!userInfo)}
      >
        Choose From saved address
      </h5>

      {userInfo && (
        <div className="mt-4">
          {user && user.addresses && user.addresses.length > 0 ? (
            user.addresses.map((item, index) => (
              <div
                key={index}
                className="w-full flex items-center mt-3 p-2 border rounded hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="savedAddress"
                  className="mr-3 w-4 h-4 cursor-pointer"
                  onChange={() => handleSavedAddressSelect(item)}
                />
                <div>
                  <h2 className="font-semibold">{item.addressType}</h2>
                  <p className="text-sm text-gray-600">
                    {item.address1}, {item.address2}, {item.city},{" "}
                    {item.zipCode}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-2">No saved addresses found</p>
          )}
        </div>
      )}
    </div>
  );
};

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentenge,
}) => {
  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3>
        <h5 className="text-[18px] font-[600]">₹{subTotalPrice}</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">shipping:</h3>
        <h5 className="text-[18px] font-[600]">₹{shipping.toFixed(2)}</h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {discountPercentenge
            ? `- ₹${discountPercentenge.toFixed(2)}`
            : "- ₹0"}
        </h5>
      </div>
      <h5 className="text-[18px] font-[600] text-end pt-3">₹{totalPrice}</h5>
      <br />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={`${styles.input} h-[40px] pl-2`}
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          required
        />
        <input
          className={`w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] rounded-[3px] mt-8 cursor-pointer hover:bg-[#f63b60] hover:text-white transition-all`}
          required
          value="Apply code"
          type="submit"
        />
      </form>
    </div>
  );
};

export default Checkout;
