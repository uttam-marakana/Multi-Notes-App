import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNote } from "../../contexts/NoteContext";
import { useBoard } from "../../contexts/BoardContext";
import { useTheme } from "../../contexts/ThemeContext";
import PINModal from "../../components/ui/PINModal";
import PageBackButton from "../../components/ui/PageBackButton";
import {
  grantProtectedAccess,
  hasProtectedAccess,
  verifyProtectedPIN,
} from "../../utils/helpers";

export default function NoteDetails() {
  const { id: noteId } = useParams();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");

  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useAuth();
  const { notes, fetchNotes, loading: notesLoading } = useNote();
  const { boards } = useBoard();
  const { colors, priorityColors } = useTheme();

  const note = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId]);
  const board = useMemo(() => boards.find((b) => b.id === boardId), [boards, boardId]);

  const [showPINModal, setShowPINModal] = useState(false);
  const [requestedNotes, setRequestedNotes] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState(
    !noteId || hasProtectedAccess("note", noteId),
  );

  useEffect(() => {
    if (!boardId) return;
    setRequestedNotes(true);
    return fetchNotes(boardId);
  }, [boardId, fetchNotes]);

  useEffect(() => {
    if (!note) return;
    const verified = !note.isProtected || hasProtectedAccess("note", note.id);
    setIsUnlocked(verified);
    setShowPINModal(note.isProtected && !verified);
  }, [note]);

  const handlePINSubmit = async (enteredPIN) => {
    // Phase 9: use Board PIN only when needed, and support separate Note PIN.
    const boardPin = board?.isProtected ? board?.pin : null;
    const notePin = note?.isProtected ? note?.pin : null;

    // verifyProtectedPIN already supports fallbackHash.
    const ok = verifyProtectedPIN(enteredPIN, notePin, boardPin);
    if (!ok) throw new Error("Invalid PIN");

    // Once verified, allow access for this note.
    grantProtectedAccess("note", note.id);
    setIsUnlocked(true);
    setShowPINModal(false);
  };

  const priority = note?.priority || "low";
  const priorityLabel = useMemo(() => {
    const map = { high: "High", medium: "Medium", low: "Low" };
    return map[priority] || "Low";
  }, [priority]);

  if (!currentUser) {
    // ProtectedRoute handles most cases, but keep a safe fallback
    toast.error("Please login");
    navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
    return null;
  }

  if (!requestedNotes || notesLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div className="spinner" style={{ marginBottom: "1rem" }} />
        <h2 style={{ color: colors.text }}>Loading note...</h2>
      </div>
    );
  }

  if (!note) {
    return (
      <div style={{ padding: "2rem" }}>
        <div className="empty-state glass-card" style={{ backgroundColor: colors.surface }}>
          <h3 style={{ color: colors.text }}>Note not found</h3>
          <p style={{ color: colors.textMuted }}>The note you are looking for does not exist.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (note.isProtected && !isUnlocked) {
    return (
      <div className="add-note-container glass-container" style={{ backgroundColor: colors.background }}>
        <div className="container">
          <div className="add-note-card glass-card">
            <h2 style={{ color: colors.text }}>Note Protected</h2>
            <p style={{ color: colors.textMuted }}>Enter the note PIN to continue.</p>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={() => setShowPINModal(true)}>
                Unlock
              </button>
              <button className="btn btn-outline" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>
          </div>
        </div>

        <PINModal
          isOpen={showPINModal}
          onClose={() => {
            setShowPINModal(false);
            navigate(-1);
          }}
          onSubmit={handlePINSubmit}
          title="Note Protected"
          description="Enter the current note PIN to continue editing."
        />
      </div>
    );
  }

  return (
    <div className="add-note-container glass-container" style={{ backgroundColor: colors.background }}>
      <div className="container">
        <div
          className="add-note-card glass-card"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <PageBackButton fallback={`/notes?boardId=${boardId || ""}`} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ color: colors.text, margin: 0 }}>{note.title || "Untitled"}</h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span
                className="board-chip"
                style={{
                  backgroundColor: priorityColors[priority] || colors.primary,
                }}
              >
                {priorityLabel}
              </span>
              {note.isProtected && (
                <span className="board-chip" style={{ backgroundColor: colors.primary }}>
                  {isUnlocked ? "Unlocked" : "Protected"}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <p style={{ color: colors.textMuted, whiteSpace: "pre-wrap", marginBottom: "1rem" }}>
              {note.content || "No content"}
            </p>

            {note.files?.length > 0 && (
              <div className="note-files" style={{ borderColor: colors.border }}>
                {note.files.map((file) => (
                  <a
                    key={file.path || file.url}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="note-file-item"
                    style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                  >
                    {file.type?.startsWith("image/") ? (
                      <img src={file.url} alt={file.name} className="note-file-thumb" />
                    ) : (
                      <span className="note-file-icon">📎</span>
                    )}
                    <span className="note-file-name">{file.name}</span>
                    <small className="note-file-size">{file.size ? `${Math.round(file.size / 1024)} KB` : ""}</small>
                  </a>
                ))}
              </div>
            )}

            <div className="note-meta" style={{ borderTopColor: colors.border, marginTop: "1rem" }}>
              <small>
                Created {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ""}
              </small>
              <small>{note.files?.length ? `${note.files.length} attachment(s)` : "No attachments"}</small>
            </div>
          </div>
        </div>
      </div>

      <PINModal
        isOpen={showPINModal}
        onClose={() => setShowPINModal(false)}
        onSubmit={handlePINSubmit}
        title="Note Protected"
        description="Enter the PIN to unlock this note."
      />
    </div>
  );
}

