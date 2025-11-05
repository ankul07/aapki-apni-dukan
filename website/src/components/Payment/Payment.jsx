import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { useSelector } from "react-redux";
import api from "../../services/api";
import { toast } from "react-toastify";
const server = import.meta.env.VITE_SERVER;

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(orderData);
  }, []);

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
  };

  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault();

    order.paymentInfo = {
      type: "Cash On Delivery",
      status: "pending",
    };

    try {
      await api.post(`${server}/order/create-order`, order);
      navigate("/order/success");
      toast.success("Order placed successfully!");
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("latestOrder", JSON.stringify([]));
      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Order failed!");
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] min-[1000px]:w-[70%] block min-[800px]:flex">
        <div className="w-full min-[800px]:w-[65%]">
          <PaymentInfo
            user={user}
            orderData={orderData}
            order={order}
            cashOnDeliveryHandler={cashOnDeliveryHandler}
            navigate={navigate}
          />
        </div>
        <div className="w-full min-[800px]:w-[35%] min-[800px]:mt-0 mt-8">
          <CartData orderData={orderData} />
        </div>
      </div>
    </div>
  );
};

const PaymentInfo = ({
  user,
  orderData,
  order,
  cashOnDeliveryHandler,
  navigate,
}) => {
  const [select, setSelect] = useState(1);
  const [loading, setLoading] = useState(false);

  // ========================================
  // RAZORPAY PAYMENT HANDLER (Card Payment)
  // ========================================
  const razorpayPaymentHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create Razorpay Order
      const { data } = await api.post(
        `${server}/payment/razorpay/create-order`,
        {
          amount: Math.round(orderData?.totalPrice * 100), // Amount in paise
        }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Your Shop Name",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Step 2: Verify Payment
            const verifyResponse = await api.post(
              `${server}/payment/razorpay/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              // Step 3: Create Order in Database
              order.paymentInfo = {
                id: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                status: "succeeded",
                type: "Card",
              };

              await api.post(`${server}/order/create-order`, order);

              // Clear cart and navigate
              localStorage.setItem("cartItems", JSON.stringify([]));
              localStorage.setItem("latestOrder", JSON.stringify([]));

              toast.success("Payment successful!");
              navigate("/order/success");
              window.location.reload();
            }
          } catch (error) {
            toast.error("Payment verification failed!");
            console.error(error);
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phoneNumber,
        },
        theme: {
          color: "#f63b60",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Reset loading after modal opens
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || "Payment failed!");
      console.error(error);
    }
  };

  // ========================================
  // UPI PAYMENT HANDLER
  // ========================================
  const upiPaymentHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create Razorpay Order
      const { data } = await api.post(
        `${server}/payment/razorpay/create-order`,
        {
          amount: Math.round(orderData?.totalPrice * 100),
        }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Your Shop Name",
        description: "UPI Payment",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Step 2: Verify Payment
            const verifyResponse = await api.post(
              `${server}/payment/razorpay/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              // Step 3: Create Order with UPI payment info
              order.paymentInfo = {
                id: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                status: "succeeded",
                type: "UPI",
              };

              await api.post(`${server}/order/create-order`, order);

              // Clear cart and navigate
              localStorage.setItem("cartItems", JSON.stringify([]));
              localStorage.setItem("latestOrder", JSON.stringify([]));

              toast.success("UPI payment successful!");
              navigate("/order/success");
              window.location.reload();
            }
          } catch (error) {
            toast.error("Payment verification failed!");
            console.error(error);
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phoneNumber,
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: "All payment methods",
                instruments: [
                  {
                    method: "upi",
                    flows: ["intent"], // This enables direct app opening
                  },
                ],
              },
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        theme: {
          color: "#f63b60",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Reset loading after modal opens
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || "UPI payment failed!");
      console.error(error);
    }
  };

  return (
    <div className="w-full min-[800px]:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
      {/* Card Payment - Direct Razorpay */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center cursor-pointer"
            onClick={() => setSelect(1)}
          >
            {select === 1 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with Card / Net Banking / Wallet
          </h4>
        </div>

        {select === 1 ? (
          <div className="w-full flex border-b pb-5">
            <form className="w-full" onSubmit={razorpayPaymentHandler}>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
                  alt="Razorpay"
                  className="h-6"
                />
                <span className="text-sm text-gray-600">
                  Secure payment via Razorpay
                </span>
              </div>
              <input
                type="submit"
                value={loading ? "Processing..." : "Pay Now"}
                disabled={loading}
                className={`${
                  styles.button
                } !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </form>
          </div>
        ) : null}
      </div>

      <br />

      {/* UPI Payment */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center cursor-pointer"
            onClick={() => setSelect(2)}
          >
            {select === 2 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with UPI (Google Pay / PhonePe / Paytm)
          </h4>
        </div>

        {select === 2 ? (
          <div className="w-full flex border-b pb-5">
            <form className="w-full" onSubmit={upiPaymentHandler}>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/80/Google_Pay_Logo.svg"
                  alt="Google Pay"
                  className="h-8"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e9/PhonePe-Logo.wine.svg"
                  alt="PhonePe"
                  className="h-8"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo.svg"
                  alt="Paytm"
                  className="h-8"
                />
              </div>
              <input
                type="submit"
                value={loading ? "Processing..." : "Pay with UPI"}
                disabled={loading}
                className={`${
                  styles.button
                } !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </form>
          </div>
        ) : null}
      </div>

      <br />

      {/* Cash on Delivery */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center cursor-pointer"
            onClick={() => setSelect(3)}
          >
            {select === 3 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Cash on Delivery
          </h4>
        </div>

        {select === 3 ? (
          <div className="w-full flex">
            <form className="w-full" onSubmit={cashOnDeliveryHandler}>
              <input
                type="submit"
                value="Confirm"
                className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
              />
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping?.toFixed(2);
  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3>
        <h5 className="text-[18px] font-[600]">₹{orderData?.subTotalPrice}</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">shipping:</h3>
        <h5 className="text-[18px] font-[600]">₹{shipping}</h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.discountPrice ? "₹" + orderData.discountPrice : "-"}
        </h5>
      </div>
      <h5 className="text-[18px] font-[600] text-end pt-3">
        ₹{orderData?.totalPrice}
      </h5>
      <br />
    </div>
  );
};

export default Payment;
