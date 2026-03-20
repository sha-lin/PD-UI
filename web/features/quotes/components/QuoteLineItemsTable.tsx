"use client";

import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Search, Plus, Trash2, FileText } from "lucide-react";
import type { Product } from "@/types/products";
import type { LineItem } from "@/features/quotes/types";

interface QuoteLineItemsTableProps {
    lineItems: LineItem[];
    products: Product[];
    onAddProduct: (product: Product) => void;
    onRemoveItem: (tempId: string) => void;
    onUpdateItem: (tempId: string, field: keyof LineItem, value: string | number) => void;
}

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 2,
    }).format(value);

const calculateLineTotal = (item: LineItem): number => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const variableAmount = Number(item.variable_amount) || 0;
    const discountAmount = Number(item.discount_amount) || 0;
    const subtotal = quantity * (unitPrice + variableAmount);
    const discount =
        item.discount_type === "percent"
            ? subtotal * (discountAmount / 100)
            : discountAmount;
    return subtotal - discount;
};

const inputClass =
    "px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-right";

export default function QuoteLineItemsTable({
    lineItems,
    products,
    onAddProduct,
    onRemoveItem,
    onUpdateItem,
}: QuoteLineItemsTableProps): ReactElement {
    const [productSearch, setProductSearch] = useState("");
    const [showResults, setShowResults] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredProducts = productSearch
        ? products.filter(
            (p: Product) =>
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                p.internal_code?.toLowerCase().includes(productSearch.toLowerCase())
        )
        : products;

    const handleAddLine = (): void => {
        setProductSearch("");
        setShowResults(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
    };

    const handleSelectProduct = (product: Product): void => {
        onAddProduct(product);
        setProductSearch("");
        setShowResults(false);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">
                                #
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Item
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">
                                Qty
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">
                                Rate (KES)
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                                Discount
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">
                                Amount
                            </th>
                            <th className="w-10" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {lineItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center">
                                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm text-gray-400">
                                        No items yet — search below to add products
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            lineItems.map((item, index) => (
                                <tr key={item.tempId} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 text-xs text-gray-400">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.product_name}
                                        </p>
                                        {item.product_sku && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {item.product_sku}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e): void =>
                                                onUpdateItem(item.tempId, "quantity", Number(e.target.value))
                                            }
                                            min="1"
                                            className={`${inputClass} w-20`}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e): void =>
                                                    onUpdateItem(item.tempId, "unit_price", Number(e.target.value))
                                                }
                                                min="0"
                                                step="0.01"
                                                className={`${inputClass} w-28 ${item.unit_price === 0 ? "border-amber-300 bg-amber-50 focus:ring-amber-400" : ""}`}
                                            />
                                            {item.unit_price === 0 && (
                                                <span className="text-[10px] font-medium text-amber-600 leading-none">
                                                    Set price
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 justify-end">
                                            <input
                                                type="number"
                                                value={item.discount_amount}
                                                onChange={(e): void =>
                                                    onUpdateItem(
                                                        item.tempId,
                                                        "discount_amount",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                min="0"
                                                step="0.01"
                                                className={`${inputClass} w-16`}
                                            />
                                            <select
                                                value={item.discount_type}
                                                onChange={(e): void =>
                                                    onUpdateItem(item.tempId, "discount_type", e.target.value)
                                                }
                                                className="px-1.5 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                                            >
                                                <option value="percent">%</option>
                                                <option value="fixed">KES</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 tabular-nums">
                                        {formatCurrency(calculateLineTotal(item))}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={(): void => onRemoveItem(item.tempId)}
                                            className="p-1 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Product search row */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={productSearch}
                            onChange={(e): void => {
                                setProductSearch(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={(): void => setShowResults(true)}
                            onBlur={(): void => { setTimeout(() => setShowResults(false), 200); }}
                            placeholder="Search products by name or SKU…"
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent placeholder:text-gray-400"
                        />
                        {showResults && filteredProducts.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto">
                                {filteredProducts.map((product: Product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={(): void => handleSelectProduct(product)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                        <p className="text-sm font-medium text-gray-900">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {product.internal_code} ·{" "}
                                            {product.pricing_mode === "quote_only"
                                                ? "Quote Only"
                                                : "Auto Price"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddLine}
                        className="flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:text-brand-blue/80 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add line
                    </button>
                </div>
            </div>
        </div>
    );
}
