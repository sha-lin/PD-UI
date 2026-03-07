"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, type ReactElement } from "react";
import { toast } from "sonner";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";
import LeadsStatsCards from "@/features/leads/components/LeadsStatsCards";
import LeadsFilters from "@/features/leads/components/LeadsFilters";
import LeadsTable from "@/features/leads/components/LeadsTable";
import LeadsPagination from "@/features/leads/components/LeadsPagination";
import LeadFormDrawer from "@/features/leads/components/LeadFormDrawer";
import LeadDetailDrawer from "@/features/leads/components/LeadDetailDrawer";
import { fetchLeads, createLead, updateLead, deleteLead, qualifyLead, convertLead } from "@/services/leads";
import type { Lead, LeadSource, LeadStatus, LeadsQueryParams, LeadConvertPayload } from "@/types/leads";

export default function LeadIntakePage(): ReactElement {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
    const [sourceFilter, setSourceFilter] = useState<"all" | LeadSource>("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [drawerState, setDrawerState] = useState<{
        isOpen: boolean;
        mode: "create" | "edit";
        lead: Lead | null;
    }>({
        isOpen: false,
        mode: "create",
        lead: null,
    });

    const [detailDrawerState, setDetailDrawerState] = useState<{
        isOpen: boolean;
        lead: Lead | null;
    }>({
        isOpen: false,
        lead: null,
    });

    const [pendingLeadId, setPendingLeadId] = useState<number | null>(null);
    const [pendingAction, setPendingAction] = useState<"qualify" | "delete" | "convert" | null>(null);

    const queryParams: LeadsQueryParams = useMemo(() => {
        const params: LeadsQueryParams = {
            page: currentPage,
            pageSize: 20,
            search: search.trim(),
            status: statusFilter,
            source: sourceFilter,
        };

        return params;
    }, [search, statusFilter, sourceFilter, currentPage]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["leads", queryParams],
        queryFn: () => fetchLeads(queryParams),
    });

    const stats = useMemo(() => {
        if (!data) {
            return { total: 0, new: 0, qualified: 0, converted: 0 };
        }

        return {
            total: data.count,
            new: data.results.filter((lead) => lead.status === "New").length,
            qualified: data.results.filter((lead) => lead.status === "Qualified").length,
            converted: data.results.filter((lead) => lead.status === "Converted").length,
        };
    }, [data]);

    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead created successfully");
            setDrawerState({ isOpen: false, mode: "create", lead: null });
        },
        onError: (error: Error) => {
            if (error.name === "BusinessValidationError") {
                toast.error(error.message);
            } else {
                toast.error("Failed to create lead. Please try again.");
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ leadId, payload }: { leadId: number; payload: Partial<Lead> }) =>
            updateLead(leadId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead updated successfully");
            setDrawerState({ isOpen: false, mode: "create", lead: null });
        },
        onError: (error: Error) => {
            if (error.name === "BusinessValidationError") {
                toast.error(error.message);
            } else {
                toast.error("Failed to update lead. Please try again.");
            }
        },
    });

    const qualifyMutation = useMutation({
        mutationFn: qualifyLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead qualified successfully");
            setDetailDrawerState({ isOpen: false, lead: null });
            setPendingLeadId(null);
            setPendingAction(null);
        },
        onError: (error: Error) => {
            if (error.name === "BusinessValidationError") {
                toast.error(error.message);
            } else {
                toast.error("Failed to qualify lead. Please try again.");
            }
            setPendingLeadId(null);
            setPendingAction(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead deleted successfully");
            setPendingLeadId(null);
            setPendingAction(null);
        },
        onError: () => {
            toast.error("Failed to delete lead. Please try again.");
            setPendingLeadId(null);
            setPendingAction(null);
        },
    });

    const convertMutation = useMutation({
        mutationFn: ({ leadId, payload }: { leadId: number; payload: LeadConvertPayload }) =>
            convertLead(leadId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead converted to client successfully");
            setDetailDrawerState({ isOpen: false, lead: null });
        },
        onError: (error: Error) => {
            if (error.name === "BusinessValidationError") {
                toast.error(error.message);
            } else {
                toast.error("Failed to convert lead. Please try again.");
            }
        },
    });

    const handleCreateNew = (): void => {
        setDrawerState({ isOpen: true, mode: "create", lead: null });
    };

    const handleEdit = (lead: Lead): void => {
        setDetailDrawerState({ isOpen: false, lead: null });
        setDrawerState({ isOpen: true, mode: "edit", lead });
    };

    const handleView = (lead: Lead): void => {
        setDetailDrawerState({ isOpen: true, lead });
    };

    const handleQualify = (lead: Lead): void => {
        setPendingLeadId(lead.id);
        setPendingAction("qualify");
        qualifyMutation.mutate(lead.id);
    };

    const handleDelete = (lead: Lead): void => {
        if (!confirm(`Are you sure you want to delete lead ${lead.name}?`)) {
            return;
        }

        setPendingLeadId(lead.id);
        setPendingAction("delete");
        deleteMutation.mutate(lead.id);
    };

    const handleConvert = (lead: Lead, payload: LeadConvertPayload): void => {
        convertMutation.mutate({ leadId: lead.id, payload });
    };

    const handleFormSubmit = (payload: Partial<Lead>, leadId?: number): void => {
        if (leadId !== undefined) {
            updateMutation.mutate({ leadId, payload });
            return;
        }

        createMutation.mutate(payload);
    };

    const handleFormClose = (): void => {
        setDrawerState({ isOpen: false, mode: "create", lead: null });
    };

    const handleDetailClose = (): void => {
        setDetailDrawerState({ isOpen: false, lead: null });
    };

    const handleResetFilters = (): void => {
        setSearch("");
        setStatusFilter("all");
        setSourceFilter("all");
        setCurrentPage(1);
    };

    const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <AccountManagerLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-black">Lead Intake</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Capture, qualify, and convert prospects into clients
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreateNew}
                        className="rounded-md bg-brand-blue text-white px-4 py-2 text-sm font-semibold hover:bg-brand-blue/90"
                    >
                        Add New Lead
                    </button>
                </div>
            </header>

            <main className="p-8 space-y-6">
                <LeadsStatsCards stats={stats} />

                <LeadsFilters
                    search={search}
                    status={statusFilter}
                    source={sourceFilter}
                    onSearchChange={setSearch}
                    onStatusChange={setStatusFilter}
                    onSourceChange={setSourceFilter}
                    onReset={handleResetFilters}
                />

                {isLoading && (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-sm text-gray-500">Loading leads...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
                        <p className="text-sm text-red-600">Failed to load leads. Please try again.</p>
                    </div>
                )}

                {data && data.results.length === 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-sm text-gray-500">
                            {search || statusFilter !== "all" || sourceFilter !== "all"
                                ? "No leads found matching your filters."
                                : "No leads yet. Add your first lead to get started."}
                        </p>
                    </div>
                )}

                {data && data.results.length > 0 && (
                    <>
                        <LeadsTable
                            leads={data.results}
                            onView={handleView}
                            onQualify={handleQualify}
                            onDelete={handleDelete}
                            pendingLeadId={pendingLeadId}
                            pendingAction={pendingAction}
                        />

                        <LeadsPagination
                            page={currentPage}
                            count={data.count}
                            pageSize={20}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={() => { }}
                        />
                    </>
                )}
            </main>

            <LeadFormDrawer
                isOpen={drawerState.isOpen}
                isSubmitting={isFormSubmitting}
                mode={drawerState.mode}
                lead={drawerState.lead}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
            />

            <LeadDetailDrawer
                isOpen={detailDrawerState.isOpen}
                lead={detailDrawerState.lead}
                isLoading={false}
                isQualifying={qualifyMutation.isPending}
                isConverting={convertMutation.isPending}
                onClose={handleDetailClose}
                onEdit={handleEdit}
                onQualify={handleQualify}
                onConvert={handleConvert}
            />
        </AccountManagerLayout>
    );
}
