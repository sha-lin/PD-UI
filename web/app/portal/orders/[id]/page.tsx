"use client";

import { useState, type ReactElement } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import ClientLayout from "@/components/client/client-layout";
import {
    ArrowLeft,
    Package,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    Truck,
    Loader2,
    ShoppingBag,
    BadgeDollarSign,
    X,
} from "lucide-react";
import {
    fetchClientOrder,
    fetchInvoicesForOrder,
    submitClientOrder,
    cancelClientOrder,
} from "@/services/client-orders";
import type { ClientOrder, ClientInvoice, OrderStatus, InvoiceStatus } from "@/types/client-orders";

const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
    { status: "draft", label: "Draft" },
    { status: "submitted", label: "Submitted" },
    { status: "acknowledged", label: "Acknowledged" },
    { status: "in_production", label: "In Production" },
    { status: "ready", label: "Ready" },
    { status: "shipped", label: "Shipped" },
    { status: "delivered", label: "Delivered" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-700",
    acknowledged: "bg-indigo-100 text-indigo-700",
    in_production: "bg-yellow-100 text-yellow-700",
    ready: "bg-purple-100 text-purple-700",
    shipped: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
    draft: "Draft",
    submitted: "Submitted",
    acknowledged: "Acknowledged",
    in_production: "In Production",
    ready: "Ready for Shipment",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
    draft: "bg-gray-100 text-gray-700",
    issued: "bg-blue-100 text-blue-700",
    overdue: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
};

function formatCurrency(value: string): string {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
    }).format(parseFloat(value));
}

