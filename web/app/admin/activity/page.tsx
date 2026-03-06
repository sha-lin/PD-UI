"use client";

import type { ChangeEvent, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchAuditLogs } from "@/lib/api/audit-logs";
import type { AuditLog, AuditLogAction, AuditLogFilters, AuditLogResponse } from "@/types/audit-logs";

const actionOptions: ReadonlyArray<AuditLogAction> = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "OTHER"];

function formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getActionBadgeClass(action: AuditLogAction): string {
    if (action === "CREATE") {
        return "bg-brand-green/10 text-brand-green border-brand-green/20";
    }

    if (action === "UPDATE") {
        return "bg-brand-blue/10 text-brand-blue border-brand-blue/20";
    }

    if (action === "DELETE") {
        return "bg-brand-red/10 text-brand-red border-brand-red/20";
    }

    if (action === "LOGIN" || action === "LOGOUT") {
        return "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function ActivityPage(): ReactElement {
    const [searchInput, setSearchInput] = useState<string>("");
    const [filters, setFilters] = useState<AuditLogFilters>({
        page: 1,
        search: "",
        action: "",
    });

    useEffect((): (() => void) => {
        const timer = setTimeout((): void => {
            setFilters((previous: AuditLogFilters): AuditLogFilters => ({
                ...previous,
                page: 1,
                search: searchInput.trim(),
            }));
        }, 400);

        return (): void => clearTimeout(timer);
    }, [searchInput]);

    const auditLogsQuery = useQuery({
        queryKey: ["activity", filters],
        queryFn: (): Promise<AuditLogResponse> => fetchAuditLogs(filters),
    });

    const currentPage = filters.page ?? 1;
    const totalCount = auditLogsQuery.data?.count ?? 0;
    const pageSize = auditLogsQuery.data?.results.length && currentPage === 1
        ? Math.max(auditLogsQuery.data.results.length, 1)
        : 25;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const showingRange = useMemo((): { start: number; end: number } => {
        if (totalCount === 0) {
            return { start: 0, end: 0 };
        }

        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalCount);
        return { start, end };
    }, [currentPage, pageSize, totalCount]);

    const handleActionChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const value = event.target.value as AuditLogAction | "";
        setFilters((previous: AuditLogFilters): AuditLogFilters => ({
            ...previous,
            page: 1,
            action: value,
        }));
    };

    const handlePrevPage = (): void => {
        if (currentPage <= 1) {
            return;
        }

        setFilters((previous: AuditLogFilters): AuditLogFilters => ({
            ...previous,
            page: currentPage - 1,
        }));
    };

    const handleNextPage = (): void => {
        if (currentPage >= totalPages) {
            return;
        }

        setFilters((previous: AuditLogFilters): AuditLogFilters => ({
            ...previous,
            page: currentPage + 1,
        }));
    };

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                        <Link href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">Activity</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
                    <p className="mt-2 text-sm text-gray-600">Track system actions and operational events.</p>
                </div>
            </header>

            <main className="p-8">
                <section className="rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchInput}
                                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setSearchInput(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>

                            <select
                                value={filters.action ?? ""}
                                onChange={handleActionChange}
                                className="min-w-[160px] rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            >
                                <option value="">All Actions</option>
                                {actionOptions.map((action: AuditLogAction): ReactElement => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {auditLogsQuery.isLoading ? (
                        <div className="p-6">
                            <div className="space-y-3">
                                {Array.from({ length: 8 }).map((_, index: number): ReactElement => (
                                    <div key={index} className="h-8 animate-pulse rounded bg-gray-100" />
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {auditLogsQuery.isError ? (
                        <div className="p-8">
                            <div className="flex items-start gap-2 rounded-lg border border-brand-red/20 bg-brand-red/5 p-4">
                                <AlertCircleIcon className="mt-0.5 h-4 w-4 text-brand-red" />
                                <div>
                                    <p className="text-sm font-semibold text-brand-red">Failed to load activity.</p>
                                    <p className="mt-1 text-sm text-gray-700">Please refresh and try again.</p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {!auditLogsQuery.isLoading && !auditLogsQuery.isError ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Model</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {(auditLogsQuery.data?.results ?? []).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                                    No activity found for the selected filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            (auditLogsQuery.data?.results ?? []).map((log: AuditLog): ReactElement => (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getActionBadgeClass(log.action)}`}>
                                                            {log.action_display || log.action}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {log.model_name || "-"}
                                                    </td>
                                                    <td className="max-w-[460px] truncate px-6 py-4 text-sm text-gray-700">
                                                        {log.details || log.object_repr || "-"}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                        {log.user
                                                            ? `${log.user.first_name} ${log.user.last_name}`.trim() || log.user.username
                                                            : "System"}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                        {formatTimestamp(log.timestamp)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                                <p className="text-sm text-gray-600">
                                    Showing {showingRange.start}-{showingRange.end} of {totalCount}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrevPage}
                                        disabled={currentPage <= 1}
                                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        Prev
                                    </button>
                                    <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                                    <button
                                        type="button"
                                        onClick={handleNextPage}
                                        disabled={currentPage >= totalPages}
                                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
                                    >
                                        Next
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : null}
                </section>
            </main>
        </AdminLayout>
    );
}
