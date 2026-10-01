import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import BoardManager from "../protected/BoardManager";
import SearchWithSuggestions from "../../components/common/SearchWithSuggestions";
import { FaLock, FaPlus, FaSearch } from "react-icons/fa";
import { MdDashboard, MdPushPin, MdSpaceDashboard } from "react-icons/md";
import { useBoard } from "../../contexts/BoardContext";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { colors } = useTheme();
  const { boards } = useBoard();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Visiting Home is the intentional point at which protected UI access is re-locked.
    sessionStorage.removeItem("noteflow-protected-access");
  }, []);

  const suggestions = useMemo(
    () =>
      (Array.isArray(boards) ? boards : []).map((board) => ({
        id: board.id,
        label: board.name || "Untitled Board",
      })),
    [boards],
  );

  const boardCount = boards?.length || 0;

  const pinnedCount =
    boards?.filter((board) => board.pinnedBy?.includes(currentUser?.uid))
      .length || 0;

  const protectedCount =
    boards?.filter((board) => board.isProtected).length || 0;

  return (
    <main
      className="dashboard"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <section className="dashboard-content container">
        <div className="dashboard-hero glass-card">
          <div className="dashboard-hero-copy">
            <div className="dashboard-eyebrow">
              <MdDashboard />
              {currentUser ? "Personal workspace" : "Guest workspace"}
            </div>

            <h1>
              Keep every idea in one <span>clear place.</span>
            </h1>

            <p>
              Organize projects, quick thoughts, references, and private notes
              into focused boards.
              {currentUser
                ? " Your workspace is synced with Firebase in real time."
                : " Sign in when you&apos;re ready to save your work permanently."}
            </p>

            <div className="dashboard-hero-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  navigate(
                    currentUser ? "/boards/add" : "/login?redirect=/boards/add",
                  );
                }}
              >
                <FaPlus />
                {currentUser ? "Create a board" : "Start with an account"}
              </button>

              <button
                className="btn btn-outline btn-lg"
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
              >
                <FaSearch />
                {searchOpen ? "Hide search" : "Search boards"}
              </button>

              {!currentUser && (
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigate("/signup")}
                >
                  Create account
                </button>
              )}
            </div>
          </div>

          <div className="dashboard-hero-visual" aria-hidden="true">
            <div className="hero-orb hero-orb-one" />
            <div className="hero-orb hero-orb-two" />

            <div className="hero-note-card hero-note-back">
              <span />
              <span />
              <span />
            </div>

            <div className="hero-note-card hero-note-front">
              <div className="hero-note-icon">
                <MdSpaceDashboard />
              </div>

              <strong>Focus board</strong>
              <small>Ideas · Tasks · Notes</small>

              <div className="hero-note-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-stats" aria-label="Workspace summary">
          <div className="dashboard-stat glass-card">
            <span className="dashboard-stat-icon">
              <MdSpaceDashboard />
            </span>

            <div>
              <strong>{boardCount}</strong>
              <span>Boards</span>
            </div>
          </div>

          <div className="dashboard-stat glass-card">
            <span className="dashboard-stat-icon">
              <MdPushPin />
            </span>

            <div>
              <strong>{pinnedCount}</strong>
              <span>Pinned</span>
            </div>
          </div>

          <div className="dashboard-stat glass-card">
            <span className="dashboard-stat-icon">
              <FaLock />
            </span>

            <div>
              <strong>{protectedCount}</strong>
              <span>Protected</span>
            </div>
          </div>

          <div className="dashboard-stat dashboard-stat-tip glass-card">
            <span className="dashboard-stat-icon">
              <MdDashboard />
            </span>

            <div>
              <strong>Fast</strong>
              <span>Real-time workspace</span>
            </div>
          </div>
        </div>

        {!currentUser && (
          <div className="dashboard-guest-banner">
            <div>
              <strong>You&apos;re browsing as a guest.</strong>
              <span>
                Guest boards are local to this browser. Sign in to sync your
                workspace.
              </span>
            </div>

            <button
              className="btn btn-light"
              onClick={() => navigate("/login?redirect=/dashboard")}
            >
              Sign in
            </button>
          </div>
        )}

        {searchOpen && (
          <section
            className="dashboard-search-panel glass-card"
            aria-label="Search boards"
          >
            <div className="dashboard-search-inner">
              <FaSearch className="dashboard-search-panel-icon" />

              <SearchWithSuggestions
                label=""
                value={searchText}
                onChange={setSearchText}
                placeholder="Search boards by name or description..."
                suggestions={suggestions}
                getSuggestionLabel={(suggestion) => suggestion.label}
                onPickSuggestion={(suggestion) =>
                  setSearchText(suggestion?.label || "")
                }
              />
            </div>
          </section>
        )}

        <BoardManager searchText={searchText} />
      </section>
    </main>
  );
};

export default Dashboard;
