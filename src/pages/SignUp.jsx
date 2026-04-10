import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { RiEye2Line, RiEyeCloseFill } from "react-icons/ri";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { colors } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // ✅ Validation
    if (!name || !email || !password || !confirmPassword) {
      return toast.error("Please fill in all fields");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);

    try {
      await signUp(email, password, {
        name,
      });

      toast.success("Account created successfully!");

      // 🚀 Redirect to login (clean)
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Signup failed");
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
            {/* NAME */}
            <div className="form-group">
              <label style={{ color: colors.text }}>Full Name</label>
              <input
                ref={nameRef}
                type="text"
                placeholder="John Doe"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label style={{ color: colors.text }}>Email Address</label>
              <input
                ref={emailRef}
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <div className="password-input-wrapper">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <RiEyeCloseFill /> : <RiEye2Line />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <div className="password-input-wrapper">
                <input
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowConfirmPassword((p) => !p)}
                >
                  {showConfirmPassword ? <RiEyeCloseFill /> : <RiEye2Line />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
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
            <p style={{ color: colors.textMuted }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: colors.primary }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-features" style={{ color: colors.textMuted }}>
          <div className="feature">🔐 Secure Accounts</div>
          <div className="feature">📊 Organize Boards</div>
          <div className="feature">⚡ Fast & Reliable</div>
        </div>
      </div>
    </div>
  );
}
