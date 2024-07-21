import React from "react";
import Header from "../components/Header";
import SignUp from "../components/Signup";
import Footer from "../components/Footer";

const SignUpPage = () => {
  return (
    <div className="container">
      <Header />
      <div className="content">
        <SignUp />
      </div>
      <Footer />
    </div>
  );
};

export default SignUpPage;
