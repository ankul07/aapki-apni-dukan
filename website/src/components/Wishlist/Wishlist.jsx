import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { BsCartPlus } from "react-icons/bs";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/wishlist/wishlistSlice";
import { addToCart } from "../../redux/cart/cartSlice";
import { toast } from "react-toastify";

const Wishlist = ({ setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const removeFromWishlistHandler = (id) => {
    dispatch(removeFromWishlist(id)); // Sirf _id pass kar rahe hain
    toast.success("Item removed from wishlist!");
  };

  const addToCartHandler = (data) => {
    const newData = { ...data, qty: 1 };
    dispatch(addToCart(newData));
    toast.success("Item added to cart!");
    setOpenWishlist(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-10">
      <div className="fixed top-0 right-0 h-full w-[80%] overflow-y-scroll min-[800px]:w-[25%] bg-white flex flex-col justify-between shadow-sm">
        {wishlist && wishlist.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={() => setOpenWishlist(false)}
              />
            </div>
            <h5>Wishlist Items is empty!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={() => setOpenWishlist(false)}
                />
              </div>
              {/* Item length */}
              <div className={`${styles.noramlFlex} p-4`}>
                <AiOutlineHeart size={25} />
                <h5 className="pl-2 text-[20px] font-medium">
                  {wishlist && wishlist.length} items
                </h5>
              </div>

              {/* Wishlist Single Items */}
              <br />
              <div className="w-full border-t">
                {wishlist &&
                  wishlist.map((i, index) => (
                    <WishlistSingle
                      key={index}
                      data={i}
                      removeFromWishlistHandler={removeFromWishlistHandler}
                      addToCartHandler={addToCartHandler}
                    />
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const WishlistSingle = ({
  data,
  removeFromWishlistHandler,
  addToCartHandler,
}) => {
  const totalPrice = data.discountPrice || data.price || 0;

  return (
    <div className="border-b p-4">
      <div className="w-full flex items-center justify-between">
        {/* Left side: Image and details */}
        <div className="flex items-center flex-1">
          <img
            src={data.images?.[0] || data.image || ""}
            alt={data.name}
            className="w-[80px] h-[80px] object-cover rounded-[5px]"
          />

          <div className="pl-[15px] flex-1">
            <h1 className="text-[16px] font-[500]">{data.name}</h1>
            <h4 className="font-semibold pt-[5px] text-[17px] text-[#d02222] font-Roboto">
              INR₹{totalPrice}
            </h4>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-3">
          {/* Add to Cart Button */}
          <div
            className="cursor-pointer bg-black rounded-full p-2 hover:bg-[#333] transition-all"
            title="Add to cart"
            onClick={() => addToCartHandler(data)}
          >
            <BsCartPlus size={20} color="#fff" />
          </div>

          {/* Remove from Wishlist Button */}
          <div
            className="cursor-pointer bg-red-500 rounded-full p-2 hover:bg-red-600 transition-all"
            title="Remove from wishlist"
            onClick={() => removeFromWishlistHandler(data._id)}
          >
            <RxCross1 size={18} color="#fff" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
