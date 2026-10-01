import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaPlus, FaSearch } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import lightLogo from "../../assets/images/primary_light_logo.png";
import darkLogo from "../../assets/images/primary_dark_logo.png";

export default function SiteHeader() {
  const { currentUser, logout } = useAuth();
  const { theme, colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <header className="site-header" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      <div className="site-header-inner">
        <Link to="/" className="site-brand" onClick={closeMenu} aria-label="Noteflow home">
          <img src={theme === "dark" ? lightLogo : darkLogo} alt="Noteflow logo" width="40" height="40" decoding="async" />
          <span>
            <strong>Noteflow</strong>
            <small>Organize what matters</small>
          </span>
        </Link>

        <button
          type="button"
          className="site-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <FaBars />
        </button>

        <nav className={`site-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <Link className={isActive("/") ? "is-active" : ""} to="/" onClick={closeMenu}>
            <MdSpaceDashboard /> Home
          </Link>
          {currentUser && (
            <>
              <Link className={isActive("/boards") ? "is-active" : ""} to="/boards" onClick={closeMenu}>
                Boards
              </Link>
              <Link className={isActive("/notes") ? "is-active" : ""} to="/notes" onClick={closeMenu}>
                Notes
              </Link>
              <Link className={isActive("/trash") ? "is-active" : ""} to="/trash/notes" onClick={closeMenu}>
                Trash
              </Link>
            </>
          )}
          <button type="button" className="site-search-link" onClick={() => { navigate(currentUser ? "/boards" : "/"); closeMenu(); }}>
            <FaSearch /> Search
          </button>
        </nav>

        <div className="site-header-actions">
          {currentUser ? (
            <button type="button" className="site-create-button" onClick={() => navigate("/boards")}>
              <FaPlus /> <span>New note</span>
            </button>
          ) : (
            <button type="button" className="site-create-button" onClick={() => navigate("/login")}>
              Sign in
            </button>
          )}
          <ThemeToggle />
          {currentUser && (
            <button type="button" className="site-avatar" title={currentUser.email || "Account"} onClick={handleLogout}>
              {(currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
