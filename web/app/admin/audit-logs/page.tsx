"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchAuditLogs } from "@/lib/api/audit-logs";
import { AuditLogFilters, AuditLogAction } from "@/types/audit-logs";
import { Search, AlertCircle, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function ActionBadge({ action }: { action: AuditLogAction }) {
    const styles = {
        CREATE: "bg-brand-green/10 text-brand-green border-brand-green/20",
        DELETE: "bg-brand-red/10 text-brand-red border-brand-red/20",
        UPDATE: "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20",
        LOGIN: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
        LOGOUT: "bg-gray-100 text-gray-700 border-gray-200",
        OTHER: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[action]}`}>
            {action}
        </span>
    );
}

export default function AuditLogsPage() {
    const [filters, setFilters] = useState<AuditLogFilters>({
        page: 1,
        search: "",
        action: "",
        model_name: "",
    });
    const [searchInput, setSearchInput] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["audit-logs", filters],
        queryFn: () => fetchAuditLogs(filters),
        retry: 1,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const uniqueModels = data?.results
        ? Array.from(new Set(data.results.map(log => log.model_name))).sort()
        : [];

    const totalPages = data ? Math.ceil(data.count / 50) : 0;
    const currentPage = filters.page || 1;

    if (error) {
        return (
            <AdminLayout>
                <div className="p-8">
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load audit logs</h3>
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
                        <Link href="/staff" className="hover:text-brand-blue">Staff Portal</Link>
                        <span>/</span>
                        <span className="text-gray-900">Audit Logs</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Track all system activities and changes made by users.
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
                                    placeholder="Search by user, object, or details..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                                />
                            </div>
                            <select
                                value={filters.action || ""}
                                onChange={(e) => handleFilterChange("action", e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm min-w-[150px]"
                            >
                                <option value="">All Actions</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                                <option value="LOGIN">Login</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <select
                                value={filters.model_name || ""}
                                onChange={(e) => handleFilterChange("model_name", e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm min-w-[150px]"
                            >
                                <option value="">All Models</option>
                                {uniqueModels.map(model => (
                                    <option key={model} value={model}>
                                        {model.charAt(0).toUpperCase() + model.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse"></div>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Model
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Object
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                IP Address
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Timestamp
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.results.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {log.user ? (
                                                        <Link
                                                            href={`/staff/users/${log.user.id}`}
                                                            className="text-sm font-medium text-brand-blue hover:underline"
                                                        >
                                                            {log.user.username}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 italic">System</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <ActionBadge action={log.action} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.model_name.charAt(0).toUpperCase() + log.model_name.slice(1)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {log.object_repr || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                                    {log.details || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.ip_address || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(log.timestamp).toLocaleString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
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
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-sm font-medium text-gray-900 mb-1">No audit logs found</h3>
                            <p className="text-sm text-gray-500">
                                {filters.search || filters.action || filters.model_name
                                    ? "Try adjusting your filters"
                                    : "No activity has been logged yet"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
