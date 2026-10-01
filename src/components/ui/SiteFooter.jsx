import { Link } from "react-router-dom";
import { FaGithub, FaHeart } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

export default function SiteFooter() {
  const { colors } = useTheme();
  return (
    <footer className="site-footer" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      <div className="site-footer-inner">
        <div>
          <Link to="/" className="site-footer-brand">Noteflow</Link>
          <p>Capture ideas, organize projects, and keep your notes close.</p>
        </div>
        <div className="site-footer-links">
          <Link to="/">Home</Link>
          <Link to="/boards">Boards</Link>
          <Link to="/notes">Notes</Link>
          <a href="https://github.com/Uttam2709" target="_blank" rel="noreferrer" aria-label="GitHub">
            <FaGithub /> GitHub
          </a>
        </div>
        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} Noteflow. All rights reserved.</span>
          <span>Built with <FaHeart /> for focused work.</span>
        </div>
      </div>
    </footer>
  );
}
