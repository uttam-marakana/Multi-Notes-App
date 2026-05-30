import { useMemo, useState, useEffect } from "react";

export function usePagination(items, { initialPageSize = 10 } = {}) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const totalItems = items?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    // if filters/search reduce results, keep page in bounds
    setPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

  const setPageSafe = (next) => {
    setPage(() => {
      const clamped = Math.max(1, Math.min(next, totalPages));
      return clamped;
    });
  };

  const pagedItems = useMemo(() => {
    if (!items) return [];
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const PaginationMeta = {
    page,
    pageSize,
    totalItems,
    totalPages,
    startIndex: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    endIndex: Math.min(totalItems, page * pageSize),
  };

  return {
    pagedItems,
    PaginationMeta,
    setPage: setPageSafe,
    setPageSize: (size) => {
      setPageSize(size);
      setPage(1);
    },
  };
}

