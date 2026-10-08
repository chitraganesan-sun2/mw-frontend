"use client";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useQueryState } from "nuqs";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange?: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    className = "",
}) => {
    const [, setPage] = useQueryState("page", { defaultValue: "1" });

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setPage(page.toString());
            onPageChange?.(page);
        }
    };

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) {
        // Show pagination info even for single page if there are items
        return totalItems > 0 ? (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Showing {startItem} to {endItem} of {totalItems} results
                </div>
            </div>
        ) : null;
    }

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {/* Items info */}
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing {startItem} to {endItem} of {totalItems} results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1 overflow-x-auto">
                {/* Previous button */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 touch-manipulation"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getVisiblePages().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && handlePageChange(page)}
                            disabled={page === "..."}
                            className={`flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-md text-sm font-medium touch-manipulation ${
                                page === currentPage
                                    ? "bg-action text-white border border-action"
                                    : page === "..."
                                    ? "text-gray-400 cursor-default"
                                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                            aria-label={typeof page === "number" ? `Go to page ${page}` : undefined}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 touch-manipulation"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
