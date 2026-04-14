import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNote } from "../contexts/NoteContext";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";
import { guestStorage } from "../utils/guestStorage";
import ConfirmationModal from "../components/ConfirmationModal";
import PageBackButton from "../components/PageBackButton";
import NoteList from "../components/notes/NoteList";
import { AiOutlineFileAdd } from "react-icons/ai";

export default function NoteManager() {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    notes,
    fetchNotes,
    deleteNote,
    toggleNotePin,
    updateNoteOrder,
    loading: notesLoading,
  } = useNote();

  const { boards, loading: boardsLoading } = useBoard();
  const { colors } = useTheme();

  const [guestNotes, setGuestNotes] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  /* ------ FETCH NOTES ----------------------------- */
  useEffect(() => {
    if (!boardId) return;

    if (currentUser) {
      return fetchNotes(boardId);
    }

    const saved = guestStorage.getNotes(boardId);
    setGuestNotes(saved);
  }, [boardId, currentUser, fetchNotes]);

  /* ------ FIND BOARD ----------------------------- */
  const board = useMemo(
    () => boards.find((item) => item.id === boardId),
    [boards, boardId],
  );

  const displayNotes = currentUser ? notes : guestNotes;

  /* ------ ACTIONS ----------------------------- */
  const handleAddNote = () => {
    if (!currentUser) {
      toast.error("Please login to create notes");
      navigate(
        `/login?redirect=${encodeURIComponent(`/notes/add?boardId=${boardId}`)}`,
      );
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
      navigate(
        `/login?redirect=${encodeURIComponent(
          `/notes/edit/${noteId}?boardId=${boardId}`,
        )}`,
      );
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
      const updated = guestNotes.filter((item) => item.id !== noteId);
      setGuestNotes(updated);
      guestStorage.saveNotes(boardId, updated);
      toast.success("Note deleted");
      return;
    }

    try {
      await deleteNote(boardId, noteId);
      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete note");
    }
  };

  const handlePin = (noteId) => {
    if (!currentUser) {
      toast.error("Please login to pin notes");
      navigate(
        `/login?redirect=${encodeURIComponent(`/notes?boardId=${boardId}`)}`,
      );
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
      toast.success("Note updated");
    } catch {
      toast.error("Failed to update note");
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);

    if (confirmAction?.type === "deleteNote") {
      executeDeleteNote(confirmAction.noteId);
    } else if (confirmAction?.type === "pinNote") {
      executePinNote(confirmAction.noteId);
    }
  };

  /* ------ STATES ----------------------------- */
  if (!boardId) {
    return (
      <div
        className="note-manager glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="container">
          <div className="empty-state glass-card">
            <h3 style={{ color: colors.text }}>No Board Selected</h3>
            <p style={{ color: colors.textMuted }}>
              Choose a board first to view and manage notes.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (boardsLoading || (currentUser && !board)) {
    return (
      <div
        className="note-manager glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div
        className="note-manager glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="container">
          <div className="empty-state glass-card">
            <h3 style={{ color: colors.text }}>Board not found</h3>
            <p style={{ color: colors.textMuted }}>
              The selected board no longer exists.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------ UI ----------------------------- */
  return (
    <div
      className="note-manager glass-container"
      style={{ backgroundColor: colors.background }}
    >
      <div className="container">
        <PageBackButton fallback="/" />

        <div className="note-manager-header glass-card">
          <div>
            <h2 style={{ color: colors.text, margin: 0 }}>{board.name}</h2>
            <p style={{ color: colors.textMuted, margin: 0 }}>
              {board.description ||
                "Manage your notes, priorities, and files here."}
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleAddNote}>
            <AiOutlineFileAdd className="svg-size" /> New Note
          </button>
        </div>

        {notesLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notes...</p>
          </div>
        ) : (
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
                  guestNotes.find((item) => item.id === id),
                );
                setGuestNotes(reordered);
                guestStorage.saveNotes(boardId, reordered);
              }
            }}
          />
        )}
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
