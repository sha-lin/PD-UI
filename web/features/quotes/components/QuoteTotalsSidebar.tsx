"use client";

import type { ReactElement } from "react";

interface QuoteTotalsSidebarProps {
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
    enableTax: boolean;
    taxRate: number;
    enableShipping: boolean;
    shippingCharges: number;
    enableAdjustment: boolean;
    adjustmentAmount: number;
    adjustmentReason: string;
    onEnableTaxChange: (value: boolean) => void;
    onTaxRateChange: (value: number) => void;
    onEnableShippingChange: (value: boolean) => void;
    onShippingChargesChange: (value: number) => void;
    onEnableAdjustmentChange: (value: boolean) => void;
    onAdjustmentAmountChange: (value: number) => void;
    onAdjustmentReasonChange: (value: string) => void;
}

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 2,
    }).format(value);

const rowClass = "flex items-center justify-between py-2";
const labelClass = "text-sm text-gray-500";
const valueClass = "text-sm font-medium text-gray-900 tabular-nums";
const inputClass =
    "px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-right w-28";
const toggleLabelClass = "flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none";

export default function QuoteTotalsSidebar({
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal,
    enableTax,
    taxRate,
    enableShipping,
    shippingCharges,
    enableAdjustment,
    adjustmentAmount,
    adjustmentReason,
    onEnableTaxChange,
    onTaxRateChange,
    onEnableShippingChange,
    onShippingChargesChange,
    onEnableAdjustmentChange,
    onAdjustmentAmountChange,
    onAdjustmentReasonChange,
}: QuoteTotalsSidebarProps): ReactElement {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Quote Totals</h2>

            <div className="divide-y divide-gray-100">
                <div className={rowClass}>
                    <span className={labelClass}>Subtotal</span>
                    <span className={valueClass}>{formatCurrency(subtotal)}</span>
                </div>

                {discountTotal > 0 && (
                    <div className={rowClass}>
                        <span className={labelClass}>Discount</span>
                        <span className="text-sm font-medium text-brand-green tabular-nums">
                            − {formatCurrency(discountTotal)}
                        </span>
                    </div>
                )}

                {/* Tax toggle */}
                <div className="py-2 space-y-2">
                    <label className={toggleLabelClass}>
                        <input
                            type="checkbox"
                            checked={enableTax}
                            onChange={(e): void => onEnableTaxChange(e.target.checked)}
                            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                        />
                        Apply VAT
                    </label>
                    {enableTax && (
                        <div className="flex items-center justify-between pl-6">
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="number"
                                    value={taxRate}
                                    onChange={(e): void => onTaxRateChange(Number(e.target.value))}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue text-right w-16"
                                />
                                <span className="text-xs text-gray-500">%</span>
                            </div>
                            <span className={valueClass}>{formatCurrency(taxTotal)}</span>
                        </div>
                    )}
                </div>

                {/* Shipping toggle */}
                <div className="py-2 space-y-2">
                    <label className={toggleLabelClass}>
                        <input
                            type="checkbox"
                            checked={enableShipping}
                            onChange={(e): void => onEnableShippingChange(e.target.checked)}
                            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                        />
                        Shipping charges
                    </label>
                    {enableShipping && (
                        <div className="flex items-center justify-between pl-6">
                            <input
                                type="number"
                                value={shippingCharges}
                                onChange={(e): void => onShippingChargesChange(Number(e.target.value))}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className={inputClass}
                            />
                        </div>
                    )}
                </div>

                {/* Adjustment toggle */}
                <div className="py-2 space-y-2">
                    <label className={toggleLabelClass}>
                        <input
                            type="checkbox"
                            checked={enableAdjustment}
                            onChange={(e): void => onEnableAdjustmentChange(e.target.checked)}
                            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                        />
                        Adjustment
                    </label>
                    {enableAdjustment && (
                        <div className="pl-6 space-y-2">
                            <input
                                type="number"
                                value={adjustmentAmount}
                                onChange={(e): void => onAdjustmentAmountChange(Number(e.target.value))}
                                step="0.01"
                                placeholder="0.00"
                                className={inputClass}
                            />
                            <input
                                type="text"
                                value={adjustmentReason}
                                onChange={(e): void => onAdjustmentReasonChange(e.target.value)}
                                placeholder="Reason (optional)"
                                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue placeholder:text-gray-400"
                            />
                        </div>
                    )}
                </div>

                {/* Grand total */}
                <div className={`${rowClass} border-t border-gray-200 pt-3 mt-1`}>
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-brand-blue tabular-nums">
                        {formatCurrency(grandTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
