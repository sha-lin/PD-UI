"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import ClientDetailDrawer from "@/features/clients/components/ClientDetailDrawer";
import ClientFormDrawer from "@/features/clients/components/ClientFormDrawer";
import ClientsFilters from "@/features/clients/components/ClientsFilters";
import ClientsPagination from "@/features/clients/components/ClientsPagination";
import ClientsTable from "@/features/clients/components/ClientsTable";
import {
    createClient,
    deleteClient,
    fetchClient,
    fetchClientBrandAssets,
    fetchClientComplianceDocuments,
    fetchClientContacts,
    fetchClients,
    updateClient,
} from "@/services/clients";
import type {
    BrandAsset,
    Client,
    ClientContact,
    ClientFormPayload,
    ClientsQueryParams,
    ClientsResponse,
    ClientStatus,
    ClientType,
    ComplianceDocument,
} from "@/types/clients";

type PendingAction = "delete" | "edit";

interface PendingClientAction {
    clientId: number;
    action: PendingAction;
}

interface ClientsMutationContext {
    previousClientQueries: Array<[QueryKey, ClientsResponse | undefined]>;
    previousClientDetail: Client | undefined;
}

export default function ClientsPage(): ReactElement {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<"all" | ClientStatus>("all");
    const [clientType, setClientType] = useState<"all" | ClientType>("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [pendingClientAction, setPendingClientAction] = useState<PendingClientAction | null>(null);
    const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    useEffect((): (() => void) => {
        const timer = setTimeout((): void => {
            setDebouncedSearch(search);
        }, 400);

        return (): void => clearTimeout(timer);
    }, [search]);

    const clientQueryParams = useMemo(
        (): ClientsQueryParams => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
            clientType,
        }),
        [page, pageSize, debouncedSearch, status, clientType]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["clients", clientQueryParams],
        queryFn: (): Promise<ClientsResponse> => fetchClients(clientQueryParams),
    });

    const { data: selectedClient, isLoading: isSelectedClientLoading } = useQuery({
        queryKey: ["client", selectedClientId],
        queryFn: (): Promise<Client> => fetchClient(selectedClientId as number),
        enabled: selectedClientId !== null,
    });

    const { data: contacts, isLoading: isContactsLoading } = useQuery({
        queryKey: ["client-contacts", selectedClientId],
        queryFn: (): Promise<ClientContact[]> => fetchClientContacts(selectedClientId as number),
        enabled: selectedClientId !== null,
    });

    const { data: brandAssets, isLoading: isBrandAssetsLoading } = useQuery({
        queryKey: ["client-brand-assets", selectedClientId],
        queryFn: (): Promise<BrandAsset[]> => fetchClientBrandAssets(selectedClientId as number),
        enabled: selectedClientId !== null,
    });

    const { data: complianceDocuments, isLoading: isComplianceDocumentsLoading } = useQuery({
        queryKey: ["client-compliance-documents", selectedClientId],
        queryFn: (): Promise<ComplianceDocument[]> => fetchClientComplianceDocuments(selectedClientId as number),
        enabled: selectedClientId !== null,
    });

    const updateClientsInCache = (updater: (client: Client) => Client | null): void => {
        queryClient.setQueriesData<ClientsResponse>({ queryKey: ["clients"] }, (currentValue: ClientsResponse | undefined): ClientsResponse | undefined => {
            if (currentValue === undefined) {
                return currentValue;
            }

            const nextResults: Client[] = [];
            for (const clientRecord of currentValue.results) {
                const nextClient = updater(clientRecord);
                if (nextClient !== null) {
                    nextResults.push(nextClient);
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
        mutationFn: (clientId: number): Promise<void> => deleteClient(clientId),
        onMutate: async (clientId: number): Promise<ClientsMutationContext> => {
            setPendingClientAction({ clientId, action: "delete" });
            await queryClient.cancelQueries({ queryKey: ["clients"] });

            const previousClientQueries = queryClient.getQueriesData<ClientsResponse>({ queryKey: ["clients"] });
            const previousClientDetail = queryClient.getQueryData<Client>(["client", clientId]);

            updateClientsInCache((clientRecord: Client): Client | null => (clientRecord.id === clientId ? null : clientRecord));

            if (selectedClientId === clientId) {
                setSelectedClientId(null);
            }

            return {
                previousClientQueries,
                previousClientDetail,
            };
        },
        onSuccess: (): void => {
            toast.success("Client deleted.");
        },
        onError: (errorValue: unknown, clientId: number, context: ClientsMutationContext | undefined): void => {
            if (context !== undefined) {
                for (const [queryKey, previousValue] of context.previousClientQueries) {
                    queryClient.setQueryData(queryKey, previousValue);
                }
                queryClient.setQueryData(["client", clientId], context.previousClientDetail);
            }

            toast.error(extractMutationMessage(errorValue, "Unable to delete client."));
        },
        onSettled: (_data: void | undefined, _error: unknown, clientId: number): void => {
            setPendingClientAction(null);
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client", clientId] });
        },
    });

    const createMutation = useMutation({
        mutationFn: (payload: ClientFormPayload): Promise<Client> => createClient(payload),
        onSuccess: (): void => {
            toast.success("Client created.");
            setFormMode(null);
            setEditingClient(null);
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: (errorValue: unknown): void => {
            toast.error(extractMutationMessage(errorValue, "Unable to create client."));
        },
    });

    const updateMutation = useMutation({
        mutationFn: (values: { clientId: number; payload: ClientFormPayload }): Promise<Client> => updateClient(values.clientId, values.payload),
        onMutate: async (values: { clientId: number; payload: ClientFormPayload }): Promise<ClientsMutationContext> => {
            const { clientId, payload } = values;
            setPendingClientAction({ clientId, action: "edit" });
            await queryClient.cancelQueries({ queryKey: ["clients"] });

            const previousClientQueries = queryClient.getQueriesData<ClientsResponse>({ queryKey: ["clients"] });
            const previousClientDetail = queryClient.getQueryData<Client>(["client", clientId]);

            updateClientsInCache((clientRecord: Client): Client | null => {
                if (clientRecord.id !== clientId) {
                    return clientRecord;
                }

                return {
                    ...clientRecord,
                    ...payload,
                    company: payload.company ?? clientRecord.company,
                    email: payload.email ?? clientRecord.email,
                    address: payload.address ?? clientRecord.address,
                    industry: payload.industry ?? clientRecord.industry,
                    vat_tax_id: payload.vat_tax_id ?? clientRecord.vat_tax_id,
                    kra_pin: payload.kra_pin ?? clientRecord.kra_pin,
                    delivery_address: payload.delivery_address ?? clientRecord.delivery_address,
                    delivery_instructions: payload.delivery_instructions ?? clientRecord.delivery_instructions,
                    credit_limit: payload.credit_limit ?? clientRecord.credit_limit,
                    default_markup: payload.default_markup ?? clientRecord.default_markup,
                    is_reseller: payload.is_reseller ?? clientRecord.is_reseller,
                    risk_rating: payload.risk_rating ?? clientRecord.risk_rating,
                    payment_terms: payload.payment_terms ?? clientRecord.payment_terms,
                    preferred_channel: payload.preferred_channel ?? clientRecord.preferred_channel,
                    lead_source: payload.lead_source ?? clientRecord.lead_source,
                };
            });

            queryClient.setQueryData<Client | undefined>(["client", clientId], (currentValue: Client | undefined): Client | undefined => {
                if (currentValue === undefined) {
                    return currentValue;
                }

                return {
                    ...currentValue,
                    ...payload,
                    company: payload.company ?? currentValue.company,
                    email: payload.email ?? currentValue.email,
                    address: payload.address ?? currentValue.address,
                    industry: payload.industry ?? currentValue.industry,
                    vat_tax_id: payload.vat_tax_id ?? currentValue.vat_tax_id,
                    kra_pin: payload.kra_pin ?? currentValue.kra_pin,
                    delivery_address: payload.delivery_address ?? currentValue.delivery_address,
                    delivery_instructions: payload.delivery_instructions ?? currentValue.delivery_instructions,
                    credit_limit: payload.credit_limit ?? currentValue.credit_limit,
                    default_markup: payload.default_markup ?? currentValue.default_markup,
                    is_reseller: payload.is_reseller ?? currentValue.is_reseller,
                    risk_rating: payload.risk_rating ?? currentValue.risk_rating,
                    payment_terms: payload.payment_terms ?? currentValue.payment_terms,
                    preferred_channel: payload.preferred_channel ?? currentValue.preferred_channel,
                    lead_source: payload.lead_source ?? currentValue.lead_source,
                };
            });

            return {
                previousClientQueries,
                previousClientDetail,
            };
        },
        onSuccess: (): void => {
            toast.success("Client updated.");
            setFormMode(null);
            setEditingClient(null);
        },
        onError: (errorValue: unknown, values: { clientId: number; payload: ClientFormPayload }, context: ClientsMutationContext | undefined): void => {
            if (context !== undefined) {
                for (const [queryKey, previousValue] of context.previousClientQueries) {
                    queryClient.setQueryData(queryKey, previousValue);
                }
                queryClient.setQueryData(["client", values.clientId], context.previousClientDetail);
            }

            toast.error(extractMutationMessage(errorValue, "Unable to update client."));
        },
        onSettled: (_data: Client | undefined, _error: unknown, values: { clientId: number; payload: ClientFormPayload }): void => {
            setPendingClientAction(null);
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client", values.clientId] });
        },
    });

    const handleResetFilters = (): void => {
        setSearch("");
        setStatus("all");
        setClientType("all");
        setPage(1);
    };

    const handleDelete = (clientRecord: Client): void => {
        const shouldDelete = window.confirm(`Delete ${clientRecord.client_id}? This cannot be undone.`);
        if (!shouldDelete) {
            return;
        }

        deleteMutation.mutate(clientRecord.id);
    };

    const handleView = (clientRecord: Client): void => {
        setSelectedClientId(clientRecord.id);
    };

    const handleOpenCreate = (): void => {
        setEditingClient(null);
        setFormMode("create");
    };

    const handleOpenEdit = (clientRecord: Client): void => {
        setEditingClient(clientRecord);
        setFormMode("edit");
    };

    const handleSubmitClient = (payload: ClientFormPayload, clientId?: number): void => {
        if (formMode === "edit" && clientId !== undefined) {
            updateMutation.mutate({ clientId, payload });
            return;
        }

        createMutation.mutate(payload);
    };

    const clients = data?.results ?? [];
    const totalCount = data?.count ?? 0;
    const isRelationsLoading = isContactsLoading || isBrandAssetsLoading || isComplianceDocumentsLoading;

    return (
        <AdminLayout>
            <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <a href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">Clients</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage active client accounts, profile details, and account lifecycle state.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
                        >
                            Add Client
                        </button>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen pt-28">
                <div className="px-8 py-6 space-y-6">
                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load clients</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch client data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!error && (
                        <>
                            <ClientsFilters
                                search={search}
                                status={status}
                                clientType={clientType}
                                onSearchChange={(value: string): void => {
                                    setSearch(value);
                                    setPage(1);
                                }}
                                onStatusChange={(value: "all" | ClientStatus): void => {
                                    setStatus(value);
                                    setPage(1);
                                }}
                                onClientTypeChange={(value: "all" | ClientType): void => {
                                    setClientType(value);
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
                            ) : clients.length > 0 ? (
                                <>
                                    <ClientsTable
                                        clients={clients}
                                        onView={handleView}
                                        onEdit={handleOpenEdit}
                                        onDelete={handleDelete}
                                        pendingClientId={pendingClientAction?.clientId ?? null}
                                        pendingAction={pendingClientAction?.action ?? null}
                                    />
                                    <ClientsPagination
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
                                    <h3 className="text-lg font-semibold text-gray-900">No clients found</h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Try changing the search, status, or client type filters.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <ClientDetailDrawer
                client={selectedClient ?? null}
                contacts={contacts ?? []}
                brandAssets={brandAssets ?? []}
                complianceDocuments={complianceDocuments ?? []}
                isOpen={selectedClientId !== null}
                isLoading={isSelectedClientLoading}
                isLoadingRelations={isRelationsLoading}
                onClose={(): void => setSelectedClientId(null)}
                onEdit={(clientRecord: Client): void => {
                    setEditingClient(clientRecord);
                    setFormMode("edit");
                }}
            />

            <ClientFormDrawer
                isOpen={formMode !== null}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                mode={formMode ?? "create"}
                client={editingClient}
                onClose={(): void => {
                    setFormMode(null);
                    setEditingClient(null);
                }}
                onSubmit={handleSubmitClient}
            />
        </AdminLayout>
    );
}
