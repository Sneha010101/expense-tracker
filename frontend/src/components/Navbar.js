import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">
      <h2
        style={{ cursor: "pointer" }}
        onClick={() => navigate(token ? "/dashboard" : "/")}
      >
        💰 Expense Tracker
      </h2>

      <div className="nav-links">
        {token && (
          <>
            <button
              id="nav-dashboard"
              className={`nav-link ${isActive("/dashboard") ? "nav-active" : ""}`}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button
              id="nav-portfolio"
              className={`nav-link ${isActive("/portfolio") ? "nav-active" : ""}`}
              onClick={() => navigate("/portfolio")}
            >
              My Portfolio
            </button>
            <button
              id="nav-news"
              className={`nav-link ${isActive("/news") ? "nav-active" : ""}`}
              onClick={() => navigate("/news")}
            >
              News
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;