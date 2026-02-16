import type { ChangeEvent, ReactElement } from "react";
import type { LeadSource, LeadStatus } from "@/types/leads";

interface LeadsFiltersProps {
    search: string;
    status: "all" | LeadStatus;
    source: "all" | LeadSource;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: "all" | LeadStatus) => void;
    onSourceChange: (value: "all" | LeadSource) => void;
    onReset: () => void;
}

export default function LeadsFilters({
    search,
    status,
    source,
    onSearchChange,
    onStatusChange,
    onSourceChange,
    onReset,
}: LeadsFiltersProps): ReactElement {
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSearchChange(event.target.value);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onStatusChange(event.target.value as "all" | LeadStatus);
    };

    const handleSourceChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onSourceChange(event.target.value as "all" | LeadSource);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <p className="text-xs text-gray-500 mt-1">Lead ID, name, email, or phone.</p>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search leads"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <p className="text-xs text-gray-500 mt-1">Lead stage.</p>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
                <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</label>
                    <p className="text-xs text-gray-500 mt-1">Acquisition channel.</p>
                    <select
                        value={source}
                        onChange={handleSourceChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Event">Event</option>
                        <option value="Other">Other</option>
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
