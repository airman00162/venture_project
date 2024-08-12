import React, { useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error.message);
    }
  };

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
          {isAuthenticated ? (
            <>
              <li>{user && <div className="name">{user.displayName || `${user.lastName}`}</div>}</li>
              <li>
                <button onClick={handleLogout}>
                  <img src="/icons/logout.png" alt="Logout" className="icon" />
                </button>
              </li>
              <li>
                <Link to="/wishlist">
                  <img src="/icons/wishlist.png" alt="Wishlist" className="icon" />
                </Link>
              </li>
            </>
          ) : (
            <>
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
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Header;
