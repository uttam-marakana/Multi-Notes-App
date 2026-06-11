import { useMemo, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import BoardCard from "./BoardCard";
import PINModal from "../ui/PINModal";
import { verifyPIN, grantProtectedAccess } from "../../utils/helpers";
import { isBoardTrashed } from "../../utils/trashStorage";

const BoardList = ({
  boards,
  onDelete,
  onPin,
  onDuplicate,
  searchText,
  protectedOnly,
}) => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid;

  const [showPINModal, setShowPINModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const normalizedQuery = (searchText || "").trim().toLowerCase();

  const filtered = useMemo(() => {
    const list = Array.from(boards || []).filter((b) => !isBoardTrashed(b.id));

    const base = list.filter((b) => {
      if (protectedOnly && !b.isProtected) return false;
      if (!normalizedQuery) return true;

      const name = String(b.name || "").toLowerCase();
      const description = String(b.description || "").toLowerCase();
      const color = String(b.color || "").toLowerCase();

      // favorites is represented by pinnedBy
      const isFav = Boolean(
        currentUserId && b.pinnedBy?.includes(currentUserId),
      );

      // protected status: accept common tokens in the query
      const q = normalizedQuery;
      const matchesProtected =
        q.includes("protected") || q.includes("secure") || q.includes("locked")
          ? Boolean(b.isProtected)
          : q.includes("unprotected") ||
              q.includes("open") ||
              q.includes("unlocked") ||
              q.includes("ready")
            ? !b.isProtected
            : true;

      // favorites token
      const matchesFav =
        q.includes("fav") || q.includes("favorite") || q.includes("pinned")
          ? isFav
          : true;

      return (
        name.includes(normalizedQuery) ||
        description.includes(normalizedQuery) ||
        color.includes(normalizedQuery) ||
        (matchesFav && matchesProtected)
      );
    });

    const pinned = base.filter((b) => b.pinnedBy?.includes(currentUserId));
    const unpinned = base.filter((b) => !b.pinnedBy?.includes(currentUserId));

    // keep stable UX: pinned first, then most recently created
    const sortedUnpinned = [...unpinned].sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return { pinned, sortedUnpinned };
  }, [boards, currentUserId, protectedOnly, normalizedQuery]);

  const totalMatches =
    (filtered?.pinned?.length || 0) + (filtered?.sortedUnpinned?.length || 0);

  const allPinned = filtered?.pinned || [];
  const allUnpinned = filtered?.sortedUnpinned || [];

  const handleRequirePin = (board, action) => {
    setSelectedBoard(board);
    setPendingAction(() => action);
    setShowPINModal(true);
  };

  const handlePINSubmit = async (pin) => {
    if (!selectedBoard || !verifyPIN(pin, selectedBoard.pin)) {
      throw new Error("Invalid PIN");
    }

    grantProtectedAccess("board", selectedBoard.id);

    setShowPINModal(false);

    const action = pendingAction;
    setPendingAction(null);
    setSelectedBoard(null);

    action?.(); // resume original flow
  };

  return (
    <>
      {/* Results summary (header search + filters live in Dashboard) */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div
          className="text-sm text-muted"
          style={{
            whiteSpace: "nowrap",
            padding: "0px 20px",
            borderRadius: "4px",
          }}
        >
          {totalMatches > 0 ? `${totalMatches} result(s)` : "No results"}
        </div>
      </div>

      {totalMatches === 0 ? (
        <div
          className="empty-state"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <h3 style={{ color: colors.text }}>No matching boards</h3>
          <p style={{ color: colors.textMuted }}>
            Try adjusting search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="board-list-container">
            {allPinned.length > 0 && (
              <div className="board-section">
                <h3 style={{ color: colors.text }}>⭐ Pinned Boards</h3>
                <div className="board-grid">
                  {allPinned.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onDelete={onDelete}
                      onPin={onPin}
                      onDuplicate={onDuplicate}
                      onRequirePin={handleRequirePin}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="board-section">
              <h3 style={{ color: colors.text }}>
                {allPinned.length > 0 ? "All Boards" : "Your Boards"}
              </h3>
              <div className="board-grid">
                {allUnpinned.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onDelete={onDelete}
                    onPin={onPin}
                    onDuplicate={onDuplicate}
                    onRequirePin={handleRequirePin}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <PINModal
        isOpen={showPINModal}
        onClose={() => {
          setShowPINModal(false);
          setPendingAction(null);
          setSelectedBoard(null);
        }}
        onSubmit={handlePINSubmit}
        title="Board Protected"
        description="Enter PIN to continue"
      />
    </>
  );
};

export default BoardList;
