"use client";

import { useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import ClientLayout from "@/components/client/client-layout";
import { Search, Filter, Eye, Package, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { fetchClientOrders } from "@/services/client-orders";
import type { ClientOrder, OrderStatus } from "@/types/client-orders";

const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "acknowledged", label: "Acknowledged" },
    { value: "in_production", label: "In Production" },
    { value: "ready", label: "Ready for Shipment" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
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
    ready: "Ready",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
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

function OrderRowSkeleton(): ReactElement {
    return (
        <tr className="border-b border-gray-100">
            {[120, 80, 60, 80, 70, 80, 40].map((w, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: w }} />
                </td>
            ))}
        </tr>
    );
}

function EmptyState(): ReactElement {
    return (
        <tr>
            <td colSpan={7}>
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Package className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No orders found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                </div>
            </td>
        </tr>
    );
}

export default function OrdersPage(): ReactElement {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["client-orders", page, statusFilter, debouncedSearch],
        queryFn: () =>
            fetchClientOrders({
                page,
                status: statusFilter,
                search: debouncedSearch,
            }),
        staleTime: 30_000,
        retry: 1,
    });

    const orders: ClientOrder[] = data?.results ?? [];
    const totalCount = data?.count ?? 0;
    const pageSize = 20;
    const totalPages = Math.ceil(totalCount / pageSize);

    function handleSearchSubmit(e: React.FormEvent): void {
        e.preventDefault();
        setDebouncedSearch(search);
        setPage(1);
    }

    function handleStatusChange(value: string): void {
        setStatusFilter(value);
        setPage(1);
    }

    return (
        <ClientLayout>
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-brand-black">Orders</h1>
                    <p className="text-gray-500 mt-1">
                        Track and manage all your print orders
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by order number…"
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        />
                    </form>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white appearance-none"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {isError && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        Could not load orders. Please try again.
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                    <th className="px-4 py-3 font-semibold text-gray-700">Order #</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Items</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Total</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Placed</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Est. Delivery</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(8)].map((_, i) => <OrderRowSkeleton key={i} />)
                                ) : orders.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-mono font-medium text-brand-blue">
                                                {order.order_number}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                                                    {STATUS_LABELS[order.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {formatDate(order.delivery_date)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/portal/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1.5 text-brand-blue hover:underline font-medium text-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                            <span>
                                {totalCount} order{totalCount !== 1 ? "s" : ""} total
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span>Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
