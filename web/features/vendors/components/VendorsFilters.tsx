import type { ChangeEvent, ReactElement } from "react";

interface VendorsFiltersProps {
    search: string;
    active: "all" | "true" | "false";
    onSearchChange: (value: string) => void;
    onActiveChange: (value: "all" | "true" | "false") => void;
    onReset: () => void;
}

export default function VendorsFilters({
    search,
    active,
    onSearchChange,
    onActiveChange,
    onReset,
}: VendorsFiltersProps): ReactElement {
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSearchChange(event.target.value);
    };

    const handleActiveChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onActiveChange(event.target.value as "all" | "true" | "false");
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-9">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <p className="text-xs text-gray-500 mt-1">Type a vendor name, email, phone, or service.</p>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search vendors"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <p className="text-xs text-gray-500 mt-1">Filter by active vendors only.</p>
                    <select
                        value={active}
                        onChange={handleActiveChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
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
