"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import LeadDetailDrawer from "@/features/leads/components/LeadDetailDrawer";
import LeadsFilters from "@/features/leads/components/LeadsFilters";
import LeadsPagination from "@/features/leads/components/LeadsPagination";
import LeadsTable from "@/features/leads/components/LeadsTable";
import { convertLead, deleteLead, fetchLead, fetchLeads, qualifyLead } from "@/services/leads";
import type { Lead, LeadConvertPayload, LeadConvertResponse, LeadQualifyResponse, LeadSource, LeadStatus, LeadsQueryParams, LeadsResponse } from "@/types/leads";

type PendingAction = "qualify" | "delete" | "convert";

interface PendingLeadAction {
    leadId: number;
    action: PendingAction;
}

interface LeadsMutationContext {
    previousLeadQueries: Array<[QueryKey, LeadsResponse | undefined]>;
    previousLeadDetail: Lead | undefined;
}

export default function LeadsPage(): ReactElement {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<"all" | LeadStatus>("all");
    const [source, setSource] = useState<"all" | LeadSource>("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const [pendingLeadAction, setPendingLeadAction] = useState<PendingLeadAction | null>(null);

    useEffect((): (() => void) => {
        const timer = setTimeout((): void => {
            setDebouncedSearch(search);
        }, 400);

        return (): void => clearTimeout(timer);
    }, [search]);

    const leadQueryParams = useMemo(
        (): LeadsQueryParams => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
            source,
        }),
        [page, pageSize, debouncedSearch, status, source]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["leads", leadQueryParams],
        queryFn: (): Promise<LeadsResponse> => fetchLeads(leadQueryParams),
    });

    const { data: selectedLead, isLoading: isSelectedLeadLoading } = useQuery({
        queryKey: ["lead", selectedLeadId],
        queryFn: (): Promise<Lead> => fetchLead(selectedLeadId as number),
        enabled: selectedLeadId !== null,
    });

    const updateLeadsInCache = (updateLead: (lead: Lead) => Lead | null): void => {
        queryClient.setQueriesData<LeadsResponse>({ queryKey: ["leads"] }, (currentValue: LeadsResponse | undefined): LeadsResponse | undefined => {
            if (currentValue === undefined) {
                return currentValue;
            }

            const nextResults: Lead[] = [];
            for (const lead of currentValue.results) {
                const updatedLead = updateLead(lead);
                if (updatedLead !== null) {
                    nextResults.push(updatedLead);
                }
            }

            return {
                ...currentValue,
                results: nextResults,
                count: nextResults.length < currentValue.results.length ? Math.max(0, currentValue.count - 1) : currentValue.count,
            };
        });
    };

    const extractMutationMessage = (errorValue: unknown, fallback: string): string => {
        if (errorValue instanceof Error) {
            const [, , ...parts] = errorValue.message.split(": ");
            const detail = parts.join(": ").trim();
            if (detail) {
                return detail;
            }
        }
        return fallback;
    };

    const deleteMutation = useMutation({
        mutationFn: (leadId: number): Promise<void> => deleteLead(leadId),
        onMutate: async (leadId: number): Promise<LeadsMutationContext> => {
            setPendingLeadAction({ leadId, action: "delete" });
            await queryClient.cancelQueries({ queryKey: ["leads"] });

            const previousLeadQueries = queryClient.getQueriesData<LeadsResponse>({ queryKey: ["leads"] });
            const previousLeadDetail = queryClient.getQueryData<Lead>(["lead", leadId]);

            updateLeadsInCache((lead: Lead): Lead | null => (lead.id === leadId ? null : lead));

            if (selectedLeadId === leadId) {
                setSelectedLeadId(null);
            }

            return {
                previousLeadQueries,
                previousLeadDetail,
            };
        },
        onSuccess: (): void => {
            toast.success("Lead deleted.");
        },
        onError: (errorValue: unknown, leadId: number, context: LeadsMutationContext | undefined): void => {
            if (context !== undefined) {
                for (const [queryKey, previousValue] of context.previousLeadQueries) {
                    queryClient.setQueryData(queryKey, previousValue);
                }
                queryClient.setQueryData(["lead", leadId], context.previousLeadDetail);
            }
            toast.error(extractMutationMessage(errorValue, "Unable to delete lead."));
        },
        onSettled: (_data: void | undefined, _error: unknown, leadId: number): void => {
            setPendingLeadAction(null);
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        },
    });

    const qualifyMutation = useMutation({
        mutationFn: (leadId: number): Promise<LeadQualifyResponse> => qualifyLead(leadId),
        onMutate: async (leadId: number): Promise<LeadsMutationContext> => {
            setPendingLeadAction({ leadId, action: "qualify" });
            await queryClient.cancelQueries({ queryKey: ["leads"] });

            const previousLeadQueries = queryClient.getQueriesData<LeadsResponse>({ queryKey: ["leads"] });
            const previousLeadDetail = queryClient.getQueryData<Lead>(["lead", leadId]);

            updateLeadsInCache((lead: Lead): Lead | null =>
                lead.id === leadId
                    ? {
                        ...lead,
                        status: "Qualified",
                    }
                    : lead
            );

            queryClient.setQueryData<Lead | undefined>(["lead", leadId], (currentLead: Lead | undefined): Lead | undefined => {
                if (currentLead === undefined) {
                    return currentLead;
                }

                return {
                    ...currentLead,
                    status: "Qualified",
                };
            });

            return {
                previousLeadQueries,
                previousLeadDetail,
            };
        },
        onSuccess: (): void => {
            toast.success("Lead qualified.");
        },
        onError: (errorValue: unknown): void => {
            toast.error(extractMutationMessage(errorValue, "Unable to qualify lead."));
        },
        onError: (errorValue: unknown, leadId: number, context: LeadsMutationContext | undefined): void => {
            if (context !== undefined) {
                for (const [queryKey, previousValue] of context.previousLeadQueries) {
                    queryClient.setQueryData(queryKey, previousValue);
                }
                queryClient.setQueryData(["lead", leadId], context.previousLeadDetail);
            }
            toast.error(extractMutationMessage(errorValue, "Unable to qualify lead."));
        },
        onSettled: (_data: LeadQualifyResponse | undefined, _error: unknown, leadId: number): void => {
            setPendingLeadAction(null);
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        },
    });

    const convertMutation = useMutation({
        mutationFn: (values: { leadId: number; payload: LeadConvertPayload }): Promise<LeadConvertResponse> =>
            convertLead(values.leadId, values.payload),
        onMutate: async (values: { leadId: number; payload: LeadConvertPayload }): Promise<LeadsMutationContext> => {
            const { leadId } = values;
            setPendingLeadAction({ leadId, action: "convert" });
            await queryClient.cancelQueries({ queryKey: ["leads"] });

            const previousLeadQueries = queryClient.getQueriesData<LeadsResponse>({ queryKey: ["leads"] });
            const previousLeadDetail = queryClient.getQueryData<Lead>(["lead", leadId]);
            const nowValue = new Date().toISOString();

            updateLeadsInCache((lead: Lead): Lead | null =>
                lead.id === leadId
                    ? {
                        ...lead,
                        status: "Converted",
                        converted_to_client: true,
                        converted_at: nowValue,
                    }
                    : lead
            );

            queryClient.setQueryData<Lead | undefined>(["lead", leadId], (currentLead: Lead | undefined): Lead | undefined => {
                if (currentLead === undefined) {
                    return currentLead;
                }

                return {
                    ...currentLead,
                    status: "Converted",
                    converted_to_client: true,
                    converted_at: nowValue,
                };
            });

            return {
                previousLeadQueries,
                previousLeadDetail,
            };
        },
        onSuccess: (): void => {
            toast.success("Lead converted to client.");
        },
        onError: (errorValue: unknown, values: { leadId: number; payload: LeadConvertPayload }, context: LeadsMutationContext | undefined): void => {
            if (context !== undefined) {
                for (const [queryKey, previousValue] of context.previousLeadQueries) {
                    queryClient.setQueryData(queryKey, previousValue);
                }
                queryClient.setQueryData(["lead", values.leadId], context.previousLeadDetail);
            }
            toast.error(extractMutationMessage(errorValue, "Unable to convert lead."));
        },
        onSettled: (_data: LeadConvertResponse | undefined, _error: unknown, values: { leadId: number; payload: LeadConvertPayload }): void => {
            setPendingLeadAction(null);
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["lead", values.leadId] });
        },
    });

    const handleResetFilters = (): void => {
        setSearch("");
        setStatus("all");
        setSource("all");
        setPage(1);
    };

    const handleDelete = (lead: Lead): void => {
        const shouldDelete = window.confirm(`Delete ${lead.lead_id}? This cannot be undone.`);
        if (!shouldDelete) {
            return;
        }

        deleteMutation.mutate(lead.id);
    };

    const handleQualify = (lead: Lead): void => {
        qualifyMutation.mutate(lead.id);
    };

    const handleView = (lead: Lead): void => {
        setSelectedLeadId(lead.id);
    };

    const handleConvert = (lead: Lead, payload: LeadConvertPayload): void => {
        convertMutation.mutate({ leadId: lead.id, payload });
    };

    const leads = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    return (
        <AdminLayout>
            <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <a href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">Leads</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Track prospect lifecycle from new inquiry to conversion-ready lead.
                        </p>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen pt-24">
                <div className="px-8 py-6 space-y-6">
                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load leads</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch lead data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!error && (
                        <>
                            <LeadsFilters
                                search={search}
                                status={status}
                                source={source}
                                onSearchChange={(value: string): void => {
                                    setSearch(value);
                                    setPage(1);
                                }}
                                onStatusChange={(value: "all" | LeadStatus): void => {
                                    setStatus(value);
                                    setPage(1);
                                }}
                                onSourceChange={(value: "all" | LeadSource): void => {
                                    setSource(value);
                                    setPage(1);
                                }}
                                onReset={handleResetFilters}
                            />

                            {isLoading ? (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                                    <div className="h-4 bg-gray-200 rounded w-72 mt-3"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        {[1, 2, 3, 4].map((item: number): ReactElement => (
                                            <div key={item} className="h-16 bg-gray-100 rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : leads.length > 0 ? (
                                <>
                                    <LeadsTable
                                        leads={leads}
                                        onView={handleView}
                                        onQualify={handleQualify}
                                        onDelete={handleDelete}
                                        pendingLeadId={pendingLeadAction?.leadId ?? null}
                                        pendingAction={pendingLeadAction?.action ?? null}
                                    />
                                    <LeadsPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={setPage}
                                        onPageSizeChange={(size: number): void => {
                                            setPageSize(size);
                                            setPage(1);
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900">No leads found</h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Try changing the search, status, or source filters.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <LeadDetailDrawer
                lead={selectedLead ?? null}
                isOpen={selectedLeadId !== null}
                isLoading={isSelectedLeadLoading}
                isQualifying={qualifyMutation.isPending}
                isConverting={convertMutation.isPending}
                onClose={(): void => setSelectedLeadId(null)}
                onQualify={handleQualify}
                onConvert={handleConvert}
            />
        </AdminLayout>
    );
}
