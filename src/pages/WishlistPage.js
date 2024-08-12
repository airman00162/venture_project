import React from "react";
import Header from "../components/Header";
import Wishlist from "../components/Wishlist";
import AsideLeft from "../components/AsideLeft";
import AsideRight from "../components/AsideRight";
import Footer from "../components/Footer";

const WishlistPage = () => {
  return (
    <div className="container">
      <Header />
      <div className="content">
        <AsideLeft />
        <Wishlist />
        <AsideRight />
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;
