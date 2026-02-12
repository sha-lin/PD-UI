"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import JobsFilters from "@/features/jobs/components/JobsFilters";
import JobsTable from "@/features/jobs/components/JobsTable";
import JobsPagination from "@/features/jobs/components/JobsPagination";
import JobsSkeleton from "@/features/jobs/components/JobsSkeleton";
import JobsEmptyState from "@/features/jobs/components/JobsEmptyState";
import JobDetailModal from "@/features/jobs/components/JobDetailModal";
import JobAssignModal from "@/features/jobs/components/JobAssignModal";
import JobProgressModal from "@/features/jobs/components/JobProgressModal";
import { fetchVendors } from "@/services/vendors";
import {
    createJobVendorStage,
    fetchJob,
    fetchJobVendorStages,
    fetchJobs,
    updateJobVendorStage,
} from "@/services/jobs";
import type {
    CreateJobVendorStagePayload,
    Job,
    JobVendorStage,
    JobsQueryParams,
    JobsResponse,
    UpdateJobVendorStagePayload,
} from "@/types/jobs";
import type { Vendor, VendorsQueryParams, VendorsResponse } from "@/types/vendors";
import { toast } from "sonner";

export default function JobsPage(): ReactElement {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<"all" | "pending" | "in_progress" | "on_hold" | "completed">("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
    const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
    const [isProgressOpen, setIsProgressOpen] = useState<boolean>(false);

    useEffect((): (() => void) => {
        const timer = setTimeout((): void => {
            setDebouncedSearch(search);
        }, 500);

        return (): void => clearTimeout(timer);
    }, [search]);

    const jobQueryParams = useMemo(
        (): JobsQueryParams => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
        }),
        [page, pageSize, debouncedSearch, status]
    );

    const vendorQueryParams = useMemo(
        (): VendorsQueryParams => ({
            page: 1,
            pageSize: 200,
            search: "",
            active: "true",
        }),
        []
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["jobs", jobQueryParams],
        queryFn: (): Promise<JobsResponse> => fetchJobs(jobQueryParams),
    });

    const vendorQuery = useQuery({
        queryKey: ["vendors", vendorQueryParams],
        queryFn: (): Promise<VendorsResponse> => fetchVendors(vendorQueryParams),
    });

    const jobDetailQuery = useQuery({
        queryKey: ["job", selectedJobId],
        queryFn: (): Promise<Job> => fetchJob(selectedJobId as number),
        enabled: selectedJobId !== null,
    });

    const jobStagesQuery = useQuery({
        queryKey: ["job-vendor-stages", selectedJobId],
        queryFn: (): Promise<JobVendorStage[]> => fetchJobVendorStages(selectedJobId as number),
        enabled: selectedJobId !== null,
    });

    const assignMutation = useMutation({
        mutationFn: (payload: CreateJobVendorStagePayload): Promise<JobVendorStage> => createJobVendorStage(payload),
        onSuccess: (): void => {
            toast.success("Vendor assigned.");
            queryClient.invalidateQueries({ queryKey: ["job-vendor-stages", selectedJobId] });
            setIsAssignOpen(false);
        },
        onError: (): void => {
            toast.error("Unable to assign vendor. Please try again.");
        },
    });

    const progressMutation = useMutation({
        mutationFn: ({ stageId, payload }: { stageId: number; payload: UpdateJobVendorStagePayload }): Promise<JobVendorStage> =>
            updateJobVendorStage(stageId, payload),
        onSuccess: (): void => {
            toast.success("Progress updated.");
            queryClient.invalidateQueries({ queryKey: ["job-vendor-stages", selectedJobId] });
            setIsProgressOpen(false);
        },
        onError: (): void => {
            toast.error("Unable to update progress. Please try again.");
        },
    });

    const jobs = data?.results ?? [];
    const totalCount = data?.count ?? 0;
    const stages = jobStagesQuery.data ?? [];
    const vendors = vendorQuery.data?.results ?? [];

    const openDetailModal = (job: Job): void => {
        setSelectedJobId(job.id);
        setIsDetailOpen(true);
    };

    const openAssignModal = (job: Job): void => {
        setSelectedJobId(job.id);
        setIsAssignOpen(true);
    };

    const openProgressModal = (job: Job): void => {
        setSelectedJobId(job.id);
        setIsProgressOpen(true);
    };

    const closeModals = (): void => {
        setIsDetailOpen(false);
        setIsAssignOpen(false);
        setIsProgressOpen(false);
    };

    const handleAssignSubmit = (payload: CreateJobVendorStagePayload): void => {
        if (!selectedJobId) {
            toast.error("Select a job before assigning a vendor.");
            return;
        }

        assignMutation.mutate({
            ...payload,
            job: selectedJobId,
        });
    };

    const handleProgressSubmit = (stageId: number, payload: UpdateJobVendorStagePayload): void => {
        progressMutation.mutate({ stageId, payload });
    };

    const handleSearchChange = (value: string): void => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: "all" | "pending" | "in_progress" | "on_hold" | "completed"): void => {
        setStatus(value);
        setPage(1);
    };

    const handleResetFilters = (): void => {
        setSearch("");
        setStatus("all");
        setPage(1);
    };

    const handlePageChange = (nextPage: number): void => {
        setPage(nextPage);
    };

    const handlePageSizeChange = (size: number): void => {
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
                        <span className="text-gray-900">Jobs</span>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                            <p className="mt-2 text-sm text-gray-600">Track production jobs and vendor assignments</p>
                        </div>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="px-8 py-6 space-y-6">
                    {isLoading && <JobsSkeleton />}

                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load jobs</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch job data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <JobsFilters
                                search={search}
                                status={status}
                                onSearchChange={handleSearchChange}
                                onStatusChange={handleStatusChange}
                                onReset={handleResetFilters}
                            />

                            {jobs.length > 0 ? (
                                <>
                                    <JobsTable
                                        jobs={jobs}
                                        onView={openDetailModal}
                                        onAssign={openAssignModal}
                                        onProgress={openProgressModal}
                                    />
                                    <JobsPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </>
                            ) : (
                                <JobsEmptyState
                                    title="No jobs found"
                                    description="Try adjusting your filters or create a new job from a quote."
                                />
                            )}
                        </>
                    )}
                </div>
            </main>

            <JobDetailModal
                open={isDetailOpen}
                job={jobDetailQuery.data ?? null}
                stages={stages}
                vendorOptions={vendors}
                isLoading={jobDetailQuery.isLoading || jobStagesQuery.isLoading}
                onClose={(): void => setIsDetailOpen(false)}
            />

            <JobAssignModal
                open={isAssignOpen}
                vendorOptions={vendors}
                defaultStageOrder={stages.length + 1}
                onClose={(): void => setIsAssignOpen(false)}
                onSubmit={handleAssignSubmit}
            />

            <JobProgressModal
                open={isProgressOpen}
                stages={stages}
                vendorOptions={vendors}
                onClose={(): void => setIsProgressOpen(false)}
                onSubmit={handleProgressSubmit}
            />
        </AdminLayout>
    );
}
