import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useTheme } from "../../contexts/ThemeContext";
import NoteCard from "./NoteCard";

const NoteList = ({ notes, boardId, onEdit, onDelete, onPin, onReorder }) => {
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

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const reorderedNotes = Array.from(unpinnedNotes);
    const [movedNote] = reorderedNotes.splice(source.index, 1);
    reorderedNotes.splice(destination.index, 0, movedNote);

    if (onReorder) {
      onReorder(reorderedNotes.map((n) => n.id));
    }
  };

  return (
    <div className="note-list-container">
      {/* Pinned Notes Section */}
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

      {/* All Notes Section */}
      <div className="note-section">
        <h3 style={{ color: colors.text }}>
          {pinnedNotes.length > 0 ? "All Notes" : "Your Notes"}
        </h3>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="notes">
            {(provided, snapshot) => (
              <div
                className={`note-grid ${
                  snapshot.isDraggingOver ? "dragging-over" : ""
                }`}
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  backgroundColor: snapshot.isDraggingOver
                    ? colors.background
                    : "transparent",
                }}
              >
                {sortedUnpinned.map((note, index) => (
                  <Draggable key={note.id} draggableId={note.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <NoteCard
                          note={note}
                          boardId={boardId}
                          onEdit={() => onEdit?.(note.id)}
                          onDelete={() => onDelete?.(note.id)}
                          onPin={() => onPin?.(note.id)}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default NoteList;
