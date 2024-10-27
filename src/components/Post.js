import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // assuming you're using react-router
import styles from "./Post.module.css";
//import { auth } from "../firebase";
//import { useAuthState } from "react-firebase-hooks/auth";

// 게시글 데이터를 가져오는 함수
const getPost = async (postId, setPost) => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/post?postId=${postId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch post");
    }
    const data = await response.json();
    setPost(data);
  } catch (error) {
    console.error("Error fetching post:", error);
  }
};
// 게시글의 댓글 데이터를 가져오는 함수
const getComments = async (postId, setComments) => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/getComments?postId=${postId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch Comments");
    }
    const data = await response.json();
    // 댓글 배열에 대댓글 여닫기 불리언값 넣기
    const updatedData = data.map((comment) => ({
      ...comment,
      showReplyInput: false,
    }));
    setComments(updatedData);
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
};

const Post = () => {
  // 이메일 파이어베이스에서 가져오기
  // if(user){
  //   let email = user.email;
  // }
  let email = "email";
  const { postId } = useParams(); // URL에서 postId를 가져옴
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState({});

  useEffect(() => {
    getPost(postId, setPost);
    getComments(postId, setComments);
  }, [postId]);

  // 대댓글 여닫기 값 변경
  const handleToggleReplyInput = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, showReplyInput: !comment.showReplyInput }
          : comment
      )
    );
  };

  // 작성일 변경
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

  if (!post) {
    return <div>페이지가 존재하지 않습니다.</div>;
  }

  // 댓글 등록
  const handleCommentSubmit = async (e, parent_id = null) => {
    e.preventDefault();

    // 아무것도 입력하지 않거나 공백만 입력했을 때 리턴
    if (!(commentContent[parent_id] || "").trim()) {
      alert("내용을 입력해 주세요.");
      return;
    }

    const commentData = {
      postId,
      email,
      commentContent: commentContent[parent_id] || "",
      parent_id,
    };

    try {
      const response = await fetch("http://localhost:3001/api/addComments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        alert("댓글이 성공적으로 저장되었습니다.");
        setCommentContent((prevState) => ({ ...prevState, [parent_id]: "" }));
      } else {
        alert("댓글 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
    getComments(postId, setComments);
  };
  const maskEmail = (email) => {
    const localPart = email.split("@")[0]; // 로컬 부분만 추출
    return `${localPart.slice(0, 2)}...`; // 앞 두 글자만 남기고 나머지는 '...'
  };

  return (
    <div className={styles.postContainer}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          [{post.category}] {post.title}
        </h1>
        <div className={styles.meta}>
          <div>
            <span className={styles.author}>{maskEmail(post.author)}</span>
            <span>•</span>
            <span className={styles.date}>{formatDate(post.created_at)}</span>
            <span>•</span>
            <span className={styles.views}>👁️‍🗨️{post.views}</span>
            <span>•</span>
            <span className={styles.views}>👍{post.like_count}</span>
            {post.is_edited ? (
              <>
                <span>•</span>
                <span className={styles.views}>수정됨</span>
              </>
            ) : null}
          </div>
        </div>

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className={styles.likeAndEdit}>
          <div></div>
          <button>좋아요👍</button>
          {/* 이미 좋아요 눌렀으면 안올라가게 + 색깔 변경? */}
          <button>수정</button>
          {/* 게시글 수정 */}
        </div>
        {comments.map((comment) => (
          <div key={comment.id}>
            {comment.parent_id === null && (
              <div className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentMeta}>
                    <span className={styles.author}>{maskEmail(comment.author)}</span>
                    <span className={styles.date}>
                      {formatDate(comment.created_at)}
                    </span>
                    <span className={styles.edited}>{comment.is_edited}</span>
                  </div>
                  <div className={styles.likeContainer}>
                    {comment.showReplyInput ? (
                      <button
                        onClick={() => handleToggleReplyInput(comment.id)}
                        className={styles.likeAndReplyButton}
                      >
                        닫기
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleReplyInput(comment.id)}
                        className={styles.likeAndReplyButton}
                      >
                        댓글
                      </button>
                    )}
                    <button className={styles.likeAndReplyButton}>
                      좋아요👍({comment.like_count})
                    </button>
                  </div>
                </div>
                <div className={styles.content}>{comment.content}</div>
                {/* 대댓글 */}
                {comment.showReplyInput ? (
                  <div className={styles.commentInput}>
                    <form
                      className={styles.commentInputForm}
                      onSubmit={(e) => handleCommentSubmit(e, comment.id)}
                    >
                      <textarea
                        value={commentContent[comment.id] || ""}
                        onChange={(e) =>
                          setCommentContent((prevState) => ({
                            ...prevState,
                            [comment.id]: e.target.value,
                          }))
                        }
                        placeholder="댓글을 입력하세요..."
                      />
                      <button type="submit" className={styles.commentInputButton}>
                        답글 작성
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            )}

            {comments.map((reply) => (
              <div key={reply.id}>
                {reply.parent_id === comment.id && (
                  <div className={styles.reply}>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentMeta}>
                        <span className={styles.author}>{maskEmail(reply.author)}</span>
                        <span className={styles.date}>
                          {formatDate(reply.created_at)}
                        </span>
                        <span className={styles.edited}>{reply.is_edited}</span>
                      </div>
                      <div className={styles.likeContainer}>
                        <button className={styles.likeAndReplyButton}>
                          좋아요👍({reply.like_count})
                        </button>
                      </div>
                    </div>
                    <div className={styles.content}>{reply.content}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div className={styles.commentInput}>
          <form
            className={styles.commentInputForm}
            onSubmit={handleCommentSubmit}
          >
            <textarea
              value={commentContent[null] || ""}
              onChange={(e) =>
                setCommentContent((prevState) => ({
                  ...prevState,
                  [null]: e.target.value,
                }))
              }
              placeholder="댓글을 입력하세요..."
            />
            <button type="submit" className={styles.commentInputButton}>
              답글 작성
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Post;
