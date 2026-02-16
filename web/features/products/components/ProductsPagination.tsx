import type { ChangeEvent, ReactElement } from "react";

interface ProductsPaginationProps {
    count: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export default function ProductsPagination({
    count,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: ProductsPaginationProps): ReactElement | null {
    const totalPages = Math.max(1, Math.ceil(count / pageSize));

    if (count === 0) {
        return null;
    }

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onPageSizeChange(Number(event.target.value));
    };

    const handlePrevious = (): void => {
        onPageChange(Math.max(1, page - 1));
    };

    const handleNext = (): void => {
        onPageChange(Math.min(totalPages, page + 1));
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
                Page {page} of {totalPages} · {count.toLocaleString()} products
            </div>
            <div className="flex items-center gap-3">
                <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                    {[10, 20, 30, 50].map((size: number): ReactElement => (
                        <option key={size} value={size}>
                            {size} / page
                        </option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={page === 1}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={page === totalPages}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
