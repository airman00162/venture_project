import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState, useContext } from "react";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import SignInwithGoogle from "./SignInwithGoogle";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  // 로그인 폼의 입력값을 관리하기 위한 상태 변수
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext); // 인증 상태를 관리하기 위한 컨텍스트 접근
  const navigate = useNavigate();

  // 로그인 폼 제출 시 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 페이지 리로드 방지

    try {
      // Firebase Authentication을 통해 이메일과 비밀번호로 로그인 시도
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      login(userCredential.user); // 로그인 성공 시 AuthContext의 상태 업데이트
      console.log("로그인 성공");

      // 로그인 성공 알림
      toast.success("로그인 성공", {
        position: "top-center",
      });

      // 로그인 후 홈 페이지로 이동
      navigate("/");
    } catch (error) {
      console.log(error.message);
      // 로그인 실패 시 에러 메시지 표시
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="login">
      <div className="auth-wrapper">
        <div className="auth-inner">
          <form onSubmit={handleSubmit}>
            <h3>로그인</h3>
            <div className="mb-3">
              <label>이메일 주소</label>
              <input type="email" className="form-control" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label>비밀 번호</label>
              <input type="password" className="form-control" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                로그인
              </button>
            </div>
            <div className="password-login">
              <span className="forgot-password">
                <a href="/forgot-password">비번 찾기</a>/비번 잊음
              </span>
              <span className="login-switch">
                계정이 없다면/<a href="/signup">회원가입</a>
              </span>
            </div>
            <SignInwithGoogle /> {/* 구글 로그인 컴포넌트 포함 */}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
