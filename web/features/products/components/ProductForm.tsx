"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, TagIcon } from "lucide-react";
import type { ProductFormValues } from "@/types/products";
import {
    fetchPrintCategories,
    fetchProductCategories,
    fetchProductFamilies,
    fetchProductSubCategories,
    fetchProductTags,
} from "@/services/product-catalog-setup";

type TabId = "basic" | "classification" | "pricing" | "physical" | "inventory" | "notes";

interface Tab {
    id: TabId;
    label: string;
}

const TABS: Tab[] = [
    { id: "basic", label: "Basic Info" },
    { id: "classification", label: "Classification" },
    { id: "pricing", label: "Pricing & Visibility" },
    { id: "physical", label: "Physical" },
    { id: "inventory", label: "Inventory" },
    { id: "notes", label: "Notes" },
];

interface ProductFormProps {
    values: ProductFormValues;
    onValuesChange: (values: ProductFormValues) => void;
    onImageChange: (file: File | null) => void;
    selectedImageName: string | null;
    onSubmit: () => void;
    onCancel: () => void;
    submitLabel: string;
    isSubmitting: boolean;
    existingImageUrl?: string | null;
}

function Field({
    label,
    required,
    children,
    hint,
}: {
    label: string;
    required?: boolean;
    children: ReactElement;
    hint?: string;
}): ReactElement {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
    );
}

const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

const selectCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

const textareaCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue resize-y";

