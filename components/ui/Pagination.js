'use client';

/**
 * @typedef {Object} PaginationProps
 * @property {number} currentPage
 * @property {number} totalPages
 * @property {(page: number) => void} onPageChange
 */

/**
 * Reusable pagination component.
 * @param {PaginationProps} props
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="ui pagination menu">
      <button
        className={`item ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <div className="item">{currentPage} / {totalPages}</div>
      <button
        className={`item ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
