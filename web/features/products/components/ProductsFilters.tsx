"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ProductPricingMode, ProductStatus } from "@/types/products";
import { fetchPrintCategories, fetchProductCategories } from "@/services/product-catalog-setup";

interface ProductsFiltersProps {
    search: string;
    status: ProductStatus | "all";
    pricingMode: ProductPricingMode | "all";
    printCategory: string;
    category: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: ProductStatus | "all") => void;
    onPricingModeChange: (value: ProductPricingMode | "all") => void;
    onPrintCategoryChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onReset: () => void;
}

export default function ProductsFilters({
    search,
    status,
    pricingMode,
    printCategory,
    category,
    onSearchChange,
    onStatusChange,
    onPricingModeChange,
    onPrintCategoryChange,
    onCategoryChange,
    onReset,
}: ProductsFiltersProps): ReactElement {
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    const { data: printCategories = [] } = useQuery({
        queryKey: ["print-categories"],
        queryFn: fetchPrintCategories,
        staleTime: 5 * 60 * 1000,
    });

    const { data: productCategories = [] } = useQuery({
        queryKey: ["product-categories"],
        queryFn: fetchProductCategories,
        staleTime: 5 * 60 * 1000,
    });

    const hasActiveFilters =
        status !== "all" || pricingMode !== "all" || Boolean(printCategory) || Boolean(category);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="relative sm:col-span-2">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search products or code..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value as ProductStatus | "all")}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                </select>
                <select
                    value={pricingMode}
                    onChange={(e) =>
                        onPricingModeChange(e.target.value as ProductPricingMode | "all")
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                >
                    <option value="all">All Pricing</option>
                    <option value="auto_calculate">Auto Calculate</option>
                    <option value="quote_only">Quote Only</option>
                </select>
            </div>

            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                >
                    <SlidersHorizontalIcon className="h-3.5 w-3.5" />
                    {showAdvanced ? "Hide filters" : "More filters"}
                </button>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                        <XIcon className="h-3.5 w-3.5" />
                        Clear filters
                    </button>
                )}
            </div>

            {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Print Category
                        </label>
                        <select
                            value={printCategory}
                            onChange={(e) => onPrintCategoryChange(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        >
                            <option value="">All Print Categories</option>
                            {printCategories.map((pc) => (
                                <option key={pc.id} value={pc.id.toString()}>
                                    {pc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        >
                            <option value="">All Categories</option>
                            {productCategories.map((cat) => (
                                <option key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
