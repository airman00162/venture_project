import { useState, useEffect } from "react";

const useCheckSession = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:3001/check-session", {
          credentials: "include", // 세션 쿠키 포함
        });

        if (!response.ok) {
          throw new Error("Failed to check session");
        }

        const data = await response.json();
        if (data.loggedIn) {
          setIsLoggedIn(true);
          setUser(data.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();
  }, []);
  console.log(isLoggedIn, user);
  return { isLoggedIn, user };
};

export default useCheckSession;

// 로그인 유무가 필요한 곳에 사용
// import useCheckSession from "./useCheckSession";
// const { isLoggedIn, user } = useCheckSession();
