import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import BoardCard from "./BoardCard";
import PINModal from "../PINModal";
import { verifyPIN, grantProtectedAccess } from "../../utils/helpers";
import Drawer from "../common/Drawer";
import Pagination from "../common/Pagination";
import SearchWithSuggestions from "../common/SearchWithSuggestions";
import { usePagination } from "../../hooks/usePagination";

const PAGE_SIZE_OPTIONS = [10, 15, 25];

const BoardList = ({ boards, onDelete, onPin, onDuplicate }) => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid;

  const [showPINModal, setShowPINModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [protectedOnly, setProtectedOnly] = useState(false);

  const normalizedQuery = (searchText || "").trim().toLowerCase();

  const suggestions = useMemo(() => {
    const list = Array.isArray(boards) ? boards : [];
    return list
      .map((b) => ({
        id: b.id,
        label: b.name || "Untitled Board",
      }))
      .slice(0, 200);
  }, [boards]);

  const filtered = useMemo(() => {
    const list = Array.from(boards || []);

    const base = list.filter((b) => {
      if (protectedOnly && !b.isProtected) return false;
      if (!normalizedQuery) return true;

      const name = String(b.name || "").toLowerCase();
      const description = String(b.description || "").toLowerCase();

      return name.includes(normalizedQuery) || description.includes(normalizedQuery);
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

  const combinedForPagination = useMemo(() => {
    return [...(filtered?.pinned || []), ...(filtered?.sortedUnpinned || [])];
  }, [filtered]);

  const { pagedItems, PaginationMeta, setPage, setPageSize } = usePagination(
    combinedForPagination,
    { initialPageSize: 10 },
  );

  useEffect(() => {
    setPage(1);
  }, [searchText, protectedOnly, setPage]);

  const pagePinned = useMemo(() => {
    const pinnedIds = new Set((filtered?.pinned || []).map((b) => b.id));
    return pagedItems.filter((b) => pinnedIds.has(b.id));
  }, [pagedItems, filtered]);

  const pageUnpinned = useMemo(() => {
    const pinnedIds = new Set((filtered?.pinned || []).map((b) => b.id));
    return pagedItems.filter((b) => !pinnedIds.has(b.id));
  }, [pagedItems, filtered]);

  const totalMatches =
    (filtered?.pinned?.length || 0) + (filtered?.sortedUnpinned?.length || 0);

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
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setFilterOpen(true)}
            aria-label="Open board filters"
          >
            Filters
          </button>


          <div className="w-[320px] max-w-[70vw]">
            <SearchWithSuggestions
              label="Search"
              value={searchText}
              onChange={setSearchText}
              placeholder="Search boards by name or description..."
              suggestions={suggestions}
              getSuggestionLabel={(s) => s.label}
              onPickSuggestion={(s) => setSearchText(s?.label || "")}
            />
          </div>
        </div>

        <div className="text-sm text-muted" style={{ whiteSpace: "nowrap" }}>
          {totalMatches > 0 ? `${totalMatches} result(s)` : "No results"}
        </div>
      </div>

      <Drawer isOpen={filterOpen} title="Board Filters" onClose={() => setFilterOpen(false)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={protectedOnly}
                onChange={(e) => setProtectedOnly(e.target.checked)}
              />
              Protected boards only
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn btn-ghost btn-sm flex-1"
              onClick={() => {
                setProtectedOnly(false);
                setSearchText("");
              }}
            >
              Reset
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm flex-1"
              onClick={() => setFilterOpen(false)}
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>


      {totalMatches === 0 ? (
        <div
          className="empty-state"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <h3 style={{ color: colors.text }}>No matching boards</h3>
          <p style={{ color: colors.textMuted }}>Try adjusting search or filters.</p>
        </div>
      ) : (
        <>
          <div className="board-list-container">
            {pagePinned.length > 0 && (
              <div className="board-section">
                <h3 style={{ color: colors.text }}>⭐ Pinned Boards</h3>
                <div className="board-grid">
                  {pagePinned.map((board) => (
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
                {pagePinned.length > 0 ? "All Boards" : "Your Boards"}
              </h3>
              <div className="board-grid">
                {pageUnpinned.map((board) => (
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

          <Pagination
            meta={PaginationMeta}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={(size) => setPageSize(size)}
            onPageChange={(next) => setPage(next)}
          />
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

