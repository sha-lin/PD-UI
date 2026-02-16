import type { ChangeEvent, ReactElement } from "react";
import type { QuoteStatus } from "@/types/quotes";

interface QuotesFiltersProps {
    search: string;
    status: "all" | QuoteStatus;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: "all" | QuoteStatus) => void;
    onReset: () => void;
}

export default function QuotesFilters({
    search,
    status,
    onSearchChange,
    onStatusChange,
    onReset,
}: QuotesFiltersProps): ReactElement {
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSearchChange(event.target.value);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onStatusChange(event.target.value as "all" | QuoteStatus);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <p className="text-xs text-gray-500 mt-1">Quote ID, product, or reference number.</p>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search quotes"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <p className="text-xs text-gray-500 mt-1">Current quote stage.</p>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All</option>
                        <option value="Draft">Draft</option>
                        <option value="Sent to PT">Sent to PT</option>
                        <option value="Costed">Costed</option>
                        <option value="Sent to Customer">Sent to Customer</option>
                        <option value="Approved">Approved</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <button
                    type="button"
                    onClick={onReset}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    Clear filters
                </button>
            </div>
        </div>
    );
}
