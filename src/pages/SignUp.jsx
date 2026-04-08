import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { colors } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = nameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, {
        displayName: name,
        email: email,
        createdAt: new Date().toISOString(),
      });

      toast.success("Account created successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundColor: colors.background }}>
      <div className="auth-header">
        <h1 className="auth-brand" style={{ color: colors.primary }}>
          Noteflow
        </h1>
        <ThemeToggle />
      </div>

      <div className="auth-container">
        <div
          className="auth-card glass-card"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            boxShadow: `0 10px 40px ${colors.shadowColor}`,
          }}
        >
          <h2 className="auth-title" style={{ color: colors.text }}>
            Create Account
          </h2>
          <p className="auth-subtitle" style={{ color: colors.textMuted }}>
            Join us and start organizing your notes today
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ color: colors.text }}>Full Name</label>
              <input
                ref={nameRef}
                type="text"
                placeholder="John Doe"
                required
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>

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
                  placeholder="Minimum 6 characters"
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

            <div className="form-group">
              <label style={{ color: colors.text }}>Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  ref={confirmPasswordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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
              {loading ? "Creating account..." : "✨ Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p style={{ color: colors.textMuted, marginBottom: 0 }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: colors.primary,
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-features" style={{ color: colors.textMuted }}>
          <div className="feature">
            <span>🔐</span> Secure Accounts
          </div>
          <div className="feature">
            <span>📊</span> Organize Boards
          </div>
          <div className="feature">
            <span>⚡</span> Fast & Reliable
          </div>
        </div>
      </div>
    </div>
  );
}
