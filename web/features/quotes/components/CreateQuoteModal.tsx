import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { PaymentTerms, CreateQuoteInput, CreateQuoteLineItemInput } from "@/types/quotes";
import type { Client } from "@/types/clients";
import type { Lead } from "@/types/leads";
import type { Product } from "@/types/products";
import { fetchClients } from "@/services/clients";
import { fetchProducts } from "@/services/products";

interface CreateQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateQuoteInput) => void;
    isSubmitting: boolean;
}

interface LineItem {
    tempId: string;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    discount_type: "percent" | "fixed";
}

export default function CreateQuoteModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}: CreateQuoteModalProps) {
    const [clientType, setClientType] = useState<"client" | "lead">("client");
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>("Prepaid");
    const [includeVat, setIncludeVat] = useState(true);
    const [taxRate, setTaxRate] = useState(16);
    const [shippingCharges, setShippingCharges] = useState(0);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);
    const [adjustmentReason, setAdjustmentReason] = useState("");
    const [notes, setNotes] = useState("");
    const [customTerms, setCustomTerms] = useState("");
    const [lineItems, setLineItems] = useState<LineItem[]>([]);

    const { data: clientsData } = useQuery({
        queryKey: ["clients", 1, 50, ""],
        queryFn: () =>
            fetchClients({
                page: 1,
                pageSize: 50,
                search: "",
                status: "all",
                clientType: "all",
            }),
        enabled: isOpen,
    });

    const { data: productsData } = useQuery({
        queryKey: ["products", 1, 100, ""],
        queryFn: () =>
            fetchProducts({
                page: 1,
                pageSize: 100,
                search: "",
                status: "all",
                customizationLevel: "all",
                category: "all",
                subCategory: "all",
                visibility: "all",
            }),
        enabled: isOpen,
    });

    const clients = clientsData?.results || [];
    const products = productsData?.results || [];

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            {
                tempId: Date.now().toString(),
                product_id: 0,
                product_name: "",
                quantity: 1,
                unit_price: 0,
                discount_amount: 0,
                discount_type: "percent",
            },
        ]);
    };

    const removeLineItem = (tempId: string) => {
        setLineItems(lineItems.filter((item) => item.tempId !== tempId));
    };

    const updateLineItem = (tempId: string, field: keyof LineItem, value: string | number) => {
        setLineItems(
            lineItems.map((item) => {
                if (item.tempId === tempId) {
                    if (field === "product_id") {
                        const product = products.find((p) => p.id === Number(value));
                        return {
                            ...item,
                            product_id: Number(value),
                            product_name: product?.name || "",
                            unit_price: product?.base_price || 0,
                        };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    const calculateSubtotal = () => {
        return lineItems.reduce((sum, item) => {
            const lineTotal = item.quantity * item.unit_price;
            const discount =
                item.discount_type === "percent"
                    ? lineTotal * (item.discount_amount / 100)
                    : item.discount_amount;
            return sum + (lineTotal - discount);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = includeVat ? subtotal * (taxRate / 100) : 0;
        return subtotal + tax + shippingCharges + adjustmentAmount;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedClientId && !selectedLeadId) {
            alert("Please select a client or lead");
            return;
        }

        if (lineItems.length === 0) {
            alert("Please add at least one product");
            return;
        }

        const invalidItems = lineItems.filter((item) => !item.product_id || item.quantity <= 0);
        if (invalidItems.length > 0) {
            alert("Please complete all line items with valid products and quantities");
            return;
        }

        const quoteData: CreateQuoteInput = {
            client_id: clientType === "client" ? selectedClientId || undefined : undefined,
            lead_id: clientType === "lead" ? selectedLeadId || undefined : undefined,
            payment_terms: paymentTerms,
            include_vat: includeVat,
            tax_rate: taxRate,
            shipping_charges: shippingCharges || undefined,
            adjustment_amount: adjustmentAmount || undefined,
            adjustment_reason: adjustmentReason || undefined,
            notes: notes || undefined,
            custom_terms: customTerms || undefined,
            line_items: lineItems.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount_amount: item.discount_amount || undefined,
                discount_type: item.discount_type,
            })),
        };

        onSubmit(quoteData);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900">New Multi-Product Quote</h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quote For
                            </label>
                            <div className="flex gap-4 mb-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="client"
                                        checked={clientType === "client"}
                                        onChange={(e) => setClientType(e.target.value as "client" | "lead")}
                                        className="text-brand-blue focus:ring-brand-blue"
                                    />
                                    <span className="text-sm text-gray-700">Existing Client</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="lead"
                                        checked={clientType === "lead"}
                                        onChange={(e) => setClientType(e.target.value as "client" | "lead")}
                                        className="text-brand-blue focus:ring-brand-blue"
                                    />
                                    <span className="text-sm text-gray-700">Lead</span>
                                </label>
                            </div>

                            {clientType === "client" ? (
                                <select
                                    value={selectedClientId || ""}
                                    onChange={(e) => setSelectedClientId(Number(e.target.value) || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    required
                                >
                                    <option value="">Select a client</option>
                                    {clients.map((client: Client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.company || client.name} ({client.client_id})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Lead name or ID"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Terms
                            </label>
                            <select
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                required
                            >
                                <option value="Prepaid">Prepaid</option>
                                <option value="Net 7">Net 7 Days</option>
                                <option value="Net 15">Net 15 Days</option>
                                <option value="Net 30">Net 30 Days</option>
                                <option value="Net 60">Net 60 Days</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                            <button
                                type="button"
                                onClick={addLineItem}
                                className="px-3 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </button>
                        </div>

                        {lineItems.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <p className="text-gray-600">No products added yet. Click "Add Product" to start.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lineItems.map((item) => (
                                    <div
                                        key={item.tempId}
                                        className="bg-gray-50 rounded-lg p-4 grid grid-cols-12 gap-3 items-start"
                                    >
                                        <div className="col-span-4">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Product
                                            </label>
                                            <select
                                                value={item.product_id || ""}
                                                onChange={(e) =>
                                                    updateLineItem(item.tempId, "product_id", e.target.value)
                                                }
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                required
                                            >
                                                <option value="">Select product</option>
                                                {products.map((product: Product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateLineItem(item.tempId, "quantity", Number(e.target.value))
                                                }
                                                min="1"
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                required
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Unit Price
                                            </label>
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) =>
                                                    updateLineItem(item.tempId, "unit_price", Number(e.target.value))
                                                }
                                                min="0"
                                                step="0.01"
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                required
                                            />
                                        </div>

                                        <div className="col-span-3">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Discount
                                            </label>
                                            <div className="flex gap-1">
                                                <input
                                                    type="number"
                                                    value={item.discount_amount}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.tempId,
                                                            "discount_amount",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                />
                                                <select
                                                    value={item.discount_type}
                                                    onChange={(e) =>
                                                        updateLineItem(item.tempId, "discount_type", e.target.value)
                                                    }
                                                    className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                >
                                                    <option value="percent">%</option>
                                                    <option value="fixed">KES</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="col-span-1 flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => removeLineItem(item.tempId)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    checked={includeVat}
                                    onChange={(e) => setIncludeVat(e.target.checked)}
                                    className="text-brand-blue focus:ring-brand-blue"
                                />
                                <span className="text-sm font-medium text-gray-700">Include VAT</span>
                            </label>
                            {includeVat && (
                                <input
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    placeholder="Tax rate %"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shipping Charges (KES)
                            </label>
                            <input
                                type="number"
                                value={shippingCharges}
                                onChange={(e) => setShippingCharges(Number(e.target.value))}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adjustment (KES)
                            </label>
                            <input
                                type="number"
                                value={adjustmentAmount}
                                onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {adjustmentAmount !== 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adjustment Reason
                            </label>
                            <input
                                type="text"
                                value={adjustmentReason}
                                onChange={(e) => setAdjustmentReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                placeholder="Reason for adjustment"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="Internal notes for this quote"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Terms & Conditions
                        </label>
                        <textarea
                            value={customTerms}
                            onChange={(e) => setCustomTerms(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="Custom terms for this quote (optional)"
                        />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Estimated Total:</span>
                            <span className="text-2xl font-bold text-brand-blue">
                                KES {calculateTotal().toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Subtotal: KES {calculateSubtotal().toFixed(2)}
                            {includeVat && ` | Tax: KES ${(calculateSubtotal() * (taxRate / 100)).toFixed(2)}`}
                            {shippingCharges > 0 && ` | Shipping: KES ${shippingCharges.toFixed(2)}`}
                            {adjustmentAmount !== 0 && ` | Adjustment: KES ${adjustmentAmount.toFixed(2)}`}
                        </p>
                    </div>
                </form>

                <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || lineItems.length === 0}
                        className="px-6 py-2 text-sm bg-brand-blue text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Creating..." : "Create Quote"}
                    </button>
                </div>
            </div>
        </div>
    );
}
