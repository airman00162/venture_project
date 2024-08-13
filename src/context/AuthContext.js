import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"; // Firebase 인증 상태 변경을 감지하는 함수
import { auth, db } from "../firebase"; // Firebase 인증과 Firestore 데이터베이스 객체
import { doc, getDoc } from "firebase/firestore"; // Firestore에서 문서를 가져오는 함수

// 인증 상태와 사용자 정보를 관리하는 컨텍스트 생성
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 사용자 정보 상태 변수
  const [user, setUser] = useState(null);
  // 사용자 인증 여부를 나타내는 상태 변수
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 인증 상태 로딩 여부를 나타내는 상태 변수
  const [loading, setLoading] = useState(true);

  // 컴포넌트가 마운트될 때 Firebase 인증 상태 변화를 감지하고 처리
  useEffect(() => {
    // Firebase 인증 상태 변화를 감지하여 처리하는 함수
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 현재 사용자가 있을 경우 Firestore에서 사용자 데이터를 가져옴
        const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
        if (userDoc.exists()) {
          // Firestore에서 사용자 데이터를 가져온 경우, 사용자 상태 업데이트
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          // Firestore에 사용자 데이터가 없을 경우, 현재 사용자 정보만 설정
          setUser(currentUser);
        }
        setIsAuthenticated(true); // 인증 상태를 true로 설정
      } else {
        // 현재 사용자가 없을 경우, 사용자 상태 초기화
        setUser(null);
        setIsAuthenticated(false); // 인증 상태를 false로 설정
      }
      setLoading(false); // 로딩 상태를 false로 설정
    });

    // 컴포넌트가 언마운트될 때 Firebase 인증 상태 감지 구독 해제
    return () => unsubscribe();
  }, []);

  // 로그인 시 호출되는 함수
  const login = (userData) => {
    setUser(userData); // 사용자 상태 업데이트
    setIsAuthenticated(true); // 인증 상태를 true로 설정
  };

  // 로그아웃 시 호출되는 함수
  const logout = () => {
    setUser(null); // 사용자 상태 초기화
    setIsAuthenticated(false); // 인증 상태를 false로 설정
  };

  // 컨텍스트에서 제공할 값 정의
  const contextValue = {
    user, // 현재 사용자 정보
    isAuthenticated, // 사용자 인증 여부
    login, // 로그인 함수
    logout, // 로그아웃 함수
    loading, // 로딩 상태
  };

  // AuthContext.Provider를 통해 자식 컴포넌트들에게 인증 상태와 관련된 기능을 제공
  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? <p>Loading...</p> : children} {/* 로딩 중이면 로딩 메시지 표시, 그렇지 않으면 자식 컴포넌트 렌더링 */}
    </AuthContext.Provider>
  );
};
