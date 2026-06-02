import React from "react";

export default function Pagination({
  meta,
  pageSizeOptions = [10, 15, 20],
  onPageSizeChange,
  onPageChange,
}) {
  if (!meta || meta.totalItems === 0) return null;

  const { page, totalPages, pageSize } = meta;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="w-full border-t border-base-300 pt-4">
      <div className="flex w-full items-baseline block-space">
        {/* Left */}
        <div className="text-sm text-base-content/70 whitespace-nowrap">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="pageSize"
            className="text-sm text-base-content/70 whitespace-nowrap"
            id="pagination-lable"
          >
            Per page
          </label>

          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="select select-bordered select-sm w-20 min-w-[80px]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange?.(page - 1)}
            className="btn btn-ghost btn-sm"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((item, index) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-base-content/50"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange?.(item)}
                  className={`btn btn-sm min-w-[36px] ${
                    page === item ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange?.(page + 1)}
            className="btn btn-ghost btn-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
