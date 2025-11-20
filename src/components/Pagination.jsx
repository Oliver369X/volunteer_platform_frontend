'use strict';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Páginas alrededor de la actual
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Siempre mostrar última página
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
      {/* Info */}
      <div className="text-sm text-muted">
        Mostrando <span className="font-bold text-ink">{startItem}</span> a{' '}
        <span className="font-bold text-ink">{endItem}</span> de{' '}
        <span className="font-bold text-ink">{totalItems}</span> resultados
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-xl border-2 border-slate-200 bg-white p-2 text-muted transition-all hover:border-primary hover:text-primary hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 button-hover"
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted">
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  min-w-[2.5rem] rounded-xl px-3 py-2 text-sm font-bold transition-all
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg scale-110'
                      : 'bg-white border-2 border-slate-200 text-ink hover:border-primary hover:bg-primary/5'
                  }
                  button-hover
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-xl border-2 border-slate-200 bg-white p-2 text-muted transition-all hover:border-primary hover:text-primary hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 button-hover"
          aria-label="Página siguiente"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

