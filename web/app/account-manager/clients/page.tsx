"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";
import ClientsStatsCards from "@/features/clients/components/ClientsStatsCards";
import ClientsTable from "@/features/clients/components/ClientsTable";
import ClientFormDrawer from "@/features/clients/components/ClientFormDrawer";
import type { Client, ClientStatus, ClientType, ClientFormPayload } from "@/types/clients";
import { fetchClients, fetchClientStats, deleteClient, createClient, updateClient } from "@/services/clients";

export default function ClientListPage() {
    const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
    const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pendingClientId, setPendingClientId] = useState<number | null>(null);
    const [pendingAction, setPendingAction] = useState<"delete" | "edit" | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const queryClient = useQueryClient();

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["client-stats"],
        queryFn: fetchClientStats,
    });

    const { data: clientsData, isLoading: clientsLoading } = useQuery({
        queryKey: ["clients", currentPage, 20, searchQuery, statusFilter, typeFilter],
        queryFn: () =>
            fetchClients({
                page: currentPage,
                pageSize: 20,
                search: searchQuery,
                status: statusFilter,
                clientType: typeFilter,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteClient,
        onMutate: (clientId) => {
            setPendingClientId(clientId);
            setPendingAction("delete");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client-stats"] });
            setPendingClientId(null);
            setPendingAction(null);
            toast.success("Client deleted successfully");
        },
        onError: () => {
            setPendingClientId(null);
            setPendingAction(null);
            toast.error("Failed to delete client. Please try again.");
        },
    });

    const createMutation = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client-stats"] });
            setIsDrawerOpen(false);
            setSelectedClient(null);
            toast.success("Client created successfully");
        },
        onError: () => {
            toast.error("Failed to create client. Please try again.");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ clientId, payload }: { clientId: number; payload: ClientFormPayload }) =>
            updateClient(clientId, payload),
        onMutate: ({ clientId }) => {
            setPendingClientId(clientId);
            setPendingAction("edit");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client-stats"] });
            setIsDrawerOpen(false);
            setSelectedClient(null);
            setPendingClientId(null);
            setPendingAction(null);
            toast.success("Client updated successfully");
        },
        onError: () => {
            setPendingClientId(null);
            setPendingAction(null);
            toast.error("Failed to update client. Please try again.");
        },
    });

    const clients = clientsData?.results || [];
    const totalCount = clientsData?.count || 0;

    const handleView = (client: Client) => {
        console.log("View client:", client.id);
    };

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setDrawerMode("edit");
        setIsDrawerOpen(true);
    };

    const handleDelete = async (client: Client) => {
        if (confirm(`Are you sure you want to delete ${client.name}?`)) {
            try {
                await deleteMutation.mutateAsync(client.id);
            } catch (error) {
                console.error("Failed to delete client:", error);
            }
        }
    };

    const handleAddClient = () => {
        setSelectedClient(null);
        setDrawerMode("create");
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setSelectedClient(null);
    };

    const handleDrawerSubmit = async (payload: ClientFormPayload, clientId?: number) => {
        try {
            if (drawerMode === "edit" && clientId !== undefined) {
                await updateMutation.mutateAsync({ clientId, payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
        } catch (error) {
            console.error("Failed to submit client:", error);
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    return (
        <AccountManagerLayout>
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                                Clients
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage your entire client portfolio
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddClient}
                            className="px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Client
                        </button>
                    </div>

                    {statsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse"
                                >
                                    <div className="h-10 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : stats ? (
                        <div className="mb-6">
                            <ClientsStatsCards stats={stats} />
                        </div>
                    ) : null}

                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, company, email, or ID..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as ClientType | "all");
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm bg-white"
                            >
                                <option value="all">All Types</option>
                                <option value="B2B">B2B Only</option>
                                <option value="B2C">B2C Only</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as ClientStatus | "all");
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Dormant">Dormant</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </form>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Showing {clients.length} of {totalCount} client{totalCount !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {clientsLoading ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <p className="text-gray-500">No clients found</p>
                        </div>
                    ) : (
                        <ClientsTable
                            clients={clients}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            pendingClientId={pendingClientId}
                            pendingAction={pendingAction}
                        />
                    )}

                    {totalCount > 20 && (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {Math.ceil(totalCount / 20)}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => p + 1)}
                                disabled={currentPage >= Math.ceil(totalCount / 20)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ClientFormDrawer
                isOpen={isDrawerOpen}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                mode={drawerMode}
                client={selectedClient}
                onClose={handleDrawerClose}
                onSubmit={handleDrawerSubmit}
            />
        </AccountManagerLayout>
    );
}
