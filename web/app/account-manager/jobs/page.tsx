"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";
import JobsStatsCards from "@/features/jobs/components/JobsStatsCards";
import JobsFilters from "@/features/jobs/components/JobsFilters";
import JobsTable from "@/features/jobs/components/JobsTable";
import JobsPagination from "@/features/jobs/components/JobsPagination";
import JobsSkeleton from "@/features/jobs/components/JobsSkeleton";
import JobsEmptyState from "@/features/jobs/components/JobsEmptyState";
import JobDetailModal from "@/features/jobs/components/JobDetailModal";
import AccountManagerJobAssignModal from "@/features/jobs/components/AccountManagerJobAssignModal";
import { assignJobToProductionTeam, fetchJob, fetchJobs, sendJobReminder } from "@/services/jobs";
import { fetchProductionUsers } from "@/services/users";
import type { Job, JobsQueryParams, JobsResponse } from "@/types/jobs";
import type { ProductionUser, ProductionUsersResponse } from "@/types/users";

export default function AccountManagerJobsPage(): ReactElement {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<"all" | "pending" | "in_progress" | "on_hold" | "completed">("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
    const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);

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

    const { data, isLoading, error } = useQuery({
        queryKey: ["account-manager-jobs", jobQueryParams],
        queryFn: (): Promise<JobsResponse> => fetchJobs(jobQueryParams),
    });

    const productionUsersQuery = useQuery({
        queryKey: ["production-users"],
        queryFn: (): Promise<ProductionUsersResponse> => fetchProductionUsers(),
    });

    const jobDetailQuery = useQuery({
        queryKey: ["job", selectedJobId],
        queryFn: (): Promise<Job> => fetchJob(selectedJobId as number),
        enabled: selectedJobId !== null,
    });

    const assignMutation = useMutation({
        mutationFn: ({ jobId, userId, notes, remindDays }: { jobId: number; userId: number; notes: string; remindDays: number }) =>
            assignJobToProductionTeam(jobId, {
                user_id: userId,
                assignment_notes: notes,
                remind_days_before: remindDays,
            }),
        onSuccess: (): void => {
            toast.success("Job assigned to production team.");
            queryClient.invalidateQueries({ queryKey: ["account-manager-jobs"] });
            queryClient.invalidateQueries({ queryKey: ["job", selectedJobId] });
            setIsAssignOpen(false);
        },
        onError: (): void => {
            toast.error("Unable to assign job. Please try again.");
        },
    });

    const reminderMutation = useMutation({
        mutationFn: (jobId: number) => sendJobReminder(jobId),
        onSuccess: (): void => {
            toast.success("Reminder sent successfully.");
        },
        onError: (): void => {
            toast.error("Unable to send reminder. Please try again.");
        },
    });

    const jobs = data?.results ?? [];
    const totalCount = data?.count ?? 0;
    const productionUsers = productionUsersQuery.data?.results ?? [];

    const openDetailModal = (job: Job): void => {
        setSelectedJobId(job.id);
        setIsDetailOpen(true);
    };

    const openAssignModal = (job: Job): void => {
        setSelectedJobId(job.id);
        setIsAssignOpen(true);
    };

    const handleSendReminder = (job: Job): void => {
        reminderMutation.mutate(job.id);
    };

    const closeModals = (): void => {
        setIsDetailOpen(false);
        setIsAssignOpen(false);
    };

    const handleAssignSubmit = (userId: number, notes: string, remindDays: number): void => {
        if (!selectedJobId) {
            return;
        }
        assignMutation.mutate({ jobId: selectedJobId, userId, notes, remindDays });
    };

    const handleResetFilters = (): void => {
        setSearch("");
        setStatus("all");
        setPage(1);
    };

    return (
        <AccountManagerLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                    <p className="mt-2 text-sm text-gray-600">Manage and track production jobs for your clients</p>
                </div>
            </header>

            <main className="p-8 space-y-6">
                <JobsStatsCards jobs={jobs} />

                <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-4">
                        <JobsFilters
                            search={search}
                            status={status}
                            onSearchChange={setSearch}
                            onStatusChange={setStatus}
                            onReset={handleResetFilters}
                        />
                    </div>

                    {isLoading && <JobsSkeleton />}

                    {error && (
                        <div className="p-6">
                            <div className="rounded-lg border border-brand-red/20 bg-brand-red/5 p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircleIcon className="h-4 w-4 text-brand-red" />
                                    <p className="text-sm font-medium text-brand-red">Unable to load jobs.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && jobs.length === 0 && (
                        <JobsEmptyState
                            title="No jobs found"
                            description="There are no jobs matching your search criteria."
                        />
                    )}

                    {!isLoading && !error && jobs.length > 0 && (
                        <>
                            <JobsTable
                                jobs={jobs}
                                onViewDetails={openDetailModal}
                                onAssign={openAssignModal}
                                onSendReminder={handleSendReminder}
                                showAssignButton
                                showReminderButton
                            />
                            <div className="border-t border-gray-200 p-4">
                                <JobsPagination
                                    count={totalCount}
                                    page={page}
                                    pageSize={pageSize}
                                    onPageChange={setPage}
                                    onPageSizeChange={setPageSize}
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>

            <JobDetailModal
                open={isDetailOpen}
                job={jobDetailQuery.data ?? null}
                stages={[]}
                vendorOptions={[]}
                isLoading={jobDetailQuery.isLoading}
                onClose={closeModals}
            />

            <AccountManagerJobAssignModal
                open={isAssignOpen}
                jobId={selectedJobId}
                productionUsers={productionUsers}
                onClose={closeModals}
                onSubmit={handleAssignSubmit}
            />
        </AccountManagerLayout>
    );
}