function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function OrderDetailSkeleton(): ReactElement {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-12 w-72 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 + i * 5}%` }} />
                        ))}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${60 + i * 8}%` }} />
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressStepper({ currentStatus }: { currentStatus: OrderStatus }): ReactElement {
    const cancelledIndex = -1;
    const currentIndex =
        currentStatus === "cancelled"
            ? cancelledIndex
            : ORDER_STEPS.findIndex((s) => s.status === currentStatus);

    if (currentStatus === "cancelled") {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <X className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm font-medium text-red-700">This order has been cancelled.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-max gap-0">
                {ORDER_STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.status} className="flex items-center">
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${isCompleted
                                        ? "bg-brand-blue border-brand-blue text-white"
                                        : isCurrent
                                            ? "bg-white border-brand-blue text-brand-blue"
                                            : "bg-white border-gray-300 text-gray-400"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-medium whitespace-nowrap ${isCurrent
                                        ? "text-brand-blue"
                                        : isCompleted
                                            ? "text-gray-700"
                                            : "text-gray-400"
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < ORDER_STEPS.length - 1 && (
                                <div
                                    className={`w-12 h-0.5 mx-1 transition-colors ${index < currentIndex ? "bg-brand-blue" : "bg-gray-200"
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SpecificationsBadge({ specs }: { specs: Record<string, unknown> | null }): ReactElement | null {
    if (!specs || Object.keys(specs).length === 0) return null;
    const entries = Object.entries(specs).slice(0, 3);
    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {entries.map(([key, val]) => (
                <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    {key}: {String(val)}
                </span>
            ))}
            {Object.keys(specs).length > 3 && (
                <span className="text-xs text-gray-400">+{Object.keys(specs).length - 3} more</span>
            )}
        </div>
    );
}

export default function OrderDetailPage(): ReactElement {
    const params = useParams();
    const queryClient = useQueryClient();
    const orderId = Number(params.id);

    const [actionError, setActionError] = useState<string | null>(null);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const { data: order, isLoading, isError } = useQuery<ClientOrder>({
        queryKey: ["client-order", orderId],
        queryFn: () => fetchClientOrder(orderId),
        staleTime: 30_000,
        retry: 1,
        enabled: !isNaN(orderId),
    });

    const { data: invoices = [] } = useQuery<ClientInvoice[]>({
        queryKey: ["order-invoices", orderId],
        queryFn: () => fetchInvoicesForOrder(orderId),
        staleTime: 30_000,
        retry: 1,
        enabled: !isNaN(orderId) && !!order,
    });

    const submitMutation = useMutation({
        mutationFn: () => submitClientOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["client-order", orderId] });
            queryClient.invalidateQueries({ queryKey: ["client-orders"] });
            setActionError(null);
        },
        onError: () => {
            setActionError("Could not submit order. Please try again.");
        },
    });

    const cancelMutation = useMutation({
        mutationFn: () => cancelClientOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["client-order", orderId] });
            queryClient.invalidateQueries({ queryKey: ["client-orders"] });
            setConfirmCancel(false);
            setActionError(null);
        },
        onError: () => {
            setActionError("Could not cancel order. Please try again.");
            setConfirmCancel(false);
        },
    });

    if (isLoading) {
        return (
            <ClientLayout>
                <div className="p-8">
                    <OrderDetailSkeleton />
                </div>
            </ClientLayout>
        );
    }

    if (isError || !order) {
        return (
            <ClientLayout>
                <div className="p-8">
                    <Link href="/portal/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-blue mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        Could not load this order. It may not exist or you may not have access.
                    </div>
                </div>
            </ClientLayout>
        );
    }

    const canSubmit = order.status === "draft";
    const canCancel = order.status === "draft" || order.status === "submitted";

    return (
        <ClientLayout>
            <div className="p-8 space-y-6">
                {/* Back */}
                <Link
                    href="/portal/orders"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-blue transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </Link>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-brand-black font-mono">
                                {order.order_number}
                            </h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                                {STATUS_LABELS[order.status]}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Placed {formatDateTime(order.created_at)}
                            {order.submitted_at && ` · Submitted ${formatDateTime(order.submitted_at)}`}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                        {canSubmit && (
                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={submitMutation.isPending}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-md hover:bg-brand-blue/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                Submit Order
                            </button>
                        )}
                        {canCancel && !confirmCancel && (
                            <button
                                onClick={() => setConfirmCancel(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors"
                            >
                                Cancel Order
                            </button>
                        )}
                        {confirmCancel && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Are you sure?</span>
                                <button
                                    onClick={() => cancelMutation.mutate()}
                                    disabled={cancelMutation.isPending}
                                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-60 transition-colors"
                                >
                                    {cancelMutation.isPending ? "Cancelling…" : "Yes, Cancel"}
                                </button>
                                <button
                                    onClick={() => setConfirmCancel(false)}
                                    className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Keep
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action error */}
                {actionError && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {actionError}
                    </div>
                )}

                {/* Progress Stepper */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Order Progress
                    </h2>
                    <ProgressStepper currentStatus={order.status} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: items + specs */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Order Items</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                            <th className="px-4 py-2.5 font-semibold text-gray-600">Product</th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600">SKU</th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">Qty</th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">Unit Price</th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                                    <SpecificationsBadge specs={item.specifications} />
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                                    {item.product_sku ?? "—"}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-700">
                                                    {item.quantity.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-700">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                    {formatCurrency(item.line_total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invoices */}
                        {invoices.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <h2 className="text-sm font-semibold text-gray-700">Invoices</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                                <th className="px-4 py-2.5 font-semibold text-gray-600">Invoice #</th>
                                                <th className="px-4 py-2.5 font-semibold text-gray-600">Status</th>
                                                <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">Total</th>
                                                <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">Balance Due</th>
                                                <th className="px-4 py-2.5 font-semibold text-gray-600">Due Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((inv: ClientInvoice) => (
                                                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-mono text-xs text-brand-blue font-medium">
                                                        {inv.invoice_number}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_STYLES[inv.status]}`}>
                                                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                        {formatCurrency(inv.total_amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={parseFloat(inv.balance_due) > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                                                            {formatCurrency(inv.balance_due)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {formatDate(inv.due_date)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column: summary cards */}
                    <div className="space-y-4">
                        {/* Financial Summary */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <BadgeDollarSign className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Financial Summary</h2>
                            </div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <dt>Subtotal</dt>
                                    <dd>{formatCurrency(order.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <dt>Tax</dt>
                                    <dd>{formatCurrency(order.tax_amount)}</dd>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <dt>Shipping</dt>
                                    <dd>{formatCurrency(order.shipping_cost)}</dd>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                                    <dt>Total</dt>
                                    <dd className="text-brand-blue">{formatCurrency(order.total_amount)}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Shipping Info */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Truck className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Shipping Details</h2>
                            </div>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-xs text-gray-400 mb-0.5">Delivery Address</dt>
                                    <dd className="text-gray-700 whitespace-pre-line">{order.shipping_address || "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-400 mb-0.5">Est. Delivery Date</dt>
                                    <dd className="text-gray-700">{formatDate(order.delivery_date)}</dd>
                                </div>
                                {order.special_instructions && (
                                    <div>
                                        <dt className="text-xs text-gray-400 mb-0.5">Special Instructions</dt>
                                        <dd className="text-gray-700 text-xs">{order.special_instructions}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Order Meta */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Order Info</h2>
                            </div>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-xs text-gray-400 mb-0.5">Order Number</dt>
                                    <dd className="font-mono font-medium text-gray-900">{order.order_number}</dd>
                                </div>
                                {order.quote_number && (
                                    <div>
                                        <dt className="text-xs text-gray-400 mb-0.5">Quote Ref</dt>
                                        <dd className="font-mono text-gray-700">{order.quote_number}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-xs text-gray-400 mb-0.5">Client</dt>
                                    <dd className="text-gray-700">{order.client_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-400 mb-0.5">Created</dt>
                                    <dd className="text-gray-700">{formatDateTime(order.created_at)}</dd>
                                </div>
                                {order.submitted_at && (
                                    <div>
                                        <dt className="text-xs text-gray-400 mb-0.5">Submitted</dt>
                                        <dd className="text-gray-700">{formatDateTime(order.submitted_at)}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
