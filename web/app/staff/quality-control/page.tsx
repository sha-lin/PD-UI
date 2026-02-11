"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchQCInspections, updateQCInspection } from "@/services/quality-control";
import {
    QCInspection,
    QCInspectionsSummary,
    QCStatus,
    UpdateQCInspectionPayload,
} from "@/types/quality-control";
import type { QCInspectionsQueryParams, QCInspectionsResponse } from "@/types/quality-control";
import QualityControlSummaryStrip from "@/features/quality-control/components/QualityControlSummaryStrip";
import QualityControlFilters from "@/features/quality-control/components/QualityControlFilters";
import QCInspectionsTable from "@/features/quality-control/components/QCInspectionsTable";
import QCPagination from "@/features/quality-control/components/QCPagination";
import QCSkeleton from "@/features/quality-control/components/QCSkeleton";
import QCEmptyState from "@/features/quality-control/components/QCEmptyState";
import QCDetailsPanel from "@/features/quality-control/components/QCDetailsPanel";

interface UpdateInspectionInput {
    inspectionId: number;
    payload: UpdateQCInspectionPayload;
}

export default function QualityControlPage(): ReactElement {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<QCStatus | "all">("all");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [selectedInspection, setSelectedInspection] = useState<QCInspection | null>(null);

    useEffect((): (() => void) => {
        const handleDebounce = (): void => {
            setDebouncedSearch(search);
        };

        const timer = setTimeout(handleDebounce, 3000);

        return (): void => clearTimeout(timer);
    }, [search]);

    const queryParams = useMemo(
        (): QCInspectionsQueryParams => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
            vendor: "all",
            inspector: "all",
            dateFrom,
            dateTo,
            ordering: "-created_at",
        }),
        [page, pageSize, debouncedSearch, status, dateFrom, dateTo]
    );

    const fetchInspections = (): Promise<QCInspectionsResponse> => {
        return fetchQCInspections(queryParams);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["qc-inspections", queryParams],
        queryFn: fetchInspections,
    });

    const updateMutation = useMutation({
        mutationFn: ({ inspectionId, payload }: UpdateInspectionInput): Promise<QCInspection> =>
            updateQCInspection(inspectionId, payload),
        onSuccess: (updated: QCInspection): void => {
            queryClient.invalidateQueries({ queryKey: ["qc-inspections"] });
            setSelectedInspection(updated);
        },
    });

    const summaryFallback: QCInspectionsSummary = {
        total_count: 0,
        pending_count: 0,
        passed_count: 0,
        failed_count: 0,
        rework_count: 0,
    };

    const summary = data?.summary ?? summaryFallback;
    const inspections = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    const updateError = updateMutation.error instanceof Error ? updateMutation.error.message : null;

    const handleSearchChange = (value: string): void => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: QCStatus | "all"): void => {
        setStatus(value);
        setPage(1);
    };

    const handleDateFromChange = (value: string): void => {
        setDateFrom(value);
        setPage(1);
    };

    const handleDateToChange = (value: string): void => {
        setDateTo(value);
        setPage(1);
    };

    const handleResetFilters = (): void => {
        setSearch("");
        setStatus("all");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    };

    const handlePageChange = (nextPage: number): void => {
        setPage(nextPage);
    };

    const handlePageSizeChange = (size: number): void => {
        setPageSize(size);
        setPage(1);
    };

    const handleStatusUpdate = async (inspectionId: number, nextStatus: QCStatus): Promise<void> => {
        await updateMutation.mutateAsync({
            inspectionId,
            payload: { status: nextStatus },
        });
    };

    const handleViewInspection = (inspection: QCInspection): void => {
        setSelectedInspection(inspection);
    };

    const handleCloseDetails = (): void => {
        setSelectedInspection(null);
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
                        <span className="text-gray-900">Quality Control</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Quality Control</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Review inspections, checklists, and outcomes
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                    {isLoading && <QCSkeleton />}

                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load QC inspections</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch QC data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <QualityControlSummaryStrip summary={summary} />

                            <QualityControlFilters
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

                            {inspections.length > 0 ? (
                                <>
                                    <QCInspectionsTable
                                        inspections={inspections}
                                        onView={handleViewInspection}
                                    />
                                    <QCPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </>
                            ) : (
                                <QCEmptyState
                                    title="No inspections found"
                                    description="Try adjusting your filters or search query."
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
            <QCDetailsPanel
                inspection={selectedInspection}
                onClose={handleCloseDetails}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updateMutation.isPending}
                errorMessage={updateError}
            />
        </AdminLayout>
    );
}
