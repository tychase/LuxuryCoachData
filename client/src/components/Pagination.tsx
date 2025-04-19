import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Calculate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always include first page
    pageNumbers.push(1);
    
    // Calculate middle pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Always include last page if there's more than one page
    if (totalPages > 1) {
      if (pageNumbers[pageNumbers.length - 1] !== totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="mt-10 flex justify-center">
      <nav className="flex items-center space-x-2" aria-label="Pagination">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-[var(--neutral-200)] transition-colors text-[var(--neutral-500)]"
        >
          <i className="fas fa-chevron-left"></i>
          <span className="sr-only">Previous</span>
        </Button>
        
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="text-[var(--neutral-500)]">...</span>
            );
          }
          
          return (
            <Button
              key={`page-${page}`}
              variant={page === currentPage ? 'default' : 'outline'}
              onClick={() => onPageChange(page as number)}
              className={
                page === currentPage 
                  ? "p-2 w-10 h-10 flex items-center justify-center rounded-md bg-[var(--navy-900)] text-white font-medium"
                  : "p-2 w-10 h-10 flex items-center justify-center rounded-md hover:bg-[var(--neutral-200)] transition-colors text-[var(--neutral-800)] font-medium"
              }
            >
              {page}
            </Button>
          );
        })}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-[var(--neutral-200)] transition-colors text-[var(--neutral-500)]"
        >
          <i className="fas fa-chevron-right"></i>
          <span className="sr-only">Next</span>
        </Button>
      </nav>
    </div>
  );
};

export default Pagination;
