import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import BoardManager from "./BoardManager";
import { CgLogIn, CgLogOut } from "react-icons/cg";

import lightLogo from "../assets/images/primary_light_logo.png";
import darkLogo from "../assets/images/primary_dark_logo.png";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const { theme, colors } = useTheme();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Auto re-lock all on Dashboard visit
    const accessKey = "noteflow-protected-access";
    if (typeof window !== "undefined" && sessionStorage.getItem(accessKey)) {
      sessionStorage.removeItem(accessKey);
    }
  }, []);

  const handleLogout = async () => {
    try {
      setError("");
      await logout();
      navigate("/login");
    } catch {
      setError("Please try later");
    }
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const userLabel =
    currentUser?.name ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0];

  return (
    <div
      className="dashboard glass-container"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="dashboard-header glass-card"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
      >
        <div className="dashboard-header-content">
          <div className="dashboard-brand">
            <img
              src={theme === "dark" ? lightLogo : darkLogo}
              alt="Noteflow Logo"
              className="dashboard-logo"
              style={{ maxHeight: 50, marginRight: "0.75rem" }}
            />
            <div>
              <h1 className="dashboard-title" style={{ color: colors.text }}>
                Noteflow
              </h1>
            </div>
          </div>

          {currentUser && (
            <div className="dashboard-welcome" style={{ color: colors.text }}>
              <p className="greeting-text">
                {getGreetingMessage()}, <strong>{userLabel}</strong>!
              </p>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <ThemeToggle />
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              title="Logout"
            >
              <CgLogOut /> Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="btn btn-primary"
            >
              <CgLogIn /> Login
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="alert alert-error"
          style={{ margin: "var(--spacing-lg)" }}
        >
          {error}
        </div>
      )}

      {!currentUser && (
        <div className="btn-greet_banner">
          <strong>Welcome!</strong> Please{" "}
          <button className="btn-log" onClick={() => navigate("/login")}>
            Login
          </button>{" "}
          to create and manage boards and notes.
        </div>
      )}

      <div className="dashboard-content container">
        <BoardManager userId={currentUser?.uid} />
      </div>
    </div>
  );
};

export default Dashboard;
