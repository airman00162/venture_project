import React, { useEffect } from "react";
import { Link } from "react-router-dom";

// 네비게이션바 { 왼쪽에 홈버튼, 오른쪽에 3개( 로그인 로그아웃 찜목록 버튼)}
const Header = () => {
  useEffect(() => {
    const header = document.querySelector(".header");
    const setMarginTop = () => {
      document.body.style.marginTop = `${header.offsetHeight}px`;
    };
    setMarginTop();

    window.addEventListener("resize", setMarginTop);

    return () => {
      window.removeEventListener("resize", setMarginTop);
    };
  }, []);

  return (
    <div className="header">
      <nav>
        <ul className="nav-left">
          <li>
            <Link to="/">
              <img src="/icons/home.png" alt="Home" className="icon" />
            </Link>
          </li>
        </ul>
        <div className="nav-center">
          <h1>Finding Car</h1>
        </div>
        <ul className="nav-right">
          <li>
            <Link to="/login">
              <img src="/icons/login.png" alt="Login" className="icon" />
            </Link>
          </li>
          <li>
            <Link to="/login">
              <img src="/icons/login.png" alt="Login" className="icon" />
            </Link>
          </li>
          <li>
            <Link to="/wishlist">
              <img src="/icons/wishlist.png" alt="Wishlist" className="icon" />
            </Link>

          </li>
          <li>
            <Link to="/postlist">
              <img src="/icons/wishlist.png" alt="Postlist" className="icon" />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
export default Header;
