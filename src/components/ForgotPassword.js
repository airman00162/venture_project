import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("비밀번호 재설정 이메일이 전송되었습니다.", {
        position: "top-center",
      });
    } catch (error) {
      console.error(error);
      toast.error("비밀번호 재설정 이메일 전송에 실패했습니다: " + error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="forgot-password">
      <div className="auth-wrapper">
        <div className="auth-inner">
          <form onSubmit={handlePasswordReset}>
            <h3>비밀번호 찾기</h3>
            <div className="mb-3">
              <label>이메일 주소</label>
              <input type="email" className="form-control" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                비밀번호 재설정 링크 보내기
              </button>
            </div>
            <div className="password-login">
              <span className="forgot-password"> </span>
              <span className="login-switch">
                계정을 등록 했다면/<a href="/login">로그인</a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
