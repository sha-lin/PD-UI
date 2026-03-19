"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import type { ProductFormValues } from "@/types/products";
import BasicTab from "./form/BasicTab";
import ClassificationTab from "./form/ClassificationTab";
import PricingTab from "./form/PricingTab";
import PhysicalTab from "./form/PhysicalTab";
import InventoryTab from "./form/InventoryTab";
import NotesTab from "./form/NotesTab";

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
    isNew?: boolean;
}

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
    isNew = false,
}: ProductFormProps): ReactElement {
    const [activeTab, setActiveTab] = useState<TabId>("basic");
    const activeTabIndex = TABS.findIndex((t) => t.id === activeTab);

    return (
        <div className="flex flex-col min-h-0">
            <div className="flex gap-1 border-b border-gray-200 bg-white px-4 overflow-x-auto">
                {TABS.map((tab, index) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-brand-blue text-brand-blue" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs">{index + 1}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "basic" && (
                    <BasicTab values={values} onValuesChange={onValuesChange} onImageChange={onImageChange} selectedImageName={selectedImageName} existingImageUrl={existingImageUrl} />
                )}
                {activeTab === "classification" && (
                    <ClassificationTab values={values} onValuesChange={onValuesChange} />
                )}
                {activeTab === "pricing" && (
                    <PricingTab values={values} onValuesChange={onValuesChange} isNew={isNew} />
                )}
                {activeTab === "physical" && (
                    <PhysicalTab values={values} onValuesChange={onValuesChange} />
                )}
                {activeTab === "inventory" && (
                    <InventoryTab values={values} onValuesChange={onValuesChange} />
                )}
                {activeTab === "notes" && (
                    <NotesTab values={values} onValuesChange={onValuesChange} />
                )}
            </div>

            <div className="border-t border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`h-2 w-2 rounded-full transition-colors ${activeTab === tab.id ? "bg-brand-blue" : "bg-gray-300"}`}
                                title={tab.label}
                                aria-label={`Go to ${tab.label}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        {activeTabIndex > 0 && (
                            <button type="button" onClick={() => setActiveTab(TABS[activeTabIndex - 1].id)} className="text-sm text-gray-500 hover:text-gray-700">
                                ← Back
                            </button>
                        )}
                        {activeTabIndex < TABS.length - 1 && (
                            <button type="button" onClick={() => setActiveTab(TABS[activeTabIndex + 1].id)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                Next →
                            </button>
                        )}
                        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="button" onClick={onSubmit} disabled={isSubmitting} className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60">
                            {isSubmitting ? "Saving..." : submitLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

