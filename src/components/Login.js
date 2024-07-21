import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSignupClick = () => {
    window.location.href = "/signup";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: "include", // 서버와 쿠키를 포함한 요청을 보내기 위해 설정
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // 로그인 성공 후 리다이렉트
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      // 에러 처리 로직 추가 (예: 사용자에게 알림을 표시하는 등)
    }
  };
  // 구글 소셜로그인
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3001/auth/google";
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <hr />
      <div>
        <button onClick={handleGoogleLogin}>Login with Google</button>
        <button onClick={handleSignupClick}>Go to signup</button>
      </div>
    </div>
  );
};

export default Login;
