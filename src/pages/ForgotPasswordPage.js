import React from "react";
import Header from "../components/Header";
import ForgotPassword from "../components/ForgotPassword";
import AsideLeft from "../components/AsideLeft";
import AsideRight from "../components/AsideRight";
import Footer from "../components/Footer";

const ForgotPasswordPage = () => {
  return (
    <div className="container">
      <Header />
      <div className="content">
        <AsideLeft />
        <ForgotPassword />
        <AsideRight />
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
