import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNote } from "../contexts/NoteContext";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";
import { guestStorage } from "../utils/guestStorage";
import ConfirmationModal from "../components/ConfirmationModal";
import NoteList from "../components/notes/NoteList";

export default function NoteManager() {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { notes, fetchNotes, deleteNote, toggleNotePin, updateNoteOrder } =
    useNote();
  const { boards } = useBoard();
  const { colors } = useTheme();
  const [guestNotes, setGuestNotes] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (boardId) {
      if (currentUser) {
        fetchNotes(boardId);
      } else {
        const saved = guestStorage.getNotes(boardId);
        setGuestNotes(saved);
      }
    }
  }, [boardId, fetchNotes, currentUser]);

  const board = boards.find((b) => b.id === boardId);
  const displayNotes = currentUser ? notes : guestNotes;

  const handleAddNote = () => {
    if (!currentUser) {
      toast.error("Please login to create notes");
      navigate(`/login?redirect=/notes/add?boardId=${boardId}`);
      return;
    }
    if (!boardId) {
      toast.error("Board ID is required");
      return;
    }
    navigate(`/notes/add?boardId=${boardId}`);
  };

  const handleEditNote = (noteId) => {
    if (!currentUser) {
      toast.error("Please login to edit notes");
      navigate(`/login?redirect=/notes/edit/${noteId}?boardId=${boardId}`);
      return;
    }
    navigate(`/notes/edit/${noteId}?boardId=${boardId}`);
  };

  const handleDeleteNote = (noteId) => {
    setConfirmAction({
      type: "deleteNote",
      noteId,
      title: "Delete Note",
      message: "This action cannot be undone. Delete this note?",
    });
    setShowConfirm(true);
  };

  const executeDeleteNote = async (noteId) => {
    if (!currentUser) {
      const updated = guestNotes.filter((n) => n.id !== noteId);
      setGuestNotes(updated);
      guestStorage.saveNotes(boardId, updated);
      toast.success("Note deleted (temporary data)");
      return;
    }

    try {
      await deleteNote(boardId, noteId);
      toast.success("Note deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handlePin = (noteId) => {
    if (!currentUser) {
      toast.error("Please login to pin notes");
      navigate(`/login?redirect=/notes?boardId=${boardId}`);
      return;
    }

    setConfirmAction({
      type: "pinNote",
      noteId,
      title: "Pin Note",
      message: "Update note pin status?",
    });
    setShowConfirm(true);
  };

  const executePinNote = async (noteId) => {
    try {
      await toggleNotePin(boardId, noteId);
      toast.success("Note updated!");
    } catch {
      toast.error("Failed to update note");
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    if (confirmAction.type === "deleteNote") {
      executeDeleteNote(confirmAction.noteId);
    } else if (confirmAction.type === "pinNote") {
      executePinNote(confirmAction.noteId);
    }
  };

  if (!boardId || !board) {
    return (
      <div
        className="note-manager"
        style={{ backgroundColor: colors.background }}
      >
        <div className="container">
          <div
            className="empty-state"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h3 style={{ color: colors.text }}>📋 No Board Selected</h3>
            <p style={{ color: colors.textMuted }}>
              Select a board to view its notes
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="note-manager"
      style={{ backgroundColor: colors.background }}
    >
      <div className="container">
        <div className="note-manager-header">
          <div>
            <h2 style={{ color: colors.text, margin: 0 }}>📋 {board.name}</h2>
            {board.description && (
              <p style={{ color: colors.textMuted, margin: 0 }}>
                {board.description}
              </p>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddNote}
            style={{ whiteSpace: "nowrap" }}
          >
            ➕ New Note
          </button>
        </div>

        <NoteList
          notes={displayNotes}
          boardId={boardId}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          onPin={handlePin}
          onReorder={(noteIds) => {
            if (currentUser) {
              updateNoteOrder(boardId, noteIds);
            } else {
              const reordered = noteIds.map((id) =>
                guestNotes.find((n) => n.id === id),
              );
              setGuestNotes(reordered);
              guestStorage.saveNotes(boardId, reordered);
            }
          }}
        />
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText="Confirm"
        cancelText="Cancel"
        isDangerous={confirmAction?.type === "deleteNote"}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
    </div>
  );
}
