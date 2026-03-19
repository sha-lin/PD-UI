"use client";

import type { ReactElement } from "react";
import type { ProductFormValues } from "@/types/products";
import FormField, { inputCls, textareaCls } from "./FormField";

interface BasicTabProps {
    values: ProductFormValues;
    onValuesChange: (values: ProductFormValues) => void;
    onImageChange: (file: File | null) => void;
    selectedImageName: string | null;
    existingImageUrl?: string | null;
}

export default function BasicTab({
    values,
    onValuesChange,
    onImageChange,
    selectedImageName,
    existingImageUrl,
}: BasicTabProps): ReactElement {
    const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]): void => {
        onValuesChange({ ...values, [key]: value });
    };

    return (
        <div className="max-w-2xl space-y-5">
            <FormField
                label="Product Image"
                hint="Main product photo shown on the storefront and in listings — JPG or PNG, min 800×800px, max 5 MB"
            >
                <div className="flex items-start gap-4">
                    {existingImageUrl ? (
                        <img
                            src={existingImageUrl}
                            alt="Current product"
                            className="h-24 w-24 shrink-0 rounded-xl object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                            </svg>
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                            className="block text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-blue/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-blue hover:file:bg-brand-blue/20"
                        />
                        {selectedImageName && <p className="text-xs text-gray-500">{selectedImageName}</p>}
                        {!existingImageUrl && !selectedImageName && (
                            <p className="text-xs text-gray-400">No image uploaded yet</p>
                        )}
                    </div>
                </div>
            </FormField>

            <FormField label="Product Name" required hint="The public-facing name shown in listings, invoices, and on the storefront">
                <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Business Cards – Premium"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                />
            </FormField>

            <FormField
                label="Short Description"
                required
                hint={`One-line summary shown in product listings and search results (${values.short_description.length}/150 chars)`}
            >
                <input
                    type="text"
                    className={inputCls}
                    placeholder="One-line summary shown in listings"
                    maxLength={150}
                    value={values.short_description}
                    onChange={(e) => set("short_description", e.target.value)}
                />
            </FormField>

            <FormField label="Full Description" required hint="Detailed content displayed on the product detail page. Supports plain text and line breaks.">
                <textarea
                    className={textareaCls}
                    rows={5}
                    placeholder="Detailed product description shown on the product page"
                    value={values.long_description}
                    onChange={(e) => set("long_description", e.target.value)}
                />
            </FormField>

            <FormField label="Maintenance & Care" hint="Storage and handling instructions displayed to clients on the product page">
                <textarea
                    className={textareaCls}
                    rows={3}
                    placeholder="e.g. Store in a cool, dry place away from direct sunlight"
                    value={values.maintenance}
                    onChange={(e) => set("maintenance", e.target.value)}
                />
            </FormField>

            <FormField label="Technical Specifications" hint="Print specs, substrate, finish, and other technical details shown to clients and used internally">
                <textarea
                    className={textareaCls}
                    rows={3}
                    placeholder="e.g. 350gsm coated art board, CMYK print, matte/gloss laminate"
                    value={values.technical_specs}
                    onChange={(e) => set("technical_specs", e.target.value)}
                />
            </FormField>
        </div>
    );
}
