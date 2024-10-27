import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./PostList.module.css"; // CSS 모듈 import

const PostList = () => {
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 20; // 페이지당 게시글 수

  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState("title");

  const queryParams = new URLSearchParams(location.search);
  const term = queryParams.get("term") || "";
  const option = queryParams.get("option") || "";

  // 게시글 목록 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/posts?page=${currentPage}&limit=${POSTS_PER_PAGE}&term=${term}&option=${option}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const handleSearch = async (event) => {
    event.preventDefault();
    window.location.href = `/postlist?term=${keyword}&option=${searchType}`;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 작성일 변경 로직
  const formatDate = (dateStr) => {
    const postDate = new Date(dateStr);
    const now = new Date();

    // 오늘 작성 된 글이면 시간:분으로 표기
    if (postDate.toDateString() === now.toDateString()) {
      const hours = postDate.getHours().toString().padStart(2, "0");
      const minutes = postDate.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } else {
      return new Date(postDate).toLocaleDateString();
    }
  };

  const [paginationNumber, setPaginationNumber] = useState(1);
  useEffect(() => {
    setPaginationNumber(Math.ceil(currentPage / 5));
  }, [currentPage]); // 가능하면 페이지넘버가 바뀌어야 할 때만 바뀌는 코드로 바꾸기
  const pageButtons = [];

  for (
    let i = 1 + (paginationNumber - 1) * 5;
    i <= 5 + (paginationNumber - 1) * 5;
    i++
  ) {
    if (i <= totalPages) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={currentPage === i}
        >
          {i}
        </button>
      );
    }
  }
  const maskEmail = (email) => {
    const localPart = email.split("@")[0]; // 로컬 부분만 추출
    return `${localPart.slice(0, 2)}...`; // 앞 두 글자만 남기고 나머지는 '...'
  };

  return (
    <div className={styles.postListContainer}>
      <h1>게시판</h1>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.left}></div>
          <div className={styles.left}></div>
          <div className={styles.title} style={{ textAlign: "center" }}>
            제목
          </div>
          <div className={styles.right}>작성자</div>
          <div className={styles.right}>작성일</div>
          <div className={styles.right}>조회수</div>
        </div>
        {posts.map((post) => (
          <div key={post.id} className={styles.row}>
            <div className={styles.left}>{post.id}</div>
            <div className={styles.left}>[{post.category}]</div>
            <div className={styles.title}>
              <a href={`/post/${post.id}`}>
                {post.title}
                {post.comment_count ? (<span className={styles.comment_count}> {post.comment_count}</span>) : (null)}
              </a>
            </div>
            <div className={styles.title}></div>
            <div className={styles.right}>{maskEmail(post.author)}</div>
            {/* 닉네임으로 변환 */}
            <div className={styles.right}>{formatDate(post.created_at)}</div>
            <div className={styles.right}>{post.views}</div>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange((paginationNumber - 2) * 5 + 5)}
          hidden={paginationNumber === 1}
        >
          ◀️
        </button>
        {pageButtons}
        <button
          onClick={() => handlePageChange(paginationNumber * 5 + 1)}
          hidden={Math.ceil(totalPages / 5) <= paginationNumber}
        >
          ▶️
        </button>
      </div>

      <div className={styles.searchAndWrite}>
        <div></div>
        <div>
          <form onSubmit={handleSearch}>
            <div className={styles.search}>
              <select
                id="searchOption"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                required
              >
                <option value="title">제목</option>
                <option value="titleAndContent">제목 + 내용</option>
                <option value="author">글쓴이</option>
              </select>

              <input
                type="text"
                id="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                required
                maxLength="50"
              />

              <button type="submit">검색</button>
            </div>
          </form>
        </div>
        <div className={styles.write}>
          <a href="/write">글쓰기</a>
        </div>
      </div>
    </div>
  );
};

export default PostList;
