import React, { useState, useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { Country, State } from "country-state-city";
import { toast } from "react-toastify";
import {
  updateAddress,
  clearError,
  clearSuccess,
} from "../../redux/user/userSlice";

const Address = () => {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [addressType, setAddressType] = useState("");
  const { user, success, error, message } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const addressTypeData = [
    { name: "Default" },
    { name: "Home" },
    { name: "Office" },
  ];

  // Handle success
  useEffect(() => {
    if (success) {
      toast.success(message || "Address updated successfully!");
      dispatch(clearSuccess());
      setOpen(false);
      setCountry("");
      setCity("");
      setAddress1("");
      setAddress2("");
      setZipCode("");
      setAddressType("");
    }
  }, [success, message, dispatch]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(message || "Something went wrong!");
      dispatch(clearError());
    }
  }, [error, message, dispatch]);

  // Validation function
  const validateForm = () => {
    // Check if all required fields are filled
    if (!country || country.trim() === "") {
      toast.error("Please select a country!");
      return false;
    }

    if (!city || city.trim() === "") {
      toast.error("Please select a city!");
      return false;
    }

    if (!address1 || address1.trim() === "") {
      toast.error("Please enter Address 1!");
      return false;
    }

    if (address1.trim().length < 5) {
      toast.error("Address 1 must be at least 5 characters long!");
      return false;
    }

    if (!address2 || address2.trim() === "") {
      toast.error("Please enter Address 2!");
      return false;
    }

    if (address2.trim().length < 3) {
      toast.error("Address 2 must be at least 3 characters long!");
      return false;
    }

    if (!zipCode || zipCode.trim() === "") {
      toast.error("Please enter Zip Code!");
      return false;
    }

    // Validate zip code format (should be numeric and 4-10 digits)
    const zipCodeRegex = /^\d{4,10}$/;
    if (!zipCodeRegex.test(zipCode.trim())) {
      toast.error("Please enter a valid Zip Code (4-10 digits)!");
      return false;
    }

    if (!addressType || addressType.trim() === "") {
      toast.error("Please select an Address Type!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Create form data object
    const formData = {
      country: country.trim(),
      city: city.trim(),
      address1: address1.trim(),
      address2: address2.trim(),
      zipCode: zipCode.trim(),
      addressType: addressType.trim(),
    };

    // Dispatch action with form data
    dispatch(updateAddress(formData));
  };

  const handleDelete = (item) => {
    if (!item._id) {
      toast.error("Invalid address!");
      return;
    }

    // Confirm before deleting
    if (window.confirm("Are you sure you want to delete this address?")) {
      const id = item._id;
      // Uncomment when delete action is ready
      // dispatch(deleteUserAddress(id));
      toast.info("Delete functionality will be implemented soon!");
    }
  };

  return (
    <div className="w-full px-5">
      {/* Add New Address Modal */}
      {open && (
        <div className="fixed w-full h-screen bg-[#0000004b] top-0 left-0 flex items-center justify-center z-50">
          <div className="w-[90%] min-[800px]:w-[35%] h-[80vh] bg-white rounded shadow relative overflow-y-scroll">
            <div className="w-full flex justify-end p-3">
              <RxCross1
                size={30}
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>
            <h1 className="text-center text-[25px] font-Poppins">
              Add New Address
            </h1>
            <div className="w-full">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="w-full block p-4">
                  <div className="w-full pb-2">
                    <label className="block pb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px] px-2"
                    >
                      <option value="" className="block border pb-2">
                        Choose your country
                      </option>
                      {Country &&
                        Country.getAllCountries().map((item) => (
                          <option
                            className="block pb-2"
                            key={item.isoCode}
                            value={item.isoCode}
                          >
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="w-full pb-2">
                    <label className="block pb-2">
                      Choose your City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px] px-2"
                      disabled={!country}
                    >
                      <option value="" className="block border pb-2">
                        {country ? "Choose your city" : "Select country first"}
                      </option>
                      {State &&
                        State.getStatesOfCountry(country).map((item) => (
                          <option
                            className="block pb-2"
                            key={item.isoCode}
                            value={item.isoCode}
                          >
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="w-full pb-2">
                    <label className="block pb-2">
                      Address 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input}`}
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      placeholder="Street address, building number"
                    />
                  </div>

                  <div className="w-full pb-2">
                    <label className="block pb-2">
                      Address 2 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input}`}
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      placeholder="Apartment, suite, floor"
                    />
                  </div>

                  <div className="w-full pb-2">
                    <label className="block pb-2">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input}`}
                      value={zipCode}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");
                        setZipCode(value);
                      }}
                      placeholder="Enter zip code"
                      maxLength={10}
                    />
                  </div>

                  <div className="w-full pb-2">
                    <label className="block pb-2">
                      Address Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addressType}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px] px-2"
                    >
                      <option value="" className="block border pb-2">
                        Choose your Address Type
                      </option>
                      {addressTypeData &&
                        addressTypeData.map((item) => (
                          <option
                            className="block pb-2"
                            key={item.name}
                            value={item.name}
                          >
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="w-full pb-2">
                    <input
                      type="submit"
                      value="Submit"
                      className={`${styles.input} mt-5 cursor-pointer bg-blue-500 text-white hover:bg-blue-600`}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <h1 className="text-[25px] font-[600] text-[#000000ba] pb-2">
          My Addresses
        </h1>
        <div
          className={`${styles.button} !rounded-md`}
          onClick={() => setOpen(true)}
        >
          <span className="text-[#fff]">Add New</span>
        </div>
      </div>
      <br />

      {/* Address List */}
      {user &&
        user.addresses.map((item, index) => (
          <div
            className="w-full bg-white h-min min-[800px]:h-[70px] rounded-[4px] flex items-center px-3 shadow justify-between pr-10 mb-5"
            key={index}
          >
            <div className="flex items-center">
              <h5 className="pl-5 font-[600]">{item.addressType}</h5>
            </div>
            <div className="pl-8 flex items-center">
              <h6 className="text-[12px] min-[800px]:text-[unset]">
                {item.address1} {item.address2}
              </h6>
            </div>
            <div className="pl-8 flex items-center">
              <h6 className="text-[12px] min-[800px]:text-[unset]">
                {user && user.phoneNumber}
              </h6>
            </div>
            <div className="min-w-[10%] flex items-center justify-between pl-8">
              <AiOutlineDelete
                size={25}
                className="cursor-pointer"
                onClick={() => handleDelete(item)}
              />
            </div>
          </div>
        ))}

      {user && user.addresses.length === 0 && (
        <h5 className="text-center pt-8 text-[18px]">
          You do not have any saved address!
        </h5>
      )}
    </div>
  );
};

export default Address;
