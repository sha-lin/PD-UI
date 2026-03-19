"use client";

import type { ReactElement } from "react";
import type { ProductFormValues } from "@/types/products";
import FormField, { inputCls, selectCls } from "./FormField";

interface PricingTabProps {
    values: ProductFormValues;
    onValuesChange: (values: ProductFormValues) => void;
    isNew?: boolean;
}

const PRICING_MODE_OPTIONS = [
    {
        value: "auto_calculate" as const,
        title: "Auto Calculate",
        description: "Price is computed live from product spec groups when customer configures their order.",
    },
    {
        value: "quote_only" as const,
        title: "Quote Only",
        description: "Production Team prices each order manually before it is sent to the client.",
    },
];

const BADGE_FLAGS: Array<{ key: keyof ProductFormValues; label: string }> = [
    { key: "is_visible", label: "Visible to customers" },
    { key: "feature_product", label: "Featured product" },
    { key: "bestseller_badge", label: "Bestseller badge" },
    { key: "new_arrival", label: "New arrival badge" },
    { key: "on_sale_badge", label: "On sale badge" },
];

export default function PricingTab({ values, onValuesChange, isNew = false }: PricingTabProps): ReactElement {
    const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]): void => {
        onValuesChange({ ...values, [key]: value });
    };

    return (
        <div className="max-w-2xl space-y-6">
            <FormField
                label="Pricing Mode"
                required
                hint="Auto Calculate: storefront computes price live from configured spec groups. Quote Only: Production Team prices each order manually."
            >
                <div className="grid grid-cols-2 gap-3 pt-1">
                    {PRICING_MODE_OPTIONS.map((option) => {
                        const selected = values.pricing_mode === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => set("pricing_mode", option.value)}
                                className={`rounded-xl border-2 p-4 text-left transition-colors ${selected ? "border-brand-blue bg-brand-blue/5" : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <p className={`text-sm font-semibold ${selected ? "text-brand-blue" : "text-gray-800"}`}>{option.title}</p>
                                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{option.description}</p>
                            </button>
                        );
                    })}
                </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="Status"
                    hint={isNew ? "New products are always saved as Draft — publish them after adding spec groups and pricing" : "Draft: only visible to admins. Published: live on the store. Archived: hidden and inactive."}
                >
                    {isNew ? (
                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">Draft</span>
                            <span className="text-xs text-amber-700">Add spec groups &amp; pricing, then publish.</span>
                        </div>
                    ) : (
                        <select className={selectCls} value={values.status} onChange={(e) => set("status", e.target.value as ProductFormValues["status"])}>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    )}
                </FormField>
                <FormField label="Storefront Visibility" hint="Controls where customers can discover this product — catalog browsing, search, both, or nowhere">
                    <select className={selectCls} value={values.visibility} onChange={(e) => set("visibility", e.target.value as ProductFormValues["visibility"])}>
                        <option value="catalog-search">Catalog and Search</option>
                        <option value="catalog-only">Catalog Only</option>
                        <option value="search-only">Search Only</option>
                        <option value="hidden">Hidden</option>
                    </select>
                </FormField>
            </div>

            <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Badges &amp; Flags</p>
                <div className="grid grid-cols-2 gap-3">
                    {BADGE_FLAGS.map(({ key, label }) => (
                        <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={values[key] as boolean}
                                onChange={(e) => set(key, e.target.checked)}
                                className="h-4 w-4 rounded text-brand-blue"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {values.new_arrival && (
                <FormField label="New Arrival Expiry" hint="The New Arrival badge is removed automatically on this date — leave blank to keep it indefinitely">
                    <input
                        type="date"
                        className={inputCls}
                        value={values.new_arrival_expires}
                        onChange={(e) => set("new_arrival_expires", e.target.value)}
                    />
                </FormField>
            )}
        </div>
    );
}
