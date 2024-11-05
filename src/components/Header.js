import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="header">
      <nav>
        <div className="nav-left">
          <button onClick={toggleMenu} className="menu-button">
            {isMenuOpen ? <img src="/icons/close.png" alt="Close Menu" className="icon" /> : <img src="/icons/open.png" alt="Open Menu" className="icon" />}
          </button>
        </div>
        <div className="nav-center">
          <button className="menu-button">
            <Link to="/">
              <h1>Finding Car</h1>
            </Link>
          </button>
        </div>
        <ul className="nav-right">
          <li>
            <button className="menu-button">
              <Link to="/login">
                <img src="/icons/login.png" alt="Login" className="icon" />
              </Link>
            </button>
          </li>
          <li>
            <button className="menu-button">
              <Link to="/wishlist">
                <img src="/icons/wishlist.png" alt="Wishlist" className="icon" />
              </Link>
            </button>
          </li>
        </ul>
      </nav>

      {/* 메뉴 리스트 - 헤더 아래에 표시됨 */}
      {isMenuOpen && (
        <div className="menu-list-container">
          <ul className="menu-list">
            <li>
              <Link to="/postlist" onClick={toggleMenu}>
                게시판
              </Link>
            </li>
            <li>
              <Link to="/list" onClick={toggleMenu}>
                이차어때
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Header;
