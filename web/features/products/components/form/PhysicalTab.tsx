"use client";

import type { ReactElement } from "react";
import type { ProductFormValues } from "@/types/products";
import FormField, { inputCls, selectCls } from "./FormField";

interface PhysicalTabProps {
    values: ProductFormValues;
    onValuesChange: (values: ProductFormValues) => void;
}

export default function PhysicalTab({ values, onValuesChange }: PhysicalTabProps): ReactElement {
    const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]): void => {
        onValuesChange({ ...values, [key]: value });
    };

    return (
        <div className="max-w-2xl space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Unit of Measure" hint="The base unit used when quoting and ordering this product">
                    <select className={selectCls} value={values.unit_of_measure} onChange={(e) => set("unit_of_measure", e.target.value as ProductFormValues["unit_of_measure"])}>
                        <option value="pieces">Pieces</option>
                        <option value="packs">Packs</option>
                        <option value="sets">Sets</option>
                        <option value="sqm">m²</option>
                        <option value="cm">Centimeters</option>
                    </select>
                </FormField>
                <FormField label="Custom Unit" hint="Enter a custom unit label if none of the standard options apply (e.g. Linear metre)">
                    <input
                        type="text"
                        className={inputCls}
                        placeholder="e.g. Linear metre"
                        value={values.unit_of_measure_custom}
                        onChange={(e) => set("unit_of_measure_custom", e.target.value)}
                    />
                </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FormField label="Weight" hint="Packed weight of one unit, used for shipping cost calculations">
                    <input type="number" className={inputCls} placeholder="0.00" min={0} step="0.01" value={values.weight} onChange={(e) => set("weight", e.target.value)} />
                </FormField>
                <FormField label="Weight Unit" hint="Unit that applies to the weight value on the left">
                    <select className={selectCls} value={values.weight_unit} onChange={(e) => set("weight_unit", e.target.value as ProductFormValues["weight_unit"])}>
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="gsm">GSM (g/m²)</option>
                    </select>
                </FormField>
                <FormField label="Dimension Unit" hint="Unit applied to the length, width, and height fields below">
                    <select className={selectCls} value={values.dimension_unit} onChange={(e) => set("dimension_unit", e.target.value as ProductFormValues["dimension_unit"])}>
                        <option value="cm">Centimeters</option>
                        <option value="mm">Millimeters</option>
                        <option value="in">Inches</option>
                    </select>
                </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FormField label="Length" hint="Longest external dimension of the packed product">
                    <input type="number" className={inputCls} placeholder="0.00" min={0} step="0.01" value={values.length} onChange={(e) => set("length", e.target.value)} />
                </FormField>
                <FormField label="Width" hint="Second dimension of the packed product">
                    <input type="number" className={inputCls} placeholder="0.00" min={0} step="0.01" value={values.width} onChange={(e) => set("width", e.target.value)} />
                </FormField>
                <FormField label="Height" hint="Third dimension / depth of the packed product">
                    <input type="number" className={inputCls} placeholder="0.00" min={0} step="0.01" value={values.height} onChange={(e) => set("height", e.target.value)} />
                </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Warranty" hint="Warranty policy shown on quotations, invoices, and the product detail page">
                    <select className={selectCls} value={values.warranty} onChange={(e) => set("warranty", e.target.value as ProductFormValues["warranty"])}>
                        <option value="satisfaction-guarantee">Satisfaction Guarantee</option>
                        <option value="no-warranty">No Warranty</option>
                        <option value="30-days">30 Days</option>
                        <option value="90-days">90 Days</option>
                    </select>
                </FormField>
                <FormField label="Country of Origin" hint="Country where this product is manufactured or sourced">
                    <select className={selectCls} value={values.country_of_origin} onChange={(e) => set("country_of_origin", e.target.value as ProductFormValues["country_of_origin"])}>
                        <option value="kenya">Kenya</option>
                        <option value="china">China</option>
                        <option value="india">India</option>
                        <option value="uae">UAE</option>
                    </select>
                </FormField>
            </div>
        </div>
    );
}
