"use client";

import { useState, type ReactElement } from "react";
import ClientLayout from "@/components/client/client-layout";
import { Package, Search, Filter, Calendar } from "lucide-react";

type OrderStatus = "all" | "pending" | "in_production" | "completed" | "cancelled";

export default function OrdersPage(): ReactElement {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");

    // Mock data - replace with actual API calls
    const orders = [
        {
            id: 1,
            order_number: "ORD-2024-001",
            product: "Business Cards",
            quantity: 1000,
            status: "in_production",
            total_amount: 15000,
            created_at: "2024-03-01",
            delivery_date: "2024-03-10",
        },
        {
            id: 2,
            order_number: "ORD-2024-002",
            product: "Brochures",
            quantity: 500,
            status: "completed",
            total_amount: 25000,
            created_at: "2024-02-28",
            delivery_date: "2024-03-05",
        },
        {
            id: 3,
            order_number: "ORD-2024-003",
            product: "Flyers",
            quantity: 2000,
            status: "pending",
            total_amount: 18000,
            created_at: "2024-02-25",
            delivery_date: "2024-03-15",
        },
        {
            id: 4,
            order_number: "ORD-2024-004",
            product: "Posters",
            quantity: 100,
            status: "in_production",
            total_amount: 12000,
            created_at: "2024-02-20",
            delivery_date: "2024-03-08",
        },
        {
            id: 5,
            order_number: "ORD-2024-005",
            product: "Banners",
            quantity: 10,
            status: "completed",
            total_amount: 35000,
            created_at: "2024-02-15",
            delivery_date: "2024-02-28",
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            in_production: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        const labels = {
            pending: "Pending",
            in_production: "In Production",
            completed: "Completed",
            cancelled: "Cancelled",
        };
        return (
            <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}
            >
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <ClientLayout>
            <div className="p-8 space-y-6">
                {/* Header */}
                <div>
                    <div>
                        <h1 className="text-3xl font-bold text-brand-black">Orders</h1>
                        <p className="text-gray-600 mt-1">View and manage your print orders</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_production">In Production</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Get started by creating your first order"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Delivery Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {order.order_number}
                                                </div>
                                                <div className="text-xs text-gray-500">{order.created_at}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.product}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.quantity}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(order.total_amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    {order.delivery_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-brand-blue hover:opacity-80">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
