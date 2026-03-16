import type { ReactElement } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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
}: ProductsPaginationProps): ReactElement {
    const totalPages = Math.ceil(count / pageSize);
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, count);

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>
                    {startItem}–{endItem} of {count}
                </span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                    {[10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                            {size} / page
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm text-gray-700">
                    {page} / {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ChevronRightIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
