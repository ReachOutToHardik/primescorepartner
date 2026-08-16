'use client';

import React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-[var(--border)] text-xs text-[var(--ink-muted)] font-mono-num">
      {/* Rows Per Page Selector */}
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="p-1 border border-[var(--border)] rounded-md outline-none bg-[var(--surface)] text-[var(--ink)] font-body cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-[var(--ink-subtle)] border-l border-[var(--border)] pl-2">
          Showing {startRecord}-{endRecord} of {totalRecords} entries
        </span>
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        <span className="font-sans font-medium text-[var(--ink)] mr-2">
          Page <strong>{currentPage}</strong> of <strong>{Math.max(1, totalPages)}</strong>
        </span>

        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-md border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Previous Page"
        >
          <CaretLeft size={14} weight="bold" />
        </button>

        {/* Dynamic Page Number Buttons */}
        {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 rounded-md font-bold transition-all cursor-pointer ${
              currentPage === p
                ? 'bg-[var(--navy)] text-white shadow-2xs'
                : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-md border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Next Page"
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}
