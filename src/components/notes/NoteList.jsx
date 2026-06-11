import { useEffect, useMemo, useState } from "react";

import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import NoteCard from "./NoteCard";

import Drawer from "../common/Drawer";
import Pagination from "../common/Pagination";
import SearchWithSuggestions from "../common/SearchWithSuggestions";
import { usePagination } from "../../hooks/usePagination";

import { isNoteTrashed } from "../../utils/trashStorage";

const NoteList = ({ notes, boardId, onEdit, onDelete, onPin, onClone }) => {
  const { colors } = useTheme();

  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid;

  const [filterOpen, setFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [priority, setPriority] = useState("all");

  // Always keep hooks order stable: early-returns based on notes length
  // are handled at the UI layer below.
  // Note: keep hooks order stable (no early returns before hooks)
  const safeNotes = useMemo(() => (Array.isArray(notes) ? notes : []), [notes]);

  const visibleNotes = useMemo(
    () => safeNotes.filter((n) => !isNoteTrashed(n.boardId, n.id)),
    [safeNotes],
  );

  const normalizedQuery = (searchText || "").trim().toLowerCase();

  const suggestions = useMemo(() => {
    const list = visibleNotes;

    return list
      .map((n) => ({
        id: n.id,
        label: n.title || (n.content ? n.content.slice(0, 30) : "Untitled"),
      }))
      .slice(0, 200);
  }, [visibleNotes]);

  const filtered = useMemo(() => {
    const list = Array.from(visibleNotes || []);

    const base = list.filter((n) => {
      const matchesPriority =
        priority === "all" ? true : (n.priority || "low") === priority;
      if (!matchesPriority) return false;

      if (!normalizedQuery) return true;
      const title = String(n.title || "").toLowerCase();
      const content = String(n.content || "").toLowerCase();

      // board name is not passed into NoteList; but NoteCard shows boardId only.
      // We still support boardId textual match.
      const boardIdStr = String(n.boardId || "").toLowerCase();
      const q = normalizedQuery;

      // favorites represented by pinnedBy
      const isFav = Boolean(
        currentUserId && n.pinnedBy?.includes(currentUserId),
      );

      // protected status: match common tokens, otherwise allow through
      const matchesProtected =
        q.includes("protected") || q.includes("secure") || q.includes("locked")
          ? Boolean(n.isProtected)
          : q.includes("unprotected") ||
              q.includes("open") ||
              q.includes("unlocked") ||
              q.includes("ready")
            ? !n.isProtected
            : true;

      const matchesFav =
        q.includes("fav") || q.includes("favorite") || q.includes("pinned")
          ? isFav
          : true;

      return (
        title.includes(q) ||
        content.includes(q) ||
        boardIdStr.includes(q) ||
        (matchesFav && matchesProtected)
      );
    });

    const pinned = base.filter((n) => n.pinnedBy?.includes(currentUserId));
    const unpinned = base.filter((n) => !n.pinnedBy?.includes(currentUserId));

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedUnpinned = [...unpinned].sort(
      (a, b) =>
        priorityOrder[a.priority || "low"] - priorityOrder[b.priority || "low"],
    );

    return { pinned, sortedUnpinned };
  }, [visibleNotes, currentUserId, priority, normalizedQuery]);

  const totalMatches =
    (filtered?.pinned?.length || 0) + (filtered?.sortedUnpinned?.length || 0);

  const allPinned = useMemo(() => filtered?.pinned || [], [filtered]);
  const allUnpinned = useMemo(() => filtered?.sortedUnpinned || [], [filtered]);

  // Sorting + filtering happen above; pagination applies after.
  const combinedForPagination = useMemo(() => {
    return [...allPinned, ...allUnpinned];
  }, [allPinned, allUnpinned]);

  const {
    currentPage,
    totalPages,
    totalItems,
    currentItems,
    setItemsPerPage,
    displayStart,
    displayEnd,
    setCurrentPage,
    itemsPerPage,
  } = usePagination(combinedForPagination, {
    initialPage: 1,
    initialItemsPerPage: 12,
  });

  const paginatedPinned = useMemo(
    () => currentItems.filter((n) => n.pinnedBy?.includes(currentUserId)),
    [currentItems, currentUserId],
  );

  const paginatedUnpinned = useMemo(
    () => currentItems.filter((n) => !n.pinnedBy?.includes(currentUserId)),
    [currentItems, currentUserId],
  );

  // Reset page whenever search/filter inputs change.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, priority]);

  return (
    <div className="note-list-container">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setFilterOpen(true)}
            aria-label="Open note filters"
          >
            Filters
          </button>

          <div className="w-[320px] max-w-[70vw]">
            <SearchWithSuggestions
              label="Search"
              value={searchText}
              onChange={setSearchText}
              placeholder="Search notes by title or content..."
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

      <Drawer
        isOpen={filterOpen}
        title="Note Filters"
        onClose={() => setFilterOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted">Priority</label>
            <select
              className="mt-1"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted">Notes Per Page</label>

            <select
              className="mt-1"
              value={itemsPerPage ?? "all"}
              onChange={(e) =>
                setItemsPerPage(
                  e.target.value === "all" ? null : Number(e.target.value),
                )
              }
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn btn-ghost btn-sm flex-1"
              onClick={() => {
                setPriority("all");
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
          <h3 style={{ color: colors.text }}>No matching notes</h3>
          <p style={{ color: colors.textMuted }}>
            Try adjusting search or filters.
          </p>
        </div>
      ) : (
        <>
          {/* Render ONLY current page notes */}
          {currentItems.length > 0 && (
            <>
              {paginatedPinned.length > 0 && (
                <div className="note-section">
                  <h3 style={{ color: colors.text }}>⭐ Pinned Notes</h3>
                  <div className="note-grid">
                    {paginatedPinned.map((note) => (
                      <NoteCard
                        key={`${note.id}-${currentPage}`}
                        note={note}
                        boardId={boardId}
                        onEdit={() => onEdit?.(note.id)}
                        onDelete={() => onDelete?.(note.id)}
                        onPin={() => onPin?.(note.id)}
                        onClone={() => onClone?.(note.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="note-section">
                <h3 style={{ color: colors.text }}>
                  {allPinned.length > 0 ? "All Notes" : "Your Notes"}
                </h3>
                <div className="note-grid">
                  {paginatedUnpinned.map((note) => (
                    <NoteCard
                      key={`${note.id}-${currentPage}`}
                      note={note}
                      boardId={boardId}
                      onEdit={() => onEdit?.(note.id)}
                      onDelete={() => onDelete?.(note.id)}
                      onPin={() => onPin?.(note.id)}
                      onClone={() => onClone?.(note.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <Pagination
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            displayStart={displayStart}
            displayEnd={displayEnd}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default NoteList;
