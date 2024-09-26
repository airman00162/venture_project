import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Post from "../components/Post";

const PostPage = () => {
  return (
    <div className="container">
      <Header />
      <div>
        <Post />
      </div>
      <Footer />
    </div>
  );
};

export default PostPage;
