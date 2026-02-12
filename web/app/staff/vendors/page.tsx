"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import { deleteVendor, fetchVendors, inviteVendor } from "@/services/vendors";
import { Vendor, VendorsQueryParams, VendorsResponse } from "@/types/vendors";
import VendorsSummaryStrip from "@/features/vendors/components/VendorsSummaryStrip";
import VendorsFilters from "@/features/vendors/components/VendorsFilters";
import VendorsTable from "@/features/vendors/components/VendorsTable";
import VendorsPagination from "@/features/vendors/components/VendorsPagination";
import VendorsSkeleton from "@/features/vendors/components/VendorsSkeleton";
import VendorsEmptyState from "@/features/vendors/components/VendorsEmptyState";

interface VendorsSummary {
    totalVisible: number;
    activeVisible: number;
    recommendedVisible: number;
    averageVps: number;
}

export default function VendorsPage(): ReactElement {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [active, setActive] = useState<"all" | "true" | "false">("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect((): (() => void) => {
        const handleDebounce = (): void => {
            setDebouncedSearch(search);
        };

        const timer = setTimeout(handleDebounce, 3000);

        return (): void => clearTimeout(timer);
    }, [search]);

    const queryParams = useMemo(
        (): VendorsQueryParams => ({
            page,
            pageSize,
            search: debouncedSearch,
            active,
        }),
        [page, pageSize, debouncedSearch, active]
    );

    const fetchVendorsQuery = (): Promise<VendorsResponse> => {
        return fetchVendors(queryParams);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["vendors", queryParams],
        queryFn: fetchVendorsQuery,
    });

    const deleteMutation = useMutation({
        mutationFn: (vendorId: number): Promise<void> => deleteVendor(vendorId),
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ["vendors"] });
        },
    });

    const inviteMutation = useMutation({
        mutationFn: (vendorId: number): Promise<void> => inviteVendor(vendorId),
        onSuccess: (): void => {
            setNotice({ type: "success", message: "Invite sent successfully." });
            queryClient.invalidateQueries({ queryKey: ["vendors"] });
        },
        onError: (): void => {
            setNotice({ type: "error", message: "Unable to send the invite. Please try again." });
        },
    });

    const vendors = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    const summary: VendorsSummary = vendors.reduce(
        (accumulator: VendorsSummary, vendor: Vendor): VendorsSummary => {
            const vpsValue = Number(vendor.vps_score_value);
            const nextVpsSum = accumulator.averageVps + (Number.isFinite(vpsValue) ? vpsValue : 0);
            return {
                totalVisible: accumulator.totalVisible + 1,
                activeVisible: accumulator.activeVisible + (vendor.active ? 1 : 0),
                recommendedVisible: accumulator.recommendedVisible + (vendor.recommended ? 1 : 0),
                averageVps: nextVpsSum,
            };
        },
        {
            totalVisible: 0,
            activeVisible: 0,
            recommendedVisible: 0,
            averageVps: 0,
        }
    );

    const averageVps = summary.totalVisible > 0 ? summary.averageVps / summary.totalVisible : 0;
    const summaryWithAverage: VendorsSummary = {
        ...summary,
        averageVps,
    };

    const handleSearchChange = (value: string): void => {
        setSearch(value);
        setPage(1);
    };

    const handleActiveChange = (value: "all" | "true" | "false"): void => {
        setActive(value);
        setPage(1);
    };

    const handleResetFilters = (): void => {
        setSearch("");
        setActive("all");
        setPage(1);
    };

    const handlePageChange = (nextPage: number): void => {
        setPage(nextPage);
    };

    const handlePageSizeChange = (size: number): void => {
        setPageSize(size);
        setPage(1);
    };

    const handleEdit = (vendor: Vendor): void => {
        router.push(`/staff/vendors/${vendor.id}/edit`);
    };

    const handleDelete = (vendor: Vendor): void => {
        const confirmDelete = window.confirm(`Delete ${vendor.name}? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }
        deleteMutation.mutate(vendor.id);
    };

    const handleInvite = (vendor: Vendor): void => {
        const actionLabel = vendor.user ? "Resend" : "Invite";
        const confirmInvite = window.confirm(`${actionLabel} access for ${vendor.name}?`);
        if (!confirmInvite) {
            return;
        }
        setNotice(null);
        inviteMutation.mutate(vendor.id);
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
                        <span className="text-gray-900">Vendors</span>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage suppliers, pricing capacity, and performance
                            </p>
                        </div>
                        <a
                            href="/staff/vendors/new"
                            className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Vendor
                        </a>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                    {isLoading && <VendorsSkeleton />}

                    {notice && (
                        <div
                            className={`rounded-lg border p-4 ${notice.type === "success"
                                    ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                                    : "bg-brand-red/10 border-brand-red/20 text-brand-red"
                                }`}
                        >
                            <p className="text-sm font-semibold">{notice.message}</p>
                        </div>
                    )}

                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load vendors</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch vendor data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <VendorsSummaryStrip summary={summaryWithAverage} />

                            <VendorsFilters
                                search={search}
                                active={active}
                                onSearchChange={handleSearchChange}
                                onActiveChange={handleActiveChange}
                                onReset={handleResetFilters}
                            />

                            {vendors.length > 0 ? (
                                <>
                                    <VendorsTable
                                        vendors={vendors}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onInvite={handleInvite}
                                    />
                                    <VendorsPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </>
                            ) : (
                                <VendorsEmptyState
                                    title="No vendors found"
                                    description="Try adjusting your filters or add a new vendor."
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
