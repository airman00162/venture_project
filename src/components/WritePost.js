import React, { useState } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import styles from "./WritePost.module.css";

const WritePost = () => {
  // 로그인 상태 확인하고 아니면 전 페이지로 퇴장
  // 이메일 파이어베이스에서 가져오기
  let email = "email";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(title, content, category, email);

    try {
      const response = await fetch("http://localhost:3001/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category,
          email,
          // 유저 아이디도 같이 보내기
        }),
      });

      if (!response.ok) {
        // HTTP 상태 코드가 2xx가 아닌 경우 에러 처리
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Post created:", data);
      // 성공 메시지와 게시판페이지로 넘어가기
      alert("등록되었습니다.");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className={styles.postForm}>
      <h2>글쓰기</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">말머리</option>
            <option value="자유">자유</option>
            <option value="질문">질문</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength="100"
            placeholder="제목"
          />
        </div>
        <div>
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
          />
        </div>

        <button type="submit">작성</button>
      </form>
    </div>
  );
};

// Quill 에디터의 모듈 및 포맷 설정
const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"], // 'clean' 버튼은 서식을 제거합니다.
  ],
};

const formats = [
  "header",
  "font",
  "list",
  "bullet",
  "script",
  "indent",
  "direction",
  "size",
  "color",
  "background",
  "align",
  "link",
  "image",
];

export default WritePost;
