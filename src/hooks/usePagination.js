import { useCallback, useEffect, useMemo, useState } from "react";

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

function normalizeItemsPerPage(value) {
  if (value === "all" || value == null) return null;

  const num = Number(value);

  return Number.isFinite(num) && num > 0 ? num : null;
}

export function usePagination(
  allItems = [],
  { initialPage = 1, initialItemsPerPage = 6 } = {},
) {
  const [currentPage, setCurrentPageState] = useState(initialPage);

  const [itemsPerPage, setItemsPerPageState] = useState(
    normalizeItemsPerPage(initialItemsPerPage),
  );

  const totalItems = allItems.length;

  const totalPages = useMemo(() => {
    if (itemsPerPage == null) {
      return totalItems > 0 ? 1 : 0;
    }

    return totalItems === 0 ? 0 : Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  // Keep current page within valid range
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPageState(1);
      return;
    }

    setCurrentPageState((prev) => clamp(prev, 1, totalPages));
  }, [totalPages]);

  const startIndex = useMemo(() => {
    if (totalItems === 0) return 0;

    if (itemsPerPage == null) return 0;

    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage, totalItems]);

  const currentItems = useMemo(() => {
    if (totalItems === 0) {
      return [];
    }

    if (itemsPerPage == null) {
      return allItems;
    }

    return allItems.slice(startIndex, startIndex + itemsPerPage);
  }, [allItems, startIndex, itemsPerPage, totalItems]);

  const displayStart = totalItems === 0 ? 0 : startIndex + 1;

  const displayEnd =
    totalItems === 0
      ? 0
      : itemsPerPage == null
        ? totalItems
        : Math.min(startIndex + itemsPerPage, totalItems);

  const setCurrentPage = useCallback(
    (page) => {
      setCurrentPageState((prev) => {
        const nextPage = typeof page === "function" ? page(prev) : page;

        return clamp(Number(nextPage) || 1, 1, Math.max(totalPages, 1));
      });
    },
    [totalPages],
  );

  const setItemsPerPage = useCallback((value) => {
    setItemsPerPageState(normalizeItemsPerPage(value));

    // Always return to first page
    setCurrentPageState(1);
  }, []);

  return {
    currentPage,
    setCurrentPage,

    itemsPerPage,
    setItemsPerPage,

    totalItems,
    totalPages,

    currentItems,

    displayStart,
    displayEnd,
  };
}
