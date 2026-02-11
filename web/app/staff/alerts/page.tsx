"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchAlerts, dismissAlert } from "@/lib/api/alerts";
import { AlertFilters, AlertType, AlertSeverity } from "@/types/alerts";
import {
    Search,
    AlertCircle,
    Bell,
    ChevronLeft,
    ChevronRight,
    Package,
    AlertTriangle,
    DollarSign,
    XCircle,
    UserPlus,
    Clock,
    Info,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";

function getAlertTypeIcon(type: AlertType) {
    const icons = {
        low_stock: Package,
        urgent_order: AlertTriangle,
        payment_due: DollarSign,
        system_error: XCircle,
        new_lead: UserPlus,
        quote_expired: Clock,
        info: Info,
    };
    return icons[type] || Bell;
}

function getAlertTypeLabel(type: AlertType): string {
    const labels = {
        low_stock: "Low Stock",
        urgent_order: "Urgent Order",
        payment_due: "Payment Due",
        system_error: "System Error",
        new_lead: "New Lead",
        quote_expired: "Quote Expired",
        info: "Information",
    };
    return labels[type] || type;
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
    const styles = {
        critical: "bg-brand-red/10 text-brand-red border-brand-red/20",
        high: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
        medium: "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20",
        low: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    };

    const labels = {
        critical: "Critical",
        high: "High",
        medium: "Medium",
        low: "Low",
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[severity]}`}>
            {labels[severity]}
        </span>
    );
}

export default function AlertsPage() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<AlertFilters>({
        page: 1,
        search: "",
        alert_type: "",
        severity: "",
        is_dismissed: false,
    });
    const [searchInput, setSearchInput] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["alerts", filters],
        queryFn: () => fetchAlerts(filters),
        retry: 1,
    });

    const dismissMutation = useMutation({
        mutationFn: dismissAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
        },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleFilterChange = (key: keyof AlertFilters, value: string | boolean) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    };

    const handleDismiss = (alertId: number) => {
        dismissMutation.mutate(alertId);
    };

    const totalPages = data ? Math.ceil(data.count / 25) : 0;
    const currentPage = filters.page || 1;

    if (error) {
        return (
            <AdminLayout>
                <div className="p-8">
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load alerts</h3>
                        <p className="text-sm text-gray-500">Please refresh the page or try again later.</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Link href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">System Alerts</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Monitor and manage system-wide alerts and notifications.
                    </p>
                </div>
            </header>

            <div className="p-8">
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search alerts..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                                />
                            </div>
                            <select
                                value={filters.alert_type || ""}
                                onChange={(e) => handleFilterChange("alert_type", e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm min-w-[150px]"
                            >
                                <option value="">All Types</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="urgent_order">Urgent Order</option>
                                <option value="payment_due">Payment Due</option>
                                <option value="system_error">System Error</option>
                                <option value="new_lead">New Lead</option>
                                <option value="quote_expired">Quote Expired</option>
                                <option value="info">Information</option>
                            </select>
                            <select
                                value={filters.severity || ""}
                                onChange={(e) => handleFilterChange("severity", e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm min-w-[150px]"
                            >
                                <option value="">All Severity</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={filters.is_dismissed || false}
                                    onChange={(e) => handleFilterChange("is_dismissed", e.target.checked)}
                                    className="h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                                />
                                <span className="text-gray-700">Show Dismissed</span>
                            </label>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="h-4 w-6 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : data && data.results.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Alert
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Severity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.results.map((alert) => {
                                            const Icon = getAlertTypeIcon(alert.alert_type);
                                            const isDismissed = alert.is_dismissed;

                                            return (
                                                <tr
                                                    key={alert.id}
                                                    className={`hover:bg-gray-50 ${isDismissed ? "opacity-60" : ""}`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Icon
                                                            className={`h-5 w-5 ${alert.severity === "critical"
                                                                    ? "text-brand-red"
                                                                    : alert.severity === "high"
                                                                        ? "text-brand-orange"
                                                                        : alert.severity === "medium"
                                                                            ? "text-brand-yellow"
                                                                            : "text-brand-blue"
                                                                }`}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {alert.title}
                                                                </span>
                                                                {isDismissed && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                                                        Dismissed
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                {alert.message}
                                                            </p>
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                {getAlertTypeLabel(alert.alert_type)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <SeverityBadge severity={alert.severity} />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(alert.created_at).toLocaleString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {!isDismissed ? (
                                                            <button
                                                                onClick={() => handleDismiss(alert.id)}
                                                                disabled={dismissMutation.isPending}
                                                                className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:text-brand-blue/80 disabled:opacity-50"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Dismiss
                                                            </button>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{currentPage}</span> of{" "}
                                        <span className="font-medium">{totalPages}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-sm font-medium text-gray-900 mb-1">No alerts found</h3>
                            <p className="text-sm text-gray-500">
                                {filters.search || filters.alert_type || filters.severity
                                    ? "Try adjusting your filters"
                                    : "No system alerts at the moment"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
