import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InventoryPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const InventoryPagination: React.FC<InventoryPaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            <button
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-2 rounded-full border border-[#0D0D0D]/10 text-[#0D0D0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0D0D0D]/5 transition-colors"
            >
                <ChevronLeft size={20} />
            </button>
            <span className="text-[#0D0D0D] font-medium">
                Page {currentPage + 1} of {totalPages}
            </span>
            <button
                disabled={currentPage === totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-2 rounded-full border border-[#0D0D0D]/10 text-[#0D0D0D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0D0D0D]/5 transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};