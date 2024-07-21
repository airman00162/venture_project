import React from "react";
import { useState, useEffect } from "react";
import useCheckSession from "./useCheckSession";

const Header = () => {
  const { isLoggedIn, user } = useCheckSession();

  function handleLogout() {
    fetch("http://localhost:3001/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          window.location.reload();
        } else {
          throw new Error("Logout failed");
        }
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  }

  return (
    <div className="header">
      {isLoggedIn ? (
        <div>
          <p>Welcome, {user.nickname}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => (window.location.href = "/login")}>Login</button>
      )}
    </div>
  );
  // 도균이 파트 =네비게이션바 { 왼쪽에 홈버튼, 오른쪽에 3개( 로그인 로그아웃 찜목록 버튼)}
  // 막히는 부분있으면 개인카톡!
};

export default Header;
