import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";

import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import PageBackButton from "../components/PageBackButton";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const emailRef = useRef();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = emailRef.current?.value?.trim();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      // Uses the existing Firebase Auth instance
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Check your inbox.");
      navigate("/login", { replace: true });
    } catch (err) {
      // Keep message user-friendly
      toast.error(err?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundColor: colors.background }}>
      <div className="auth-header">
        <PageBackButton fallback="/login" label="Back" />
        <div className="auth-header-actions">
          <h1 className="auth-brand" style={{ color: colors.primary }}>
            Noteflow
          </h1>
          <ThemeToggle />
        </div>
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
            Reset Password
          </h2>

          <p className="auth-subtitle" style={{ color: colors.textMuted }}>
            Enter your email and we’ll send you a password reset link.
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

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "1.5rem" }}
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: "1rem" }}>
            <p style={{ color: colors.textMuted, marginBottom: 0 }}>
              Remembered your password?{" "}
              <Link
                to="/login"
                style={{
                  color: colors.primary,
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-features" style={{ color: colors.textMuted }}>
          <div className="feature">🔐 Secure Auth</div>
          <div className="feature">📩 Email Reset Link</div>
          <div className="feature">⚡ Quick Recovery</div>
        </div>
      </div>
    </div>
  );
}

