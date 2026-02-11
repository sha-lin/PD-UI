"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchLpos } from "@/services/lpos";
import { LPO, LPOSummary, LPOStatus } from "@/types/lpos";
import LpoSummaryStrip from "@/features/lpos/components/LpoSummaryStrip";
import LpoFilters from "@/features/lpos/components/LpoFilters";
import LpoTable from "@/features/lpos/components/LpoTable";
import LpoPagination from "@/features/lpos/components/LpoPagination";
import LpoSkeleton from "@/features/lpos/components/LpoSkeleton";
import LpoEmptyState from "@/features/lpos/components/LpoEmptyState";
import LpoDetailsPanel from "@/features/lpos/components/LpoDetailsPanel";

export default function LPOsPage() {
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<LPOStatus | "all">("all");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [selectedLpo, setSelectedLpo] = useState<LPO | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 3000);

        return () => clearTimeout(timer);
    }, [search]);

    const queryParams = useMemo(
        () => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
            dateFrom,
            dateTo,
            ordering: "-created_at",
        }),
        [page, pageSize, debouncedSearch, status, dateFrom, dateTo]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["lpos", queryParams],
        queryFn: () => fetchLpos(queryParams),
    });

    const summaryFallback: LPOSummary = {
        total_amount: 0,
        pending_amount: 0,
        approved_amount: 0,
        in_production_amount: 0,
        completed_amount: 0,
        cancelled_amount: 0,
        total_count: 0,
        pending_count: 0,
        approved_count: 0,
        in_production_count: 0,
        completed_count: 0,
        cancelled_count: 0,
    };

    const summary = data?.summary ?? summaryFallback;
    const lpos = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: LPOStatus | "all") => {
        setStatus(value);
        setPage(1);
    };

    const handleDateFromChange = (value: string) => {
        setDateFrom(value);
        setPage(1);
    };

    const handleDateToChange = (value: string) => {
        setDateTo(value);
        setPage(1);
    };

    const handleResetFilters = () => {
        setSearch("");
        setStatus("all");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    };

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <a href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">LPOs</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Local Purchase Orders</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Track order approvals, fulfillment status, and totals
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                    {isLoading && <LpoSkeleton />}

                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load LPOs</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch LPO data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <LpoSummaryStrip summary={summary} />

                            <LpoFilters
                                search={search}
                                status={status}
                                dateFrom={dateFrom}
                                dateTo={dateTo}
                                onSearchChange={handleSearchChange}
                                onStatusChange={handleStatusChange}
                                onDateFromChange={handleDateFromChange}
                                onDateToChange={handleDateToChange}
                                onReset={handleResetFilters}
                            />

                            {lpos.length > 0 ? (
                                <>
                                    <LpoTable lpos={lpos} onView={(lpo) => setSelectedLpo(lpo)} />
                                    <LpoPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </>
                            ) : (
                                <LpoEmptyState
                                    title="No LPOs found"
                                    description="Try adjusting your filters or date range."
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
            <LpoDetailsPanel lpo={selectedLpo} onClose={() => setSelectedLpo(null)} />
        </AdminLayout>
    );
}
