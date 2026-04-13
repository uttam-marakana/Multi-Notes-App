import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useBoard } from "../contexts/BoardContext";
import { useNote } from "../contexts/NoteContext";
import { useTheme } from "../contexts/ThemeContext";
import PinInput from "../components/PinInput";
import PINModal from "../components/PINModal";
import PageBackButton from "../components/PageBackButton";
import {
  grantProtectedAccess,
  hasProtectedAccess,
  verifyPIN,
  verifyProtectedPIN,
} from "../utils/helpers";

export default function NoteEdit() {
  const { id: noteId } = useParams();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");

  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useAuth();
  const { boards } = useBoard();
  const { notes, updateNote, fetchNotes, loading: notesLoading } = useNote();
  const { colors, priorityColors } = useTheme();

  const [form, setForm] = useState({ title: "", content: "" });

  const [priority, setPriority] = useState("low");
  const [isProtected, setIsProtected] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState(false);

  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [requestedNotes, setRequestedNotes] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(
    !noteId || hasProtectedAccess("note", noteId),
  );

  const note = notes.find((item) => item.id === noteId);
  const board = boards.find((item) => item.id === boardId);

  useEffect(() => {
    if (!boardId) return undefined;
    setRequestedNotes(true);
    return fetchNotes(boardId);
  }, [boardId, fetchNotes]);

  useEffect(() => {
    if (!note) return;

    setForm({
      title: note.title || "",
      content: note.content || "",
    });

    setPriority(note.priority || "low");
    setIsProtected(note.isProtected || false);
    setExistingFiles(note.files || []);

    const verified = !note.isProtected || hasProtectedAccess("note", note.id);

    setIsUnlocked(verified);
    setShowPINModal(note.isProtected && !verified);
  }, [note]);

  useEffect(() => {
    if (pinError && pin === pinConfirm) {
      setPinError(false);
    }
  }, [pin, pinConfirm, pinError]);

  if (!currentUser) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          location.pathname + location.search,
        )}`}
        replace
      />
    );
  }

  const toggleProtection = () => {
    setIsProtected((prev) => {
      const next = !prev;

      if (!next) {
        setPin("");
        setPinConfirm("");
        setPinError(false);
      }

      return next;
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    const allowedFiles = files.filter((f) =>
      [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "application/pdf",
      ].includes(f.type),
    );

    setFileError(
      allowedFiles.length !== files.length ? "Invalid file type." : "",
    );
    setNewFiles((prev) => [...prev, ...allowedFiles].slice(0, 10));
  };

  const removeExistingFile = (filePath) => {
    setExistingFiles((prev) => prev.filter((file) => file.path !== filePath));
    setRemovedFiles((prev) => [...prev, filePath]);
  };

  const removeNewFile = (fileName) => {
    setNewFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!note || !boardId) {
      toast.error("Note or Board ID missing");
      return;
    }

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title) {
      toast.error("Note title is required");
      return;
    }

    if (isProtected && pin) {
      if (pin.length !== 4 || pin !== pinConfirm) {
        setPinError(true);
        return toast.error("Invalid PIN");
      }
    }

    setLoading(true);
    try {
      await updateNote(boardId, noteId, {
        title,
        content,
        priority,
        isProtected,
        pin: isProtected ? pin || undefined : null,
        newFiles,
        removeFiles: removedFiles,
        files: existingFiles,
      });

      toast.success("Note updated successfully");
      navigate(-1);
    } catch (error) {
      toast.error(error.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const handlePINSubmit = async (enteredPIN) => {
    const boardPin = board?.isProtected ? board.pin : null;

    if (!note || !verifyProtectedPIN(enteredPIN, note.pin, boardPin)) {
      throw new Error("Invalid PIN");
    }

    grantProtectedAccess("note", note.id);
    setIsUnlocked(true);
    setShowPINModal(false);
  };

  if (!requestedNotes || notesLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div className="spinner" style={{ marginBottom: "1rem" }}></div>
        <h2>Loading note...</h2>
      </div>
    );
  }

  if (!note) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Note not found</h2>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (note.isProtected && !isUnlocked) {
    return (
      <div
        className="add-note-container glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="container">
          <div className="add-note-card glass-card">
            <h2 style={{ color: colors.text }}>Note Protected</h2>
            <p style={{ color: colors.textMuted }}>
              Enter the note PIN to continue editing.
            </p>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowPINModal(true)}
              >
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
          onClose={() => navigate(-1)}
          onSubmit={handlePINSubmit}
          title="Note Protected"
          description="Enter the current note PIN to continue editing."
        />
      </div>
    );
  }

  return (
    <div
      className="add-note-container glass-container"
      style={{ backgroundColor: colors.background }}
    >
      <div className="container">
        <div
          className="add-note-card glass-card"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <PageBackButton fallback={`/notes?boardId=${boardId || ""}`} />
          <h2 style={{ color: colors.text }}>Edit Note</h2>

          <form onSubmit={handleSubmit} className="add-note-form">
            <div className="form-group">
              <label style={{ color: colors.text }}>Note Title</label>
              <input
                value={form.title}
                type="text"
                maxLength="100"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Content</label>
              <textarea
                value={form.content}
                rows="6"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Priority</label>
              <div className="priority-selector">
                {["low", "medium", "high"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`priority-btn ${priority === level ? "active" : ""}`}
                    onClick={() => setPriority(level)}
                    style={{
                      backgroundColor:
                        priority === level
                          ? priorityColors[level]
                          : colors.background,
                      borderColor:
                        priority === level
                          ? priorityColors[level]
                          : colors.border,
                      color: priority === level ? "white" : colors.text,
                    }}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Security</label>

              <div
                className={`advanced-box ${isProtected ? "active" : ""}`}
                onClick={toggleProtection}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") toggleProtection();
                }}
              >
                <div className="advanced-header">
                  <div className="flex items-center gap-2">
                    <span>Protect Note</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="advanced-status">
                      {isProtected ? "Enabled" : "Off"}
                    </div>
                    {isUnlocked && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/notes/relock/${noteId}?boardId=${boardId}`,
                          );
                        }}
                      >
                        Re-lock
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className={`pin-wrapper ${isProtected ? "open" : ""}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {isProtected && (
                    <div className={`pin-group ${pinError ? "pin-error" : ""}`}>
                      <PinInput
                        label="New PIN"
                        value={pin}
                        setValue={setPin}
                        autoFocus
                      />

                      <PinInput
                        label="Confirm PIN"
                        value={pinConfirm}
                        setValue={setPinConfirm}
                      />

                      {pin && pinConfirm && pin === pinConfirm && (
                        <div className="pin-success">PIN updated</div>
                      )}

                      {pin && pinConfirm && pin !== pinConfirm && (
                        <small className="text-danger">PIN mismatch</small>
                      )}

                      <small className="text-muted">
                        Leave the PIN fields empty to keep the current PIN.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Attachments</label>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/gif,application/pdf"
                onChange={handleFileChange}
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                }}
              />
              {fileError && <small className="form-error">{fileError}</small>}
              {(existingFiles.length > 0 || newFiles.length > 0) && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  {existingFiles.map((file) => (
                    <div
                      key={file.path || file.url}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "0.5rem",
                        backgroundColor: colors.surface,
                      }}
                    >
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: colors.primary }}
                      >
                        {file.name}
                      </a>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() =>
                          removeExistingFile(file.path || file.url)
                        }
                        style={{ color: colors.danger }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {newFiles.map((file) => (
                    <div
                      key={file.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "0.5rem",
                        backgroundColor: colors.surface,
                      }}
                    >
                      <span style={{ color: colors.text }}>{file.name}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => removeNewFile(file.name)}
                        style={{ color: colors.danger }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
