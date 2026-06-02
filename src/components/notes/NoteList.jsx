import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import NoteCard from "./NoteCard";

import Drawer from "../common/Drawer";
import Pagination from "../common/Pagination";
import SearchWithSuggestions from "../common/SearchWithSuggestions";
import { usePagination } from "../../hooks/usePagination";

const PAGE_SIZE_OPTIONS = [10, 15, 25];

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

  const normalizedQuery = (searchText || "").trim().toLowerCase();

  const suggestions = useMemo(() => {
    const list = safeNotes;

    return list
      .map((n) => ({
        id: n.id,
        label: n.title || (n.content ? n.content.slice(0, 30) : "Untitled"),
      }))
      .slice(0, 200);
  }, [safeNotes]);

  const filtered = useMemo(() => {
    const list = Array.from(safeNotes || []);

    const base = list.filter((n) => {
      const matchesPriority =
        priority === "all" ? true : (n.priority || "low") === priority;
      if (!matchesPriority) return false;

      if (!normalizedQuery) return true;
      const title = String(n.title || "").toLowerCase();
      const content = String(n.content || "").toLowerCase();

      return (
        title.includes(normalizedQuery) || content.includes(normalizedQuery)
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
  }, [safeNotes, currentUserId, priority, normalizedQuery]);

  const combinedForPagination = useMemo(() => {
    const pinned = filtered?.pinned || [];
    const sortedUnpinned = filtered?.sortedUnpinned || [];
    return [...pinned, ...sortedUnpinned];
  }, [filtered]);

  const { pagedItems, PaginationMeta, setPage, setPageSize } = usePagination(
    combinedForPagination,
    { initialPageSize: 10 },
  );

  useEffect(() => {
    setPage(1);
  }, [searchText, priority, setPage]);

  const pagePinned = useMemo(() => {
    const pinnedIds = new Set((filtered?.pinned || []).map((n) => n.id));
    return pagedItems.filter((n) => pinnedIds.has(n.id));
  }, [pagedItems, filtered]);

  const pageUnpinned = useMemo(() => {
    const pinnedIds = new Set((filtered?.pinned || []).map((n) => n.id));
    return pagedItems.filter((n) => !pinnedIds.has(n.id));
  }, [pagedItems, filtered]);

  const totalMatches =
    (filtered?.pinned?.length || 0) + (filtered?.sortedUnpinned?.length || 0);

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
          {pagePinned.length > 0 && (
            <div className="note-section">
              <h3 style={{ color: colors.text }}>⭐ Pinned Notes</h3>
              <div className="note-grid">
                {pagePinned.map((note) => (
                  <NoteCard
                    key={note.id}
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
              {pagePinned.length > 0 ? "All Notes" : "Your Notes"}
            </h3>
            <div className="note-grid">
              {pageUnpinned.map((note) => (
                <NoteCard
                  key={note.id}
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

          <Pagination
            meta={PaginationMeta}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={(size) => setPageSize(size)}
            onPageChange={(next) => setPage(next)}
          />
        </>
      )}
    </div>
  );
};

export default NoteList;
