"use client";

import type { ReactElement } from "react";
import type { ProductFormValues } from "@/types/products";
import FormField, { inputCls, selectCls } from "./FormField";

interface InventoryTabProps {
    values: ProductFormValues;
    onValuesChange: (values: ProductFormValues) => void;
}

export default function InventoryTab({ values, onValuesChange }: InventoryTabProps): ReactElement {
    const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]): void => {
        onValuesChange({ ...values, [key]: value });
    };

    return (
        <div className="max-w-2xl space-y-5">
            <FormField label="Stock Status" hint="Availability shown to customers on the storefront and used in order management">
                <select className={selectCls} value={values.stock_status} onChange={(e) => set("stock_status", e.target.value as ProductFormValues["stock_status"])}>
                    <option value="made_to_order">Made to Order</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Stock Quantity" hint="Current number of units available in stock">
                    <input type="number" className={inputCls} min={0} value={values.stock_quantity} onChange={(e) => set("stock_quantity", Number(e.target.value))} />
                </FormField>
                <FormField label="Low Stock Threshold" hint="A low-stock alert is triggered when available quantity drops below this number">
                    <input type="number" className={inputCls} min={0} value={values.low_stock_threshold} onChange={(e) => set("low_stock_threshold", Number(e.target.value))} />
                </FormField>
            </div>

            <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
                    <input type="checkbox" checked={values.track_inventory} onChange={(e) => set("track_inventory", e.target.checked)} className="h-4 w-4 rounded text-brand-blue" />
                    <div>
                        <p className="text-sm font-medium text-gray-800">Track Inventory</p>
                        <p className="text-xs text-gray-400">Automatically update stock levels when orders are placed</p>
                    </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
                    <input type="checkbox" checked={values.allow_backorders} onChange={(e) => set("allow_backorders", e.target.checked)} className="h-4 w-4 rounded text-brand-blue" />
                    <div>
                        <p className="text-sm font-medium text-gray-800">Allow Backorders</p>
                        <p className="text-xs text-gray-400">Accept orders even when stock is unavailable</p>
                    </div>
                </label>
            </div>
        </div>
    );
}
