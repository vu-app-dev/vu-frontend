import { useState, useRef, useLayoutEffect } from 'react';

/**
 * Measures a table container via ResizeObserver and calculates how many rows
 * fit based on the header, pagination, and row heights.
 *
 * Heights are measured from the live DOM when possible, falling back to the
 * provided constants for the initial render.
 *
 * @param {{ rowHeight: number, headerHeight: number, paginationHeight: number }} sizes
 * @param {{ headerSelector?: string, paginationSelector?: string, rowSelector?: string }} selectors
 * @returns {{ tableRef: React.RefObject, itemsPerPage: number }}
 */
export function useResponsiveItemsPerPage(
  { rowHeight, headerHeight, paginationHeight },
  { headerSelector = '.table-header', paginationSelector, rowSelector = '.table-row' } = {}
) {
  const tableRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(1);

  useLayoutEffect(() => {
    const calculate = () => {
      if (!tableRef.current) return;
      const tableHeight = tableRef.current.clientHeight;
      if (tableHeight === 0) return;

      const headerEl = tableRef.current.querySelector(headerSelector);
      const paginationEl = paginationSelector
        ? tableRef.current.querySelector(paginationSelector)
        : null;
      const firstRowEl = tableRef.current.querySelector(rowSelector);

      const headerH = headerEl ? headerEl.offsetHeight : headerHeight;
      const paginationH = paginationEl ? paginationEl.offsetHeight : paginationHeight;
      const rowH = firstRowEl ? firstRowEl.offsetHeight : rowHeight;

      const available = tableHeight - headerH - paginationH;
      setItemsPerPage(Math.max(1, Math.floor(available / rowH)));
    };

    calculate();

    const el = tableRef.current;
    if (!el) return;

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', calculate);
      return () => window.removeEventListener('resize', calculate);
    }

    const observer = new ResizeObserver(calculate);
    observer.observe(el);

    return () => observer.disconnect();
  }, [rowHeight, headerHeight, paginationHeight, headerSelector, paginationSelector, rowSelector]);

  return { tableRef, itemsPerPage };
}
