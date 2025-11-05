import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { clearError, clearSuccess } from "../../redux/user/userSlice";

// Import all separate components
import Profile from "./Profile";
import AllOrders from "./AllOrders";
import AllRefundOrders from "./AllRefundOrders";
import TrackOrderList from "./TrackOrderList";
import ChangePassword from "./ChangePassword";
import Address from "./Address";

const ProfileContent = ({ active }) => {
  const { error, message: successMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
    }
  }, [error, successMessage, dispatch]);

  return (
    <div className="w-full">
      {/* Profile Section */}
      {active === 1 && <Profile />}

      {/* Orders Section */}
      {active === 2 && <AllOrders />}

      {/* Refunds Section */}
      {active === 3 && <AllRefundOrders />}

      {/* Track Order Section */}
      {active === 5 && <TrackOrderList />}

      {/* Change Password Section */}
      {active === 6 && <ChangePassword />}

      {/* Address Section */}
      {active === 7 && <Address />}
    </div>
  );
};

export default ProfileContent;
