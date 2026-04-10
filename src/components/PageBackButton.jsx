import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { useTheme } from "../contexts/ThemeContext";

export default function PageBackButton({
  fallback = "/",
  label = "Back",
  className = "",
}) {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallback, { replace: true });
  };

  return (
    <button
      type="button"
      className={`page-back-button ${className}`.trim()}
      onClick={handleBack}
      style={{
        color: colors.text,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <MdArrowBack />
      <span>{label}</span>
    </button>
  );
}
