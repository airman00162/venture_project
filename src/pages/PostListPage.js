import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PostList from "../components/PostList";

const PostListPage = () => {
  return (
    <div>
      <Header />
      <div>
        <PostList />
      </div>
      <Footer />
    </div>
  );
};

export default PostListPage;
