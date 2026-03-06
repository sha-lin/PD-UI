"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactElement } from "react";
import ClientLayout from "@/components/client/client-layout";
import { Package, FileText, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ClientDashboardPage(): ReactElement {
    // Mock data - replace with actual API calls
    const stats = {
        active_orders: 3,
        pending_quotes: 2,
        completed_orders: 15,
        total_spent: 450000,
    };

    const recentOrders = [
        {
            id: 1,
            order_number: "ORD-2024-001",
            product: "Business Cards",
            quantity: 1000,
            status: "in_production",
            created_at: "2024-03-01",
        },
        {
            id: 2,
            order_number: "ORD-2024-002",
            product: "Brochures",
            quantity: 500,
            status: "completed",
            created_at: "2024-02-28",
        },
        {
            id: 3,
            order_number: "ORD-2024-003",
            product: "Flyers",
            quantity: 2000,
            status: "pending",
            created_at: "2024-02-25",
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
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    return (
        <ClientLayout>
            <div className="p-8 space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h1 className="text-3xl font-bold text-brand-black mb-2">Welcome back, Demo Client!</h1>
                    <p className="text-gray-600">Here's what's happening with your orders today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        label="Active Orders"
                        value={stats.active_orders}
                        icon={Package}
                        color="blue"
                        href="/portal/orders?status=active"
                    />
                    <StatsCard
                        label="Pending Quotes"
                        value={stats.pending_quotes}
                        icon={Clock}
                        color="yellow"
                        href="/portal/orders?status=pending"
                    />
                    <StatsCard
                        label="Completed Orders"
                        value={stats.completed_orders}
                        icon={CheckCircle2}
                        color="green"
                        href="/portal/orders?status=completed"
                    />
                    <StatsCard
                        label="Total Spent"
                        value={formatCurrency(stats.total_spent)}
                        icon={TrendingUp}
                        color="purple"
                    />
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                        <Link
                            href="/portal/orders"
                            className="text-sm font-medium text-brand-blue hover:opacity-80"
                        >
                            View All
                        </Link>
                    </div>

                    <div className="p-6">
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating your first order.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <p className="text-sm text-gray-600">{order.product}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Quantity: {order.quantity} • Created: {order.created_at}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/portal/orders/${order.id}`}
                                            className="px-4 py-2 text-sm font-medium text-brand-blue border border-brand-blue rounded-md hover:bg-brand-blue hover:text-white transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickActionCard
                        title="Request Quote"
                        description="Get a quote for your printing needs"
                        icon={FileText}
                        href="/portal/orders/new"
                        color="blue"
                    />
                    <QuickActionCard
                        title="Track Orders"
                        description="Check status of your orders"
                        icon={Package}
                        href="/portal/orders"
                        color="green"
                    />
                    <QuickActionCard
                        title="Contact Support"
                        description="Get help from our team"
                        icon={AlertCircle}
                        href="/portal/settings"
                        color="purple"
                    />
                </div>
            </div>
        </ClientLayout>
    );
}

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: "blue" | "yellow" | "green" | "purple";
    href?: string;
}

function StatsCard({ label, value, icon: Icon, color, href }: StatsCardProps): ReactElement {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        yellow: "bg-yellow-50 text-yellow-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
    };

    const card = (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );

    return href ? <Link href={href}>{card}</Link> : card;
}

interface QuickActionCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: "blue" | "green" | "purple";
}

function QuickActionCard({ title, description, icon: Icon, href, color }: QuickActionCardProps): ReactElement {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
        green: "bg-green-50 text-green-600 hover:bg-green-100",
        purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    };

    return (
        <Link href={href}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </Link>
    );
}
