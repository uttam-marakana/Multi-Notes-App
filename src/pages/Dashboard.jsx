import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import BoardManager from "./BoardManager";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const { colors } = useTheme();
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  return (
    <div className="dashboard" style={{ backgroundColor: colors.background }}>
      <div
        className="dashboard-header"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
      >
        <div className="dashboard-header-content">
          <div className="dashboard-brand">
            <h1 className="dashboard-title" style={{ color: colors.text }}>
              📔 Multi-Notes
            </h1>
          </div>

          {currentUser && (
            <div className="dashboard-welcome" style={{ color: colors.text }}>
              <p className="greeting-text">
                {getGreetingMessage()},{" "}
                <strong>{currentUser.email?.split("@")[0]}</strong>!
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
              🚪 Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="btn btn-primary"
            >
              🔑 Login
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
        <div
          style={{
            backgroundColor: colors.info,
            color: "white",
            padding: "1rem",
            margin: "1rem",
            borderRadius: "0.5rem",
            textAlign: "center",
          }}
        >
          📌 <strong>Welcome!</strong> Please{" "}
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "white",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "inherit",
              fontWeight: "bold",
            }}
          >
            login
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
