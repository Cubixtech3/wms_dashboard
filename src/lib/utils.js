import { useState, useEffect } from "react";

export const currency = (n) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n);

export const dateFmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/** Debounce a fast-changing value (e.g. search input) by `delay` ms. */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Simple client-side pagination over an already-filtered/sorted array. */
export function usePagination(items, pageSize) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [items.length]);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const slice = items.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
  return { page: clampedPage, setPage, totalPages, slice };
}
