import React from "react";

function buildPageLabel(token, page) {
  if (token === "..." || token === "ellipsis") return "...";
  if (typeof token === "number") return String(token);
  return String(page);
}

export default function Pagination({
  totalItems,
  totalPages,
  currentPage,
  displayStart,
  displayEnd,
  onPageChange,
}) {
  if (!totalItems || totalItems === 0 || !totalPages || totalPages <= 0) {
    return null;
  }

  const canPrev = Number(currentPage) > 1;
  const canNext = Number(currentPage) < Number(totalPages);

  const pageTokens = (() => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1,
      );
    }

    const pages = new Set([
      1,
      totalPages,
      currentPage,
      currentPage - 1,
      currentPage + 1,
    ]);

    const sorted = Array.from(pages)
      .filter(
        (page) =>
          page >= 1 && page <= totalPages,
      )
      .sort((a, b) => a - b);

    const tokens = [];

    for (let i = 0; i < sorted.length; i++) {
      const page = sorted[i];

      if (
        i > 0 &&
        page - sorted[i - 1] > 1
      ) {
        tokens.push("...");
      }

      tokens.push(page);
    }

    return tokens;
  })();

  return (
    <div className="w-full border-t border-base-300 pt-4">
      <div className="flex gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Result Summary */}
        <div className="text-sm text-base-content/70 whitespace-nowrap">
          Showing {displayStart}–{displayEnd} of{" "}
          {totalItems} notes
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:flex-nowrap">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() =>
              onPageChange?.(
                Number(currentPage) - 1,
              )
            }
            className="btn btn-ghost btn-sm"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {pageTokens.map((token, index) => {
              if (token === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-sm text-base-content/70"
                  >
                    ...
                  </span>
                );
              }

              const page = token;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    onPageChange?.(page)
                  }
                  className={`btn btn-sm min-w-9 ${
                    Number(page) ===
                    Number(currentPage)
                      ? "btn-primary"
                      : "btn-ghost"
                  }`}
                  aria-current={
                    Number(page) ===
                    Number(currentPage)
                      ? "page"
                      : undefined
                  }
                >
                  {buildPageLabel(
                    token,
                    page,
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canNext}
            onClick={() =>
              onPageChange?.(
                Number(currentPage) + 1,
              )
            }
            className="btn btn-ghost btn-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}