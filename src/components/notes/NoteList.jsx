import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import NoteCard from "./NoteCard";

const NoteList = ({ notes, boardId, onEdit, onDelete, onPin }) => {
  const { colors } = useTheme();
  const currentUserId = localStorage.getItem("userId");

  if (!notes || notes.length === 0) {
    return (
      <div
        className="empty-state"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <h3 style={{ color: colors.text }}>📝 No Notes</h3>
        <p style={{ color: colors.textMuted }}>
          Create your first note to get started!
        </p>
      </div>
    );
  }

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter((n) => n.pinnedBy?.includes(currentUserId));

  const unpinnedNotes = notes.filter(
    (n) => !n.pinnedBy?.includes(currentUserId),
  );

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const sortedUnpinned = [...unpinnedNotes].sort(
    (a, b) =>
      priorityOrder[a.priority || "low"] - priorityOrder[b.priority || "low"],
  );

  return (
    <div className="note-list-container">
      {/* ⭐ PINNED NOTES */}
      {pinnedNotes.length > 0 && (
        <div className="note-section">
          <h3 style={{ color: colors.text }}>⭐ Pinned Notes</h3>

          <div className="note-grid">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                boardId={boardId}
                onEdit={() => onEdit?.(note.id)}
                onDelete={() => onDelete?.(note.id)}
                onPin={() => onPin?.(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 📦 NOTES */}
      <div className="note-section">
        <h3 style={{ color: colors.text }}>
          {pinnedNotes.length > 0 ? "All Notes" : "Your Notes"}
        </h3>

        <div className="note-grid">
          {sortedUnpinned.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              boardId={boardId}
              onEdit={() => onEdit?.(note.id)}
              onDelete={() => onDelete?.(note.id)}
              onPin={() => onPin?.(note.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteList;
