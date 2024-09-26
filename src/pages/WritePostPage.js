import React from "react";
import Header from "../components/Header";
import WritePost from "../components/WritePost";
import Footer from "../components/Footer";

const WritePostPage = () => {
  return (
    <div className="container">
      <Header />
      <div>
        <WritePost />
      </div>
      <Footer />
    </div>
  );
};

export default WritePostPage;
