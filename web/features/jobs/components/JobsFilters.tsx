import type { ChangeEvent, ReactElement } from "react";
import type { JobStatus } from "@/types/jobs";

interface JobsFiltersProps {
    search: string;
    status: "all" | JobStatus;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: "all" | JobStatus) => void;
    onReset: () => void;
}

export default function JobsFilters({
    search,
    status,
    onSearchChange,
    onStatusChange,
    onReset,
}: JobsFiltersProps): ReactElement {
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSearchChange(event.target.value);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onStatusChange(event.target.value as "all" | JobStatus);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <p className="text-xs text-gray-500 mt-1">Job number, description, or product.</p>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search jobs"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <p className="text-xs text-gray-500 mt-1">Filter by job status.</p>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
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
