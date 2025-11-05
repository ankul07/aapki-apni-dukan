import React from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";
import Banner from "../../../assets/banner.jpg";

const Hero = () => {
  return (
    <div
      className={` relative min-h-[70vh] min-[800px]:min-h-[80vh] w-full bg-no-repeat ${styles.noramlFlex}`}
      style={{
        backgroundImage: `url(${Banner})`,
      }}
    >
      <div className={`${styles.section} w-[90%] min-[800px]:w-[60%]`}>
        <p className="pt-5 text-center mt-2 text-[20px] font-[Poppins,sans-serif] font-[600] text-[#666363]">
          In the beginning, e-commerce was really about getting commodity
          products online as cheaply as possible. Now, we're moving into the
          more exciting phase of e-commerce, where it's about emotional products
          – the things people really cherish.
        </p>
        <Link to="/products" className="inline-block">
          <div
            style={{
              border: "none",
              padding: "1rem",
              borderRadius: "1rem",
              background: "red",
              outline: "none",
              marginLeft: "2rem",
              marginTop: "1rem",
            }}
          >
            <span className="text-[#fff] font-[Poppins,sans-serif] text-[18px]">
              Shop Now
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
