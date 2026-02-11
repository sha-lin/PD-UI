import type { ChangeEvent, ReactElement } from "react";
import { ProcessCategory, ProcessPricingType, ProcessStatus } from "@/types/processes";

interface ProcessesFiltersProps {
    search: string;
    status: ProcessStatus | "all";
    pricingType: ProcessPricingType | "all";
    category: ProcessCategory | "all";
    onSearchChange: (value: string) => void;
    onStatusChange: (value: ProcessStatus | "all") => void;
    onPricingTypeChange: (value: ProcessPricingType | "all") => void;
    onCategoryChange: (value: ProcessCategory | "all") => void;
    onReset: () => void;
}

export default function ProcessesFilters({
    search,
    status,
    pricingType,
    category,
    onSearchChange,
    onStatusChange,
    onPricingTypeChange,
    onCategoryChange,
    onReset,
}: ProcessesFiltersProps): ReactElement {
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSearchChange(event.target.value);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onStatusChange(event.target.value as ProcessStatus | "all");
    };

    const handlePricingTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onPricingTypeChange(event.target.value as ProcessPricingType | "all");
    };

    const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onCategoryChange(event.target.value as ProcessCategory | "all");
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Process name, ID, or description"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pricing Type</label>
                    <select
                        value={pricingType}
                        onChange={handlePricingTypeChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All Types</option>
                        <option value="tier">Tier-Based</option>
                        <option value="formula">Formula-Based</option>
                    </select>
                </div>
                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                    <select
                        value={category}
                        onChange={handleCategoryChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All Categories</option>
                        <option value="outsourced">Outsourced</option>
                        <option value="in_house">In-house</option>
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
