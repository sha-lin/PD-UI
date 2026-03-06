"use client";

import { type ReactElement, type ElementType } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import ClientLayout from "@/components/client/client-layout";
import {
    Package,
    FileText,
    Bell,
    TrendingUp,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertTriangle,
    X,
    ChevronRight,
} from "lucide-react";
import { fetchClientPortalProfile } from "@/services/client-portal";
import { fetchClientOrders } from "@/services/client-orders";
import { fetchClientInvoices } from "@/services/client-orders";
import { fetchUnreadNotifications, markNotificationRead } from "@/services/client-notifications";
import type { ClientOrder, OrderStatus, ClientInvoice, ClientPortalNotification } from "@/types/client-orders";

// ─── Status helpers ───────────────────────────────────────────────────────────

const ACTIVE_STATUSES: OrderStatus[] = [
    "submitted",
    "acknowledged",
    "in_production",
    "ready",
    "shipped",
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

const NOTIFICATION_ICONS: Partial<Record<string, ElementType>> = {
    order_confirmed: CheckCircle2,
    order_status_update: Package,
    invoice_issued: FileText,
    payment_received: TrendingUp,
    delivery_scheduled: Clock,
    reminder: AlertTriangle,
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatCurrency(value: string | number): string {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
    }).format(num);
}

