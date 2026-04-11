import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import PinInput from "../components/PinInput";
import PageBackButton from "../components/PageBackButton";

export default function AddBoard({ onSuccess }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  const nameRef = useRef();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProtected, setIsProtected] = useState(false);

  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState(false);

  const [loading, setLoading] = useState(false);

  const { addBoard } = useBoard();
  const { boardColorPalette } = useTheme();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

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

  const isValid =
    name.trim() && (!isProtected || (pin.length === 4 && pin === pinConfirm));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Board name is required");
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
        toast.error("PIN mismatch");
        return;
      }
    }

    setLoading(true);

    try {
      await addBoard({
        name: name.trim(),
        description: desc.trim(),
        color: selectedColor,
        isProtected,
        pin: isProtected ? pin : null,
      });

      toast.success("Board created!");

      setName("");
      setDesc("");
      setSelectedColor("#3B82F6");
      setIsProtected(false);
      setPin("");
      setPinConfirm("");
      setShowAdvanced(false);

      nameRef.current?.focus();
      onSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-board-wrapper">
      <div className="add-board-container glass-card">
        {location.pathname === "/boards/add" && <PageBackButton fallback="/" />}
        <h3>✨ Create New Board</h3>

        <form onSubmit={handleSubmit} className="add-board-form">
          <div className="form-group">
            <label>Board Name *</label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Board Color</label>
            <div className="color-picker">
              {boardColorPalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${
                    selectedColor === c ? "selected" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="advanced-toggle">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <TiArrowSortedDown /> : <TiArrowSortedUp />}{" "}
              Advanced
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-box active">
              <div onClick={() => setIsProtected((p) => !p)}>
                🔒 Protect Board ({isProtected ? "On" : "Off"})
              </div>

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
          )}

          <button disabled={!isValid || loading}>
            {loading ? "Creating..." : "Create Board"}
          </button>
        </form>
      </div>
    </div>
  );
}
