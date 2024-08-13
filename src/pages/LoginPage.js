import React from "react";
import Header from "../components/Header";
import Login from "../components/Login";
import AsideLeft from "../components/AsideLeft";
import AsideRight from "../components/AsideRight";
import Footer from "../components/Footer";

const LoginPage = () => {
  return (
    <div className="container">
      <Header />
      <div className="content">
        <AsideLeft />
        <Login />
        <AsideRight />
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
