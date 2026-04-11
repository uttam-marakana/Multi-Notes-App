import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNote } from "../contexts/NoteContext";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";
import PinInput from "../components/PinInput";
import PINModal from "../components/PINModal";
import PageBackButton from "../components/PageBackButton";
import {
  grantProtectedAccess,
  hasProtectedAccess,
  verifyPIN,
} from "../utils/helpers";

export default function AddNote() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");
  const { addNote } = useNote();
  const { boards } = useBoard();
  const { colors, priorityColors } = useTheme();
  const board = boards.find((item) => item.id === boardId);
  const [showBoardPIN, setShowBoardPIN] = useState(
    Boolean(board?.isProtected && !hasProtectedAccess("board", boardId)),
  );
  const titleRef = useRef();
  const contentRef = useRef();
  const [priority, setPriority] = useState("low");
  const [isProtected, setIsProtected] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const boardLocked = Boolean(
    board?.isProtected && !hasProtectedAccess("board", boardId),
  );

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const allowedFiles = files.filter((file) =>
      [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "application/pdf",
      ].includes(file.type),
    );

    if (allowedFiles.length !== files.length) {
      setFileError("Only JPG, PNG, GIF, and PDF files are allowed.");
    } else {
      setFileError("");
    }

    setSelectedFiles((prev) => [...prev, ...allowedFiles].slice(0, 10));
    e.target.value = null;
  };

  const removeSelectedFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = titleRef.current.value.trim();
    const content = contentRef.current.value.trim();

    if (!boardId) {
      toast.error("Board ID is required");
      return;
    }

    if (boardLocked) {
      setShowBoardPIN(true);
      return;
    }

    if (!title) {
      toast.error("Note title is required");
      return;
    }

    if (isProtected) {
      if (pin.length !== 4) {
        setPinError(true);
        toast.error("PIN must be 4 digits");
        return;
      }
      if (pin !== pinConfirm) {
        setPinError(true);
        toast.error("PINs do not match");
        return;
      }
    }

    setLoading(true);
    try {
      await addNote(boardId, {
        title,
        content,
        priority,
        isProtected: board?.isProtected ? true : isProtected,
        pin: isProtected ? pin : null,
        pinHash:
          board?.isProtected && !isProtected && board?.pin ? board.pin : null,
        files: selectedFiles,
      });

      toast.success("Note created successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(error.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const handleBoardPINSubmit = async (enteredPIN) => {
    if (!board || !verifyPIN(enteredPIN, board.pin)) {
      throw new Error("Invalid PIN");
    }

    grantProtectedAccess("board", board.id);
    setShowBoardPIN(false);
  };

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
          <h2 style={{ color: colors.text }}>📝 Create New Note</h2>

          {boardLocked && (
            <div className="alert alert-warning">
              Unlock this protected board before creating a note.
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-note-form">
            <div className="form-group">
              <label style={{ color: colors.text }}>Note Title *</label>
              <input
                ref={titleRef}
                type="text"
                placeholder="Enter note title"
                maxLength="100"
                required
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Content</label>
              <textarea
                ref={contentRef}
                placeholder="Enter note content..."
                rows="6"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Priority</label>
              <div className="priority-selector">
                {["low", "medium", "high"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn ${priority === p ? "active" : ""}`}
                    onClick={() => setPriority(p)}
                    style={{
                      backgroundColor:
                        priority === p ? priorityColors[p] : colors.background,
                      borderColor:
                        priority === p ? priorityColors[p] : colors.border,
                      color: priority === p ? "white" : colors.text,
                    }}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* PROTECTION SYSTEM */}
            <div className="form-group">
              <label style={{ color: colors.text }}>Security</label>

              <div
                className={`advanced-box ${isProtected ? "active" : ""}`}
                onClick={toggleProtection}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") toggleProtection();
                }}
              >
                <div className="advanced-header">
                  <div className="flex items-center gap-2">
                    🔒 <span>Protect Note</span>
                  </div>
                  <div className="advanced-status">
                    {isProtected ? "Enabled" : "Off"}
                  </div>
                </div>

                <div
                  className={`pin-wrapper ${isProtected ? "open" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isProtected && (
                    <div className={`pin-group ${pinError ? "pin-error" : ""}`}>
                      <PinInput
                        label="Create PIN"
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
                        <div className="pin-success">✅ PIN matched</div>
                      )}

                      {pin && pinConfirm && pin !== pinConfirm && (
                        <small className="text-danger">⚠️ PIN mismatch</small>
                      )}
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
              {selectedFiles.length > 0 && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  {selectedFiles.map((file) => (
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
                      <span style={{ color: colors.text, fontSize: "0.95rem" }}>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => removeSelectedFile(file.name)}
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
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "✨ Create Note"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <PINModal
        isOpen={showBoardPIN}
        onClose={() => setShowBoardPIN(false)}
        onSubmit={handleBoardPINSubmit}
        title="Board Protected"
        description="Enter the board PIN before creating a note."
      />
    </div>
  );
}
