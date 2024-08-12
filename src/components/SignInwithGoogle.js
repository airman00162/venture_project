import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import { setDoc, doc } from "firebase/firestore";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // 경로 확인
import { useNavigate } from "react-router-dom";

function SignInwithGoogle() {
  const { login } = useContext(AuthContext); // 인증 상태를 관리하기 위한 컨텍스트 접근
  const navigate = useNavigate();

  // 구글 계정으로 로그인 처리하는 함수
  async function googleLogin() {
    const provider = new GoogleAuthProvider();
    try {
      // Google 팝업을 통해 로그인 시도
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      const user = result.user;

      if (user) {
        // Firestore에 사용자 정보 저장
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: user.displayName,
          photo: user.photoURL,
          lastName: "", // 구글 계정에서는 기본적으로 성 정보를 제공하지 않으므로 빈 문자열로 설정
        });

        // 로그인 상태 업데이트 및 알림
        login(user);
        toast.success("User logged in Successfully", {
          position: "top-center",
        });

        // 로그인 후 홈 페이지로 이동
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
      // 로그인 실패 시 에러 메시지 표시
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  }

  return (
    <div>
      <p className="continue-p">--또는 구글아이디로 로그인--</p>
      <div
        style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
        onClick={googleLogin} // 구글 로그인 버튼 클릭 시 로그인 함수 호출
      >
        <img
          src={require("../google.png")}
          width={"60%"}
          alt="Google Sign-In" // 구글 로그인 버튼 이미지
        />
      </div>
    </div>
  );
}

export default SignInwithGoogle;
