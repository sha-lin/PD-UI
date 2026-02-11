"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import {
    deleteProcess,
    fetchProcesses,
} from "@/services/processes";
import {
    Process,
    ProcessCategory,
    ProcessPricingType,
    ProcessStatus,
    ProcessesQueryParams,
    ProcessesResponse,
} from "@/types/processes";
import ProcessesSummaryStrip from "@/features/processes/components/ProcessesSummaryStrip";
import ProcessesFilters from "@/features/processes/components/ProcessesFilters";
import ProcessesTable from "@/features/processes/components/ProcessesTable";
import ProcessesPagination from "@/features/processes/components/ProcessesPagination";
import ProcessesSkeleton from "@/features/processes/components/ProcessesSkeleton";
import ProcessesEmptyState from "@/features/processes/components/ProcessesEmptyState";

interface ProcessesSummary {
    totalVisible: number;
    activeVisible: number;
    tierVisible: number;
    formulaVisible: number;
}

export default function ProcessesPage(): ReactElement {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<ProcessStatus | "all">("all");
    const [pricingType, setPricingType] = useState<ProcessPricingType | "all">("all");
    const [category, setCategory] = useState<ProcessCategory | "all">("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    useEffect((): (() => void) => {
        const handleDebounce = (): void => {
            setDebouncedSearch(search);
        };

        const timer = setTimeout(handleDebounce, 3000);

        return (): void => clearTimeout(timer);
    }, [search]);

    const queryParams = useMemo(
        (): ProcessesQueryParams => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
            pricingType,
            category,
            ordering: "-created_at",
        }),
        [page, pageSize, debouncedSearch, status, pricingType, category]
    );

    const fetchProcessesQuery = (): Promise<ProcessesResponse> => {
        return fetchProcesses(queryParams);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["processes", queryParams],
        queryFn: fetchProcessesQuery,
    });

    const deleteMutation = useMutation({
        mutationFn: (processId: number): Promise<void> => deleteProcess(processId),
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ["processes"] });
        },
    });

    const processes = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    const summary: ProcessesSummary = processes.reduce(
        (accumulator: ProcessesSummary, process: Process): ProcessesSummary => {
            const nextAccumulator: ProcessesSummary = {
                totalVisible: accumulator.totalVisible + 1,
                activeVisible: accumulator.activeVisible + (process.status === "active" ? 1 : 0),
                tierVisible: accumulator.tierVisible + (process.pricing_type === "tier" ? 1 : 0),
                formulaVisible: accumulator.formulaVisible + (process.pricing_type === "formula" ? 1 : 0),
            };
            return nextAccumulator;
        },
        {
            totalVisible: 0,
            activeVisible: 0,
            tierVisible: 0,
            formulaVisible: 0,
        }
    );

    const handleSearchChange = (value: string): void => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: ProcessStatus | "all"): void => {
        setStatus(value);
        setPage(1);
    };

    const handlePricingTypeChange = (value: ProcessPricingType | "all"): void => {
        setPricingType(value);
        setPage(1);
    };

    const handleCategoryChange = (value: ProcessCategory | "all"): void => {
        setCategory(value);
        setPage(1);
    };

    const handleResetFilters = (): void => {
        setSearch("");
        setStatus("all");
        setPricingType("all");
        setCategory("all");
        setPage(1);
    };

    const handlePageChange = (nextPage: number): void => {
        setPage(nextPage);
    };

    const handlePageSizeChange = (size: number): void => {
        setPageSize(size);
        setPage(1);
    };

    const handleView = (process: Process): void => {
        router.push(`/staff/processes/${process.id}`);
    };

    const handleEdit = (process: Process): void => {
        router.push(`/staff/processes/${process.id}/edit`);
    };

    const handleManageRanges = (process: Process): void => {
        router.push(`/staff/processes/${process.id}/variable-ranges`);
    };

    const handleDelete = (process: Process): void => {
        const confirmDelete = window.confirm(`Delete ${process.process_name}? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }
        deleteMutation.mutate(process.id);
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
                        <span className="text-gray-900">Processes</span>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Processes</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Configure pricing workflows, vendors, and lead times
                            </p>
                        </div>
                        <a
                            href="/staff/processes/new"
                            className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
                        >
                            <PlusIcon className="h-4 w-4" />
                            New Process
                        </a>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                    {isLoading && <ProcessesSkeleton />}

                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load processes</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch process data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <ProcessesSummaryStrip summary={summary} />

                            <ProcessesFilters
                                search={search}
                                status={status}
                                pricingType={pricingType}
                                category={category}
                                onSearchChange={handleSearchChange}
                                onStatusChange={handleStatusChange}
                                onPricingTypeChange={handlePricingTypeChange}
                                onCategoryChange={handleCategoryChange}
                                onReset={handleResetFilters}
                            />

                            {processes.length > 0 ? (
                                <>
                                    <ProcessesTable
                                        processes={processes}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onManageRanges={handleManageRanges}
                                    />
                                    <ProcessesPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </>
                            ) : (
                                <ProcessesEmptyState
                                    title="No processes found"
                                    description="Try adjusting your filters or create a new process."
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
