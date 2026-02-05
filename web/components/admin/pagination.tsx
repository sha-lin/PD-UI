import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onNext: () => void;
    onPrevious: () => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    onNext,
    onPrevious,
}: PaginationProps) {
    return (
        <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>
                <button
                    onClick={onNext}
                    disabled={!hasNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
