import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNote } from "../../contexts/NoteContext";
import { useTheme } from "../../contexts/ThemeContext";
import NoteCard from "../../components/notes/NoteCard";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { purgeNoteTrash, restoreNote, isNoteTrashed } from "../../utils/trashStorage";


export default function TrashNotes() {
  const navigate = useNavigate();

  const { notes } = useNote();
  const { colors } = useTheme();

  const [confirm, setConfirm] = useState({ open: false, boardId: null, noteId: null });

  const trashedNotes = useMemo(() => {
    if (!Array.isArray(notes)) return [];
    return notes.filter((n) => isNoteTrashed(n.boardId, n.id));
  }, [notes]);

  const handleRestore = (boardId, noteId) => {
    restoreNote(boardId, noteId);
  };

  const handlePurgeRequest = (boardId, noteId) => {
    setConfirm({ open: true, boardId, noteId });
  };

  const handlePurge = () => {
    const { boardId, noteId } = confirm;
    setConfirm({ open: false, boardId: null, noteId: null });
    purgeNoteTrash(boardId, noteId);
  };

  return (
    <div className="note-manager glass-container" style={{ backgroundColor: colors.background }}>
      <div className="note-manager-header glass-card">
        <div>
          <h2 style={{ color: colors.text }}>Trash</h2>
          <p style={{ color: colors.textMuted, margin: 0 }}>
            {trashedNotes.length} trashed note(s)
          </p>
        </div>

        <button className="btn btn-outline" onClick={() => navigate("/")}>Back</button>
      </div>

      {trashedNotes.length === 0 ? (
        <div className="empty-state glass-card">
          <h3 style={{ color: colors.text }}>Trash is empty</h3>
          <p style={{ color: colors.textMuted }}>Deleted notes will appear here until you restore or purge.</p>
        </div>
      ) : (
      <div className="note-grid" style={{ padding: 0 }}>
          {trashedNotes.map((note) => (
            <div key={note.id} style={{ position: "relative" }}>
              <NoteCard
                note={note}
                boardId={note.boardId}
                onEdit={() => {}}
                onDelete={() => handlePurgeRequest(note.boardId, note.id)}
                onPin={() => {}}
                onClone={() => {}}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary" onClick={() => handleRestore(note.boardId, note.id)}>
                  Restore
                </button>
                <button className="btn btn-danger" onClick={() => handlePurgeRequest(note.boardId, note.id)}>
                  Delete permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirm.open}
        title="Delete permanently?"
        message="This will remove the note from the trash permanently (UI-only)."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handlePurge}
        onCancel={() => setConfirm({ open: false, boardId: null, noteId: null })}
      />
    </div>
  );
}