export default function ProductForm({
    values,
    onValuesChange,
    onImageChange,
    selectedImageName,
    onSubmit,
    onCancel,
    submitLabel,
    isSubmitting,
    existingImageUrl,
}: ProductFormProps): ReactElement {
    const [activeTab, setActiveTab] = useState<TabId>("basic");

    const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]): void => {
        onValuesChange({ ...values, [key]: value });
    };

    const activeTabIndex = TABS.findIndex((t) => t.id === activeTab);

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

    const selectedCategoryId = values.primary_category
        ? Number(values.primary_category)
        : undefined;

    const { data: subCategories = [] } = useQuery({
        queryKey: ["product-subcategories", selectedCategoryId],
        queryFn: () => fetchProductSubCategories(selectedCategoryId),
        enabled: Boolean(selectedCategoryId),
        staleTime: 5 * 60 * 1000,
    });

    const { data: productFamilies = [] } = useQuery({
        queryKey: ["product-families"],
        queryFn: fetchProductFamilies,
        staleTime: 5 * 60 * 1000,
    });

    const { data: availableTags = [] } = useQuery({
        queryKey: ["product-tags"],
        queryFn: fetchProductTags,
        staleTime: 5 * 60 * 1000,
    });

    const handleCategoryChange = (categoryId: string): void => {
        onValuesChange({ ...values, primary_category: categoryId, sub_category: "" });
    };

    const toggleTag = (tagId: number): void => {
        const current = values.tag_ids;
        const next = current.includes(tagId)
            ? current.filter((id) => id !== tagId)
            : [...current, tagId];
        set("tag_ids", next);
    };

    return (
        <div className="flex flex-col min-h-0">
            {/* Tab bar */}
            <div className="flex gap-1 border-b border-gray-200 bg-white px-4 overflow-x-auto">
                {TABS.map((tab, index) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? "border-b-2 border-brand-blue text-brand-blue"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs">
                            {index + 1}
                        </span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "basic" && (
                    <div className="max-w-2xl space-y-5">
                        <Field label="Product Name" required>
                            <input
                                type="text"
                                className={inputCls}
                                placeholder="e.g. Business Cards – Premium"
                                value={values.name}
                                onChange={(e) => set("name", e.target.value)}
                            />
                        </Field>
                        <Field label="Short Description" required hint={`${values.short_description.length}/150 characters`}>
                            <input
                                type="text"
                                className={inputCls}
                                placeholder="One-line summary shown in listings"
                                maxLength={150}
                                value={values.short_description}
                                onChange={(e) => set("short_description", e.target.value)}
                            />
                        </Field>
                        <Field label="Full Description" required>
                            <textarea
                                className={textareaCls}
                                rows={5}
                                placeholder="Detailed product description shown on the product page"
                                value={values.long_description}
                                onChange={(e) => set("long_description", e.target.value)}
                            />
                        </Field>
                        <Field label="Maintenance & Care" hint="Care instructions visible to clients">
                            <textarea
                                className={textareaCls}
                                rows={3}
                                placeholder="e.g. Store in a cool, dry place away from direct sunlight"
                                value={values.maintenance}
                                onChange={(e) => set("maintenance", e.target.value)}
                            />
                        </Field>
                        <Field label="Technical Specifications" hint="Technical details for internal and client reference">
                            <textarea
                                className={textareaCls}
                                rows={3}
                                placeholder="e.g. 350gsm coated art board, CMYK print, matte/gloss laminate"
                                value={values.technical_specs}
                                onChange={(e) => set("technical_specs", e.target.value)}
                            />
                        </Field>
                    </div>
                )}

                {activeTab === "classification" && (
                    <div className="max-w-2xl space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Print Category">
                                <select
                                    className={selectCls}
                                    value={values.print_category}
                                    onChange={(e) => set("print_category", e.target.value)}
                                >
                                    <option value="">Select print category</option>
                                    {printCategories.map((pc) => (
                                        <option key={pc.id} value={pc.id.toString()}>
                                            {pc.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Product Type">
                                <select
                                    className={selectCls}
                                    value={values.product_type}
                                    onChange={(e) =>
                                        set(
                                            "product_type",
                                            e.target.value as ProductFormValues["product_type"],
                                        )
                                    }
                                >
                                    <option value="physical">Physical Product</option>
                                    <option value="digital">Digital Product</option>
                                    <option value="service">Service</option>
                                </select>
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Category">
                                <select
                                    className={selectCls}
                                    value={values.primary_category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                >
                                    <option value="">Select category</option>
                                    {productCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Sub-Category" hint={!selectedCategoryId ? "Select a category first" : undefined}>
                                <select
                                    className={selectCls}
                                    value={values.sub_category}
                                    onChange={(e) => set("sub_category", e.target.value)}
                                    disabled={!selectedCategoryId}
                                >
                                    <option value="">Select sub-category</option>
                                    {subCategories.map((sc) => (
                                        <option key={sc.id} value={sc.id.toString()}>
                                            {sc.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <Field label="Product Family">
                            <select
                                className={selectCls}
                                value={values.product_family}
                                onChange={(e) => set("product_family", e.target.value)}
                            >
                                <option value="">Select product family</option>
                                {productFamilies.map((fam) => (
                                    <option key={fam.id} value={fam.id.toString()}>
                                        {fam.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Tags" hint="Select all relevant tags">
                            <div className="flex flex-wrap gap-2 pt-1">
                                {availableTags.map((tag) => {
                                    const selected = values.tag_ids.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                selected
                                                    ? "bg-brand-blue text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {selected ? (
                                                <CheckIcon className="h-3 w-3" />
                                            ) : (
                                                <TagIcon className="h-3 w-3" />
                                            )}
                                            {tag.name}
                                        </button>
                                    );
                                })}
                                {availableTags.length === 0 && (
                                    <p className="text-xs text-gray-400">No tags available</p>
                                )}
                            </div>
                        </Field>
                    </div>
                )}

                {activeTab === "pricing" && (
                    <div className="max-w-2xl space-y-6">
                        <Field label="Pricing Mode" required hint="Auto Calculate: storefront computes price live from configured spec groups. Quote Only: Production Team prices each order manually.">
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                {(
                                    [
                                        {
                                            value: "auto_calculate",
                                            title: "Auto Calculate",
                                            description:
                                                "Price is computed live from product spec groups when customer configures their order.",
                                        },
                                        {
                                            value: "quote_only",
                                            title: "Quote Only",
                                            description:
                                                "Production Team prices each order manually before it is sent to the client.",
                                        },
                                    ] as const
                                ).map((option) => {
                                    const selected = values.pricing_mode === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => set("pricing_mode", option.value)}
                                            className={`rounded-xl border-2 p-4 text-left transition-colors ${
                                                selected
                                                    ? "border-brand-blue bg-brand-blue/5"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <p className={`text-sm font-semibold ${selected ? "text-brand-blue" : "text-gray-800"}`}>
                                                {option.title}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                                {option.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Status">
                                <select
                                    className={selectCls}
                                    value={values.status}
                                    onChange={(e) =>
                                        set(
                                            "status",
                                            e.target.value as ProductFormValues["status"],
                                        )
                                    }
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </Field>
                            <Field label="Storefront Visibility">
                                <select
                                    className={selectCls}
                                    value={values.visibility}
                                    onChange={(e) =>
                                        set(
                                            "visibility",
                                            e.target.value as ProductFormValues["visibility"],
                                        )
                                    }
                                >
                                    <option value="catalog-search">Catalog and Search</option>
                                    <option value="catalog-only">Catalog Only</option>
                                    <option value="search-only">Search Only</option>
                                    <option value="hidden">Hidden</option>
                                </select>
                            </Field>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Badges & Flags</p>
                            <div className="grid grid-cols-2 gap-3">
                                {(
                                    [
                                        { key: "is_visible", label: "Visible to customers" },
                                        { key: "feature_product", label: "Featured product" },
                                        { key: "bestseller_badge", label: "Bestseller badge" },
                                        { key: "new_arrival", label: "New arrival badge" },
                                        { key: "on_sale_badge", label: "On sale badge" },
                                    ] as Array<{ key: keyof ProductFormValues; label: string }>
                                ).map(({ key, label }) => (
                                    <label
                                        key={key}
                                        className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50"
                                    >
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
                            <Field label="New Arrival Expiry" hint="Badge is removed automatically on this date">
                                <input
                                    type="date"
                                    className={inputCls}
                                    value={values.new_arrival_expires}
                                    onChange={(e) => set("new_arrival_expires", e.target.value)}
                                />
                            </Field>
                        )}
                    </div>
                )}

                {activeTab === "physical" && (
                    <div className="max-w-2xl space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Unit of Measure">
                                <select
                                    className={selectCls}
                                    value={values.unit_of_measure}
                                    onChange={(e) =>
                                        set(
                                            "unit_of_measure",
                                            e.target.value as ProductFormValues["unit_of_measure"],
                                        )
                                    }
                                >
                                    <option value="pieces">Pieces</option>
                                    <option value="packs">Packs</option>
                                    <option value="sets">Sets</option>
                                    <option value="sqm">m²</option>
                                    <option value="cm">Centimeters</option>
                                </select>
                            </Field>
                            <Field label="Custom Unit" hint="Fill if unit not in the list above">
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder="e.g. Linear metre"
                                    value={values.unit_of_measure_custom}
                                    onChange={(e) => set("unit_of_measure_custom", e.target.value)}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Field label="Weight">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0.00"
                                    min={0}
                                    step="0.01"
                                    value={values.weight}
                                    onChange={(e) => set("weight", e.target.value)}
                                />
                            </Field>
                            <Field label="Weight Unit">
                                <select
                                    className={selectCls}
                                    value={values.weight_unit}
                                    onChange={(e) =>
                                        set(
                                            "weight_unit",
                                            e.target.value as ProductFormValues["weight_unit"],
                                        )
                                    }
                                >
                                    <option value="kg">Kilograms</option>
                                    <option value="g">Grams</option>
                                    <option value="gsm">GSM (g/m²)</option>
                                </select>
                            </Field>
                            <Field label="Dimension Unit">
                                <select
                                    className={selectCls}
                                    value={values.dimension_unit}
                                    onChange={(e) =>
                                        set(
                                            "dimension_unit",
                                            e.target.value as ProductFormValues["dimension_unit"],
                                        )
                                    }
                                >
                                    <option value="cm">Centimeters</option>
                                    <option value="mm">Millimeters</option>
                                    <option value="in">Inches</option>
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Field label="Length">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0.00"
                                    min={0}
                                    step="0.01"
                                    value={values.length}
                                    onChange={(e) => set("length", e.target.value)}
                                />
                            </Field>
                            <Field label="Width">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0.00"
                                    min={0}
                                    step="0.01"
                                    value={values.width}
                                    onChange={(e) => set("width", e.target.value)}
                                />
                            </Field>
                            <Field label="Height">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0.00"
                                    min={0}
                                    step="0.01"
                                    value={values.height}
                                    onChange={(e) => set("height", e.target.value)}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Warranty">
                                <select
                                    className={selectCls}
                                    value={values.warranty}
                                    onChange={(e) =>
                                        set(
                                            "warranty",
                                            e.target.value as ProductFormValues["warranty"],
                                        )
                                    }
                                >
                                    <option value="satisfaction-guarantee">Satisfaction Guarantee</option>
                                    <option value="no-warranty">No Warranty</option>
                                    <option value="30-days">30 Days</option>
                                    <option value="90-days">90 Days</option>
                                </select>
                            </Field>
                            <Field label="Country of Origin">
                                <select
                                    className={selectCls}
                                    value={values.country_of_origin}
                                    onChange={(e) =>
                                        set(
                                            "country_of_origin",
                                            e.target.value as ProductFormValues["country_of_origin"],
                                        )
                                    }
                                >
                                    <option value="kenya">Kenya</option>
                                    <option value="china">China</option>
                                    <option value="india">India</option>
                                    <option value="uae">UAE</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                )}

                {activeTab === "inventory" && (
                    <div className="max-w-2xl space-y-5">
                        <Field label="Stock Status">
                            <select
                                className={selectCls}
                                value={values.stock_status}
                                onChange={(e) =>
                                    set(
                                        "stock_status",
                                        e.target.value as ProductFormValues["stock_status"],
                                    )
                                }
                            >
                                <option value="made_to_order">Made to Order</option>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                                <option value="discontinued">Discontinued</option>
                            </select>
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Stock Quantity">
                                <input
                                    type="number"
                                    className={inputCls}
                                    min={0}
                                    value={values.stock_quantity}
                                    onChange={(e) => set("stock_quantity", Number(e.target.value))}
                                />
                            </Field>
                            <Field label="Low Stock Threshold" hint="Alert when quantity falls below this">
                                <input
                                    type="number"
                                    className={inputCls}
                                    min={0}
                                    value={values.low_stock_threshold}
                                    onChange={(e) =>
                                        set("low_stock_threshold", Number(e.target.value))
                                    }
                                />
                            </Field>
                        </div>

                        <div className="space-y-3">
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={values.track_inventory}
                                    onChange={(e) => set("track_inventory", e.target.checked)}
                                    className="h-4 w-4 rounded text-brand-blue"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Track Inventory</p>
                                    <p className="text-xs text-gray-400">
                                        Automatically update stock levels when orders are placed
                                    </p>
                                </div>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={values.allow_backorders}
                                    onChange={(e) => set("allow_backorders", e.target.checked)}
                                    className="h-4 w-4 rounded text-brand-blue"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Allow Backorders</p>
                                    <p className="text-xs text-gray-400">
                                        Accept orders even when stock is unavailable
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === "notes" && (
                    <div className="max-w-2xl space-y-5">
                        <Field label="Internal Notes" hint="Only visible to staff — never shown to clients">
                            <textarea
                                className={textareaCls}
                                rows={4}
                                placeholder="Notes for the production team, pricing rationale, supplier details..."
                                value={values.internal_notes}
                                onChange={(e) => set("internal_notes", e.target.value)}
                            />
                        </Field>
                        <Field label="Client Notes" hint="Visible to clients on the product page">
                            <textarea
                                className={textareaCls}
                                rows={4}
                                placeholder="Additional notes you want clients to see when viewing this product..."
                                value={values.client_notes}
                                onChange={(e) => set("client_notes", e.target.value)}
                            />
                        </Field>
                        <Field label="Product Image">
                            <div className="space-y-2">
                                {existingImageUrl && (
                                    <img
                                        src={existingImageUrl}
                                        alt="Current product"
                                        className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                                    className="block text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-blue/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-blue hover:file:bg-brand-blue/20"
                                />
                                {selectedImageName && (
                                    <p className="text-xs text-gray-500">{selectedImageName}</p>
                                )}
                            </div>
                        </Field>
                    </div>
                )}
            </div>

            {/* Sticky action bar */}
            <div className="border-t border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {TABS.map((tab, index) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`h-2 w-2 rounded-full transition-colors ${
                                    activeTab === tab.id ? "bg-brand-blue" : "bg-gray-300"
                                }`}
                                title={tab.label}
                                aria-label={`Go to ${tab.label}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        {activeTabIndex > 0 && (
                            <button
                                type="button"
                                onClick={() => setActiveTab(TABS[activeTabIndex - 1].id)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                ← Back
                            </button>
                        )}
                        {activeTabIndex < TABS.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab(TABS[activeTabIndex + 1].id)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Next →
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                        >
                            {isSubmitting ? "Saving..." : submitLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
