import { LPOStatus } from "@/types/lpos";

interface LpoFiltersProps {
    search: string;
    status: LPOStatus | "all";
    dateFrom: string;
    dateTo: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: LPOStatus | "all") => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
}

export default function LpoFilters({
    search,
    status,
    dateFrom,
    dateTo,
    onSearchChange,
    onStatusChange,
    onDateFromChange,
    onDateToChange,
    onReset,
}: LpoFiltersProps) {
    const statusOptions: Array<{ label: string; value: LPOStatus | "all" }> = [
        { label: "All Status", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "In Production", value: "in_production" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="LPO number, client, or quote"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <select
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as LPOStatus | "all")}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => onDateFromChange(event.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => onDateToChange(event.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
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
