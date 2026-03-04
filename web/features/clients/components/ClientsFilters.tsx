import type { ChangeEvent, ReactElement } from "react";
import type { ClientStatus, ClientType } from "@/types/clients";

interface ClientsFiltersProps {
    search: string;
    status: "all" | ClientStatus;
    clientType: "all" | ClientType;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: "all" | ClientStatus) => void;
    onClientTypeChange: (value: "all" | ClientType) => void;
    onReset: () => void;
}

export default function ClientsFilters({
    search,
    status,
    clientType,
    onSearchChange,
    onStatusChange,
    onClientTypeChange,
    onReset,
}: ClientsFiltersProps): ReactElement {
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSearchChange(event.target.value);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onStatusChange(event.target.value as "all" | ClientStatus);
    };

    const handleClientTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onClientTypeChange(event.target.value as "all" | ClientType);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <p className="text-xs text-gray-500 mt-1">Client ID, name, email, phone, or company.</p>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search clients"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <p className="text-xs text-gray-500 mt-1">Lifecycle state.</p>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All</option>
                        <option value="Active">Active</option>
                        <option value="Dormant">Dormant</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client Type</label>
                    <p className="text-xs text-gray-500 mt-1">Business or retail.</p>
                    <select
                        value={clientType}
                        onChange={handleClientTypeChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All</option>
                        <option value="B2B">B2B</option>
                        <option value="B2C">B2C</option>
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
