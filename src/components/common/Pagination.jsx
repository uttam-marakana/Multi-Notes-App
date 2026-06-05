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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);


  return (
    <div className="w-full border-t border-base-300 pt-4">
      {/* Mobile-first layout: stack page info + controls */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        {/* Left */}
        <div className="text-sm text-base-content/70 whitespace-nowrap">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </div>

        {/* Right */}
        <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => onPageChange?.(page - 1)}
              className="btn btn-ghost btn-sm"
            >
              Previous
            </button>

            {/* Page numbers: allow horizontal scroll on very small screens */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-[100vw]">
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange?.(p)}
                  className={`btn btn-sm min-w-[36px] ${
                    page === p ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {p}
                </button>
              ))}
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
    </div>
  );
}
