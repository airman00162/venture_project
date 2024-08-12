import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Signup() {
  // 회원가입 폼의 입력값을 관리하기 위한 상태 변수
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const navigate = useNavigate();

  // 회원가입 폼 제출 시 호출되는 함수
  const handleRegister = async (e) => {
    e.preventDefault(); // 페이지 리로드 방지

    try {
      // Firebase Authentication을 통해 이메일과 비밀번호로 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // 생성된 사용자 정보
      console.log(user);

      if (user) {
        // Firestore에 사용자 정보 저장
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: "", // 초기 프로필 사진을 빈 문자열로 설정
        });

        console.log("회원 가입 완료!!");
        // 회원가입 성공 알림
        toast.success("회원 가입 완료!!", {
          position: "top-center",
        });

        // 회원가입 후 홈 페이지로 이동
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
      // 회원가입 실패 시 에러 메시지 표시
      toast.error("회원 가입 실패: " + error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="signup">
      <div className="auth-wrapper">
        <div className="auth-inner">
          <form onSubmit={handleRegister}>
            <h3>회원가입</h3>
            <div className="mb-3">
              <label>성</label>
              <input type="text" className="form-control" placeholder="First name" value={fname} onChange={(e) => setFname(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>이름</label>
              <input type="text" className="form-control" placeholder="Last name" value={lname} onChange={(e) => setLname(e.target.value)} />
            </div>
            <div className="mb-3">
              <label>이메일 주소</label>
              <input type="email" className="form-control" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>비밀번호</label>
              <input type="password" className="form-control" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                회원가입
              </button>
            </div>
            <div className="password-login">
              <span className="forgot-password text-left">
                <a href="/forgot-password">비번 찾기</a>/비번 잊음
              </span>
              <span className="login-switch text-right">
                계정이 있다면/<a href="/login">로그인</a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
