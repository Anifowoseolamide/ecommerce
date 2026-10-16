import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

// 1 … 4 5 [6] 7 8 … 20: first, last, and a window around the current page
function pageItems(current, total) {
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => wanted.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => wanted.add(n));

  const pages = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const items = [];
  pages.forEach((n, i) => {
    if (i > 0 && n - pages[i - 1] > 1) items.push(`gap-${n}`);
    items.push(n);
  });
  return items;
}

// pagination: { page, page_size, total, total_pages } as returned by the API
export default function Pagination({ pagination, onPageChange, disabled = false, noun = 'items' }) {
  if (!pagination || pagination.total_pages <= 1) return null;

  const { page, page_size: pageSize, total, total_pages: totalPages } = pagination;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const go = (n) => {
    if (!disabled && n >= 1 && n <= totalPages && n !== page) onPageChange(n);
  };

  return (
    <nav className="pagination" aria-label={`${noun} pages`}>
      <span className="pagination-summary">
        Showing {first}–{last} of {total} {noun}
      </span>
      <div className="pagination-controls">
        <button type="button" className="pagination-btn" onClick={() => go(page - 1)} disabled={disabled || page === 1} aria-label="Previous page">
          <ChevronLeft size={15} />
        </button>
        {pageItems(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="pagination-gap" aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`pagination-btn ${item === page ? 'active' : ''}`}
              onClick={() => go(item)}
              disabled={disabled}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}
        <button type="button" className="pagination-btn" onClick={() => go(page + 1)} disabled={disabled || page === totalPages} aria-label="Next page">
          <ChevronRight size={15} />
        </button>
      </div>
    </nav>
  );
}
