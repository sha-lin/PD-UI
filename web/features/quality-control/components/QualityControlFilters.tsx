import type { ChangeEvent, ReactElement } from "react";
import { QCStatus } from "@/types/quality-control";

interface QualityControlFiltersProps {
    search: string;
    status: QCStatus | "all";
    dateFrom: string;
    dateTo: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: QCStatus | "all") => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
}

export default function QualityControlFilters({
    search,
    status,
    dateFrom,
    dateTo,
    onSearchChange,
    onStatusChange,
    onDateFromChange,
    onDateToChange,
    onReset,
}: QualityControlFiltersProps): ReactElement {
    const statusOptions: Array<{ label: string; value: QCStatus | "all" }> = [
        { label: "All Status", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Passed", value: "passed" },
        { label: "Failed", value: "failed" },
        { label: "Rework", value: "rework" },
    ];

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSearchChange(event.target.value);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onStatusChange(event.target.value as QCStatus | "all");
    };

    const handleDateFromChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onDateFromChange(event.target.value);
    };

    const handleDateToChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onDateToChange(event.target.value);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="QC ID, job number, client, or quote"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="lg:col-span-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        {statusOptions.map((option: { label: string; value: QCStatus | "all" }): ReactElement => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <details className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                    Advanced filters
                </summary>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={handleDateFromChange}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={handleDateToChange}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>
                </div>
            </details>
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
