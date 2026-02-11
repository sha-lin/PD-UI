"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchDeliveries } from "@/services/deliveries";
import {
    Delivery,
    DeliveriesSummary,
    DeliveryMethod,
    DeliveryStatus,
    StagingLocation,
} from "@/types/deliveries";
import DeliveriesSummaryStrip from "@/features/deliveries/components/DeliveriesSummaryStrip";
import DeliveriesFilters from "@/features/deliveries/components/DeliveriesFilters";
import DeliveriesTable from "@/features/deliveries/components/DeliveriesTable";
import DeliveriesPagination from "@/features/deliveries/components/DeliveriesPagination";
import DeliveriesSkeleton from "@/features/deliveries/components/DeliveriesSkeleton";
import DeliveriesEmptyState from "@/features/deliveries/components/DeliveriesEmptyState";
import DeliveryDetailsPanel from "@/features/deliveries/components/DeliveryDetailsPanel";

export default function DeliveriesPage() {
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<DeliveryStatus | "all">("all");
    const [stagingLocation, setStagingLocation] = useState<StagingLocation | "all">("all");
    const [handoffConfirmed, setHandoffConfirmed] = useState<"all" | "true" | "false">("all");
    const [urgentOnly, setUrgentOnly] = useState<"all" | "true" | "false">("all");
    const [method, setMethod] = useState<DeliveryMethod | "all">("all");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

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
            stagingLocation,
            handoffConfirmed,
            urgentOnly,
            method,
            dateFrom,
            dateTo,
            ordering: "-created_at",
        }),
        [
            page,
            pageSize,
            debouncedSearch,
            status,
            stagingLocation,
            handoffConfirmed,
            urgentOnly,
            method,
            dateFrom,
            dateTo,
        ]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["deliveries", queryParams],
        queryFn: () => fetchDeliveries(queryParams),
    });

    const summaryFallback: DeliveriesSummary = {
        total_count: 0,
        staged_count: 0,
        in_transit_count: 0,
        delivered_count: 0,
        failed_count: 0,
        urgent_count: 0,
        handoff_confirmed_count: 0,
    };

    const summary = data?.summary ?? summaryFallback;
    const deliveries = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: DeliveryStatus | "all") => {
        setStatus(value);
        setPage(1);
    };

    const handleStagingLocationChange = (value: StagingLocation | "all") => {
        setStagingLocation(value);
        setPage(1);
    };

    const handleHandoffConfirmedChange = (value: "all" | "true" | "false") => {
        setHandoffConfirmed(value);
        setPage(1);
    };

    const handleUrgentChange = (value: "all" | "true" | "false") => {
        setUrgentOnly(value);
        setPage(1);
    };

    const handleMethodChange = (value: DeliveryMethod | "all") => {
        setMethod(value);
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
        setStagingLocation("all");
        setHandoffConfirmed("all");
        setUrgentOnly("all");
        setMethod("all");
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
                        <span className="text-gray-900">Deliveries</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Monitor handoffs, staging, and delivery progress
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                    {isLoading && <DeliveriesSkeleton />}

                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load deliveries</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch delivery data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <DeliveriesSummaryStrip summary={summary} />

                            <DeliveriesFilters
                                search={search}
                                status={status}
                                stagingLocation={stagingLocation}
                                handoffConfirmed={handoffConfirmed}
                                urgentOnly={urgentOnly}
                                method={method}
                                dateFrom={dateFrom}
                                dateTo={dateTo}
                                onSearchChange={handleSearchChange}
                                onStatusChange={handleStatusChange}
                                onStagingLocationChange={handleStagingLocationChange}
                                onHandoffConfirmedChange={handleHandoffConfirmedChange}
                                onUrgentChange={handleUrgentChange}
                                onMethodChange={handleMethodChange}
                                onDateFromChange={handleDateFromChange}
                                onDateToChange={handleDateToChange}
                                onReset={handleResetFilters}
                            />

                            {deliveries.length > 0 ? (
                                <>
                                    <DeliveriesTable
                                        deliveries={deliveries}
                                        onView={(delivery) => setSelectedDelivery(delivery)}
                                    />
                                    <DeliveriesPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </>
                            ) : (
                                <DeliveriesEmptyState
                                    title="No deliveries found"
                                    description="Try adjusting your filters or date range."
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
            <DeliveryDetailsPanel
                delivery={selectedDelivery}
                onClose={() => setSelectedDelivery(null)}
            />
        </AdminLayout>
    );
}
