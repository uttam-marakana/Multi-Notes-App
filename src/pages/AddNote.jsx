import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNote } from "../contexts/NoteContext";
import { useTheme } from "../contexts/ThemeContext";

export default function AddNote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");
  const { addNote } = useNote();
  const { colors, priorityColors } = useTheme();

  const titleRef = useRef();
  const contentRef = useRef();
  const [priority, setPriority] = useState("low");
  const [isProtected, setIsProtected] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!title) {
      toast.error("Note title is required");
      return;
    }

    if (isProtected) {
      if (pin.length !== 4) {
        toast.error("PIN must be 4 digits");
        return;
      }
      if (pin !== pinConfirm) {
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
        isProtected,
        pin: isProtected ? pin : null,
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

  return (
    <div
      className="add-note-container"
      style={{ backgroundColor: colors.background }}
    >
      <div className="container">
        <div
          className="add-note-card"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <h2 style={{ color: colors.text }}>📝 Create New Note</h2>

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

            <div className="form-group">
              <label
                style={{
                  color: colors.text,
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                />
                🔒 Protect with PIN
              </label>

              {isProtected && (
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <input
                    type="password"
                    placeholder="4-digit PIN"
                    maxLength="4"
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                      padding: "0.5rem",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Confirm PIN"
                    maxLength="4"
                    value={pinConfirm}
                    onChange={(e) =>
                      setPinConfirm(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                      padding: "0.5rem",
                      borderRadius: "0.5rem",
                    }}
                  />
                </div>
              )}
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
    </div>
  );
}
