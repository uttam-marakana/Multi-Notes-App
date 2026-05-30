export default function Pagination({
  meta,
  pageSizeOptions = [10, 15, 20],
  onPageSizeChange,
  onPageChange,
}) {
  if (!meta || meta.totalItems === 0) return null;

  const { page, totalPages, startIndex, endIndex, pageSize } = meta;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="text-sm text-muted flex items-center gap-2">
        <span>
          Showing <b>{startIndex}</b>-<b>{endIndex}</b> of <b>{meta.totalItems}</b>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted" style={{ whiteSpace: "nowrap" }}>
          Per page
        </label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="w-auto"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!canPrev}
          onClick={() => onPageChange?.(page - 1)}
        >
          Prev
        </button>

        <span className="text-sm text-muted">
          Page <b>{page}</b> / <b>{totalPages}</b>
        </span>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!canNext}
          onClick={() => onPageChange?.(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

