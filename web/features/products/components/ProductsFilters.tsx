import { useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import type {
    ProductCustomizationLevel,
    ProductStatus,
    ProductVisibility,
} from "@/types/products";

interface ProductsFiltersProps {
    search: string;
    status: "all" | ProductStatus;
    customizationLevel: "all" | ProductCustomizationLevel;
    category: string;
    subCategory: string;
    visibility: "all" | ProductVisibility;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: "all" | ProductStatus) => void;
    onCustomizationChange: (value: "all" | ProductCustomizationLevel) => void;
    onCategoryChange: (value: string) => void;
    onSubCategoryChange: (value: string) => void;
    onVisibilityChange: (value: "all" | ProductVisibility) => void;
    onReset: () => void;
}

export default function ProductsFilters({
    search,
    status,
    customizationLevel,
    category,
    subCategory,
    visibility,
    onSearchChange,
    onStatusChange,
    onCustomizationChange,
    onCategoryChange,
    onSubCategoryChange,
    onVisibilityChange,
    onReset,
}: ProductsFiltersProps): ReactElement {
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSearchChange(event.target.value);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onStatusChange(event.target.value as "all" | ProductStatus);
    };

    const handleCustomizationChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onCustomizationChange(event.target.value as "all" | ProductCustomizationLevel);
    };

    const handleCategoryChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onCategoryChange(event.target.value);
    };

    const handleSubCategoryChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onSubCategoryChange(event.target.value);
    };

    const handleVisibilityChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        onVisibilityChange(event.target.value as "all" | ProductVisibility);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                    <p className="text-xs text-gray-500 mt-1">Name or internal code.</p>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search products"
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <p className="text-xs text-gray-500 mt-1">Draft, published, archived.</p>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="all">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end mt-3">
                <button
                    type="button"
                    onClick={(): void => setShowAdvanced((prev: boolean): boolean => !prev)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                    {showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
                </button>
            </div>

            {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customization</label>
                        <p className="text-xs text-gray-500 mt-1">Pricing complexity.</p>
                        <select
                            value={customizationLevel}
                            onChange={handleCustomizationChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            <option value="all">All</option>
                            <option value="non_customizable">Non-Customizable</option>
                            <option value="semi_customizable">Semi-Customizable</option>
                            <option value="fully_customizable">Fully Customizable</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Visibility</label>
                        <p className="text-xs text-gray-500 mt-1">Catalog display rules.</p>
                        <select
                            value={visibility}
                            onChange={handleVisibilityChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            <option value="all">All</option>
                            <option value="catalog-search">Catalog & Search</option>
                            <option value="catalog-only">Catalog Only</option>
                            <option value="search-only">Search Only</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                        <p className="text-xs text-gray-500 mt-1">Primary category.</p>
                        <input
                            type="text"
                            value={category}
                            onChange={handleCategoryChange}
                            placeholder="Print Products"
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sub-Category</label>
                        <p className="text-xs text-gray-500 mt-1">Secondary category.</p>
                        <input
                            type="text"
                            value={subCategory}
                            onChange={handleSubCategoryChange}
                            placeholder="Business Cards"
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>
                </div>
            )}
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
