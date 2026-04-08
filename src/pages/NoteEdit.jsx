import React, { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useNote } from "../contexts/NoteContext";
import { useTheme } from "../contexts/ThemeContext";

export default function NoteEdit() {
  const { id: noteId } = useParams();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");
  const navigate = useNavigate();
  const { notes, updateNote } = useNote();
  const { colors, priorityColors } = useTheme();

  const titleRef = useRef();
  const contentRef = useRef();
  const [priority, setPriority] = useState("low");
  const [loading, setLoading] = useState(false);

  const note = notes.find((n) => n.id === noteId);

  useEffect(() => {
    if (note) {
      titleRef.current.value = note.title || "";
      contentRef.current.value = note.content || "";
      setPriority(note.priority || "low");
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note || !boardId) {
      toast.error("Note or Board ID missing");
      return;
    }

    const title = titleRef.current.value.trim();
    const content = contentRef.current.value.trim();

    if (!title) {
      toast.error("Note title is required");
      return;
    }

    setLoading(true);
    try {
      await updateNote(boardId, noteId, {
        title,
        content,
        priority,
      });

      toast.success("Note updated successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(error.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 style={{ color: colors.text }}>✏️ Edit Note</h2>

          <form onSubmit={handleSubmit} className="add-note-form">
            <div className="form-group">
              <label style={{ color: colors.text }}>Note Title</label>
              <input
                ref={titleRef}
                type="text"
                maxLength="100"
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
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
