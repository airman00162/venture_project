import React from "react";
import Header from "../components/Header";
import Signup from "../components/Signup";
import AsideLeft from "../components/AsideLeft";
import AsideRight from "../components/AsideRight";
import Footer from "../components/Footer";

const SignUpPage = () => {
  return (
    <div className="container">
      <Header />
      <div className="content">
        <AsideLeft />
        <Signup />
        <AsideRight />
      </div>
      <Footer />
    </div>
  );
};

export default SignUpPage;
