import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      localStorage.setItem("userId", ""); // Will be set by auth context
      toast.success("Login successful!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundColor: colors.background }}>
      <div className="auth-header">
        <h1 className="auth-brand" style={{ color: colors.primary }}>
          📝 Multi-Notes
        </h1>
        <ThemeToggle />
      </div>

      <div className="auth-container">
        <div
          className="auth-card"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            boxShadow: `0 10px 40px ${colors.shadowColor}`,
          }}
        >
          <h2 className="auth-title" style={{ color: colors.text }}>
            Welcome Back
          </h2>
          <p className="auth-subtitle" style={{ color: colors.textMuted }}>
            Sign in to access your notes and boards
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ color: colors.text }}>Email Address</label>
              <input
                ref={emailRef}
                type="email"
                placeholder="you@example.com"
                required
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Password</label>
              <div className="password-input-wrapper">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: colors.textMuted }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "1.5rem" }}
            >
              {loading ? "Signing in..." : "🔓 Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <p style={{ color: colors.textMuted, marginBottom: "1rem" }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: colors.primary,
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-features" style={{ color: colors.textMuted }}>
          <div className="feature">
            <span>✨</span> Premium Design
          </div>
          <div className="feature">
            <span>🔒</span> Secure Notes
          </div>
          <div className="feature">
            <span>🎨</span> Dark & Light Mode
          </div>
        </div>
      </div>
    </div>
  );
}