function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function timeAgo(value: string): string {
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonBox({ className }: { className?: string }): ReactElement {
    return <div className={`animate-pulse rounded bg-gray-200 ${className ?? ""}`} />;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string | number;
    subLabel?: string;
    icon: ElementType;
    colorClass: string;
    href?: string;
    loading: boolean;
}

function StatCard({
    label,
    value,
    subLabel,
    icon: Icon,
    colorClass,
    href,
    loading,
}: StatCardProps): ReactElement {
    const inner = (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {href && (
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-blue transition-colors" />
                )}
            </div>
            {loading ? (
                <div className="space-y-2">
                    <SkeletonBox className="h-7 w-16" />
                    <SkeletonBox className="h-3 w-24" />
                </div>
            ) : (
                <>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
                    {subLabel && <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>}
                </>
            )}
        </div>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PortalDashboardPage(): ReactElement {
    const queryClient = useQueryClient();

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ["portal-profile"],
        queryFn: fetchClientPortalProfile,
        staleTime: 60_000,
        retry: 1,
    });

    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ["client-orders", 1, "all", ""],
        queryFn: () => fetchClientOrders({ page: 1 }),
        staleTime: 30_000,
        retry: 1,
    });

    const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
        queryKey: ["client-invoices-dashboard"],
        queryFn: () => fetchClientInvoices(),
        staleTime: 30_000,
        retry: 1,
    });

    const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
        queryKey: ["client-notifications-unread"],
        queryFn: fetchUnreadNotifications,
        staleTime: 15_000,
        retry: 1,
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["client-notifications-unread"] });
        },
    });

    // Derived stats
    const recentOrders: ClientOrder[] = (ordersData?.results ?? []).slice(0, 5);
    const totalOrders: number = ordersData?.count ?? 0;
    const activeOrders = (ordersData?.results ?? []).filter((o) =>
        ACTIVE_STATUSES.includes(o.status)
    ).length;

    const allInvoices: ClientInvoice[] = invoicesData?.results ?? [];
    const outstandingInvoices = allInvoices.filter(
        (inv) => inv.status === "issued" || inv.status === "overdue"
    );
    const outstandingBalance = outstandingInvoices.reduce(
        (sum, inv) => sum + parseFloat(inv.balance_due),
        0
    );
    const overdueCount = allInvoices.filter((inv) => inv.status === "overdue").length;

    const notifications: ClientPortalNotification[] = notificationsData?.results ?? [];
    const unreadCount: number = notificationsData?.count ?? 0;

    const welcomeName = profileLoading
        ? ""
        : profile?.first_name
            ? profile.first_name
            : profile?.email?.split("@")[0] ?? "there";

    return (
        <ClientLayout>
            <div className="p-8 space-y-8">
                {/* Welcome banner */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 flex items-center justify-between">
                    <div>
                        {profileLoading ? (
                            <div className="space-y-2">
                                <SkeletonBox className="h-8 w-56" />
                                <SkeletonBox className="h-4 w-40" />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-brand-black">
                                    Welcome back, {welcomeName}!
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {profile?.company ?? ""}
                                </p>
                            </>
                        )}
                    </div>
                    <div className="hidden sm:block text-right text-xs text-gray-400">
                        {new Date().toLocaleDateString("en-KE", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Orders"
                        value={totalOrders}
                        subLabel="All orders placed"
                        icon={Package}
                        colorClass="bg-blue-50 text-blue-600"
                        href="/portal/orders"
                        loading={ordersLoading}
                    />
                    <StatCard
                        label="Active Orders"
                        value={activeOrders}
                        subLabel="In progress right now"
                        icon={Clock}
                        colorClass="bg-yellow-50 text-yellow-600"
                        href="/portal/orders"
                        loading={ordersLoading}
                    />
                    <StatCard
                        label="Outstanding Balance"
                        value={invoicesLoading ? "—" : formatCurrency(outstandingBalance)}
                        subLabel={
                            overdueCount > 0
                                ? `${overdueCount} overdue`
                                : `${outstandingInvoices.length} unpaid`
                        }
                        icon={FileText}
                        colorClass={
                            overdueCount > 0
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-600"
                        }
                        loading={invoicesLoading}
                    />
                    <StatCard
                        label="Notifications"
                        value={unreadCount}
                        subLabel="Unread messages"
                        icon={Bell}
                        colorClass="bg-purple-50 text-purple-600"
                        loading={notificationsLoading}
                    />
                </div>

                {/* Main content: 2-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Orders — 2/3 width */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
                            </div>
                            <Link
                                href="/portal/orders"
                                className="text-xs font-medium text-brand-blue hover:underline inline-flex items-center gap-1"
                            >
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {ordersLoading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                                        <SkeletonBox className="h-4 w-28" />
                                        <SkeletonBox className="h-5 w-20 rounded-full" />
                                        <SkeletonBox className="h-4 w-16 ml-auto" />
                                    </div>
                                ))}
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Package className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No orders yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/portal/orders/${order.id}`}
                                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <span className="font-mono text-sm font-medium text-brand-blue">
                                                {order.order_number}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                                {" · "}
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}
                                        >
                                            {STATUS_LABELS[order.status]}
                                        </span>
                                        <span className="shrink-0 text-sm font-semibold text-gray-900">
                                            {formatCurrency(order.total_amount)}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-blue shrink-0 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notifications — 1/3 width */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Notifications</h2>
                                {unreadCount > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-brand-blue text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>

                        {notificationsLoading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex gap-3">
                                        <SkeletonBox className="w-8 h-8 rounded-lg shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <SkeletonBox className="h-3 w-full" />
                                            <SkeletonBox className="h-3 w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Bell className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">All caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                                {notifications.slice(0, 8).map((notif) => {
                                    const Icon =
                                        NOTIFICATION_ICONS[notif.notification_type] ?? Bell;
                                    return (
                                        <div
                                            key={notif.id}
                                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon className="w-4 h-4 text-brand-blue" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 leading-snug">
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-gray-300 mt-1">
                                                    {timeAgo(notif.created_at)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => markReadMutation.mutate(notif.id)}
                                                disabled={markReadMutation.isPending}
                                                className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                                                aria-label="Mark as read"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Outstanding invoices — only shown when there are unpaid invoices */}
                {!invoicesLoading && outstandingInvoices.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Outstanding Invoices</h2>
                                {overdueCount > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                        {overdueCount} overdue
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {formatCurrency(outstandingBalance)}{" "}
                                <span className="text-xs font-normal text-gray-400">total due</span>
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                        <th className="px-4 py-2.5 font-semibold text-gray-600">Invoice #</th>
                                        <th className="px-4 py-2.5 font-semibold text-gray-600">Order</th>
                                        <th className="px-4 py-2.5 font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">Total</th>
                                        <th className="px-4 py-2.5 font-semibold text-gray-600 text-right">Balance Due</th>
                                        <th className="px-4 py-2.5 font-semibold text-gray-600">Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outstandingInvoices.map((inv: ClientInvoice) => (
                                        <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs text-brand-blue font-medium">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {inv.order_number ?? "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === "overdue"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-blue-100 text-blue-700"
                                                        }`}
                                                >
                                                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                                {formatCurrency(inv.total_amount)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-red-600">
                                                {formatCurrency(inv.balance_due)}
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
        </ClientLayout>
    );
}
