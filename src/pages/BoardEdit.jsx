import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
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

export default function BoardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { boards, loading, updateBoard } = useBoard();
  const { colors, boardColorPalette } = useTheme();

  const board = useMemo(
    () => boards.find((item) => item.id === id),
    [boards, id],
  );
  const nameRef = useRef(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [isProtected, setIsProtected] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(
    !id || hasProtectedAccess("board", id),
  );

  useEffect(() => {
    if (!board) return;

    setName(board.name || "");
    setDescription(board.description || "");
    setSelectedColor(board.color || "#3B82F6");
    setIsProtected(Boolean(board.isProtected));

    const verified =
      !board.isProtected || hasProtectedAccess("board", board.id);
    setIsUnlocked(verified);
    setShowPINModal(board.isProtected && !verified);
  }, [board]);

  useEffect(() => {
    nameRef.current?.focus();
  }, [isUnlocked]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!board) {
      toast.error("Board not found");
      return;
    }

    if (!name.trim()) {
      toast.error("Board name is required");
      return;
    }

    if (isProtected && pin) {
      if (pin.length !== 4) {
        toast.error("PIN must be 4 digits");
        return;
      }

      if (pin !== pinConfirm) {
        toast.error("PINs do not match");
        return;
      }
    }

    setSaving(true);

    try {
      await updateBoard(board.id, {
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        isProtected,
        pin: isProtected ? pin || undefined : null,
      });

      toast.success("Board updated successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Failed to update board");
    } finally {
      setSaving(false);
    }
  };

  const handlePINSubmit = async (enteredPIN) => {
    if (!board || !verifyPIN(enteredPIN, board.pin)) {
      throw new Error("Invalid PIN");
    }

    grantProtectedAccess("board", board.id);
    setIsUnlocked(true);
    setShowPINModal(false);
  };

  if (loading || !board) {
    return (
      <div
        className="add-note-container glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="container">
          <div className="add-note-card glass-card">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading board...</p>
              </div>
            ) : (
              <div className="empty-state glass-card">
                <h3 style={{ color: colors.text }}>Board not found</h3>
                <p style={{ color: colors.textMuted }}>
                  The board you are trying to edit is unavailable.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/")}
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (board.isProtected && !isUnlocked) {
    return (
      <div
        className="add-note-container glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="container">
          <div className="add-note-card glass-card">
            <h2 style={{ color: colors.text }}>Board Protected</h2>
            <p style={{ color: colors.textMuted }}>
              Enter the board PIN to edit its details, color, and protection
              settings.
            </p>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowPINModal(true)}
              >
                Unlock Board
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/")}>
                Back
              </button>
            </div>
          </div>
        </div>

        <PINModal
          isOpen={showPINModal}
          onClose={() => setShowPINModal(false)}
          onSubmit={handlePINSubmit}
          title="Board Protected"
          description="Enter the current board PIN to continue editing."
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
          <PageBackButton fallback="/" />
          <h2 style={{ color: colors.text }}>Edit Board</h2>

          <form onSubmit={handleSubmit} className="add-note-form">
            <div className="form-group">
              <label style={{ color: colors.text }}>Board Name *</label>
              <input
                ref={nameRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength="100"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Description</label>
              <textarea
                rows="5"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Board Color</label>
              <ColorPicker value={selectedColor} onChange={setSelectedColor} />
            </div>

            <div className="form-group">
              <label style={{ color: colors.text }}>Change Pin</label>
              <div className={`advanced-box ${isProtected ? "active" : ""}`}>
                <div className="advanced-header">
                  <div className="flex items-center gap-2">
                    <span>Protect Board</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setIsProtected((prev) => !prev);
                      setPin("");
                      setPinConfirm("");
                    }}
                  >
                    {isProtected ? "Disable" : "Enable"}
                  </button>
                </div>

                {isProtected && (
                  <div className="pin-wrapper open">
                    <div className="pin-group">
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
                    </div>
                    <small className="text-muted">
                      Leave both fields empty to keep the current PIN unchanged.
                    </small>
                  </div>
                )}
              </div>
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
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Board"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
