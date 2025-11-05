import React from "react";
import styles from "../../styles/styles";
import ShopInfo from "../../components/shop/ShopInfo";
import ShopProfileData from "../../components/shop/ShopProfileData";

const ShopPreviewPage = () => {
  return (
    <div className={`${styles.section} bg-[#f5f5f5]`}>
      <div className="w-full min-[800px]:flex py-10 justify-between">
        <div className="min-[800px]:w-[25%] bg-[#fff] rounded-[4px] shadow-sm min-[800px]:overflow-y-scroll min-[800px]:h-[90vh] min-[800px]:sticky top-10 left-0 z-10">
          <ShopInfo isOwner={false} />
        </div>
        <div className="min-[800px]:w-[72%] mt-5 min-[800px]:mt-['unset'] rounded-[4px]">
          <ShopProfileData isOwner={false} />
        </div>
      </div>
    </div>
  );
};

export default ShopPreviewPage;
