import React from "react";
import Header from "../components/Header";
import Login from "../components/Login";
import Footer from "../components/Footer";

const LoginPage = () => {
  return (
    <div className="container">
      <Header />
      <div className="content">
        <Login />
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
