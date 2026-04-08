import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNote } from "../contexts/NoteContext";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";
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

  useEffect(() => {
    if (boardId) {
      fetchNotes(boardId);
    }
  }, [boardId, fetchNotes]);

  const board = boards.find((b) => b.id === boardId);

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

  const handleDeleteNote = async (noteId) => {
    if (!currentUser) {
      toast.error("Please login to delete notes");
      navigate(`/login?redirect=/notes?boardId=${boardId}`);
      return;
    }

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteNote(boardId, noteId);
      toast.success("Note deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handlePin = async (noteId) => {
    if (!currentUser) {
      toast.error("Please login to pin notes");
      navigate(`/login?redirect=/notes?boardId=${boardId}`);
      return;
    }

    try {
      await toggleNotePin(boardId, noteId);
      toast.success("Note updated!");
    } catch {
      toast.error("Failed to update note");
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
          notes={notes}
          boardId={boardId}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          onPin={handlePin}
          onReorder={(noteIds) => updateNoteOrder(boardId, noteIds)}
        />
      </div>
    </div>
  );
}
