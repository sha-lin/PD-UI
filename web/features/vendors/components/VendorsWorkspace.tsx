"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VendorsSummaryStrip from "@/features/vendors/components/VendorsSummaryStrip";
import VendorsFilters from "@/features/vendors/components/VendorsFilters";
import VendorsTable from "@/features/vendors/components/VendorsTable";
import VendorsPagination from "@/features/vendors/components/VendorsPagination";
import VendorsSkeleton from "@/features/vendors/components/VendorsSkeleton";
import VendorsEmptyState from "@/features/vendors/components/VendorsEmptyState";
import { deleteVendor, fetchVendors, inviteVendor } from "@/services/vendors";
import type { Vendor, VendorsQueryParams, VendorsResponse } from "@/types/vendors";

interface VendorsSummary {
    totalVisible: number;
    activeVisible: number;
    recommendedVisible: number;
    averageVps: number;
}

interface VendorsWorkspaceProps {
    breadcrumbHref: string;
    breadcrumbLabel: string;
    sectionLabel: string;
    title: string;
    description: string;
    addVendorHref: string;
    editVendorBaseHref: string;
}

export default function VendorsWorkspace({
    breadcrumbHref,
    breadcrumbLabel,
    sectionLabel,
    title,
    description,
    addVendorHref,
    editVendorBaseHref,
}: VendorsWorkspaceProps): ReactElement {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [active, setActive] = useState<"all" | "true" | "false">("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [inviteTarget, setInviteTarget] = useState<Vendor | null>(null);

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
        router.push(`${editVendorBaseHref}/${vendor.id}/edit`);
    };

    const handleDelete = (vendor: Vendor): void => {
        const confirmDelete = window.confirm(`Delete ${vendor.name}? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }
        deleteMutation.mutate(vendor.id);
    };

    const handleInvite = (vendor: Vendor): void => {
        setInviteTarget(vendor);
    };

    const handleInviteConfirm = (): void => {
        if (!inviteTarget) return;
        setNotice(null);
        inviteMutation.mutate(inviteTarget.id);
        setInviteTarget(null);
    };

    const handleInviteCancel = (): void => {
        setInviteTarget(null);
    };

    return (
        <>
            {inviteTarget ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-base font-semibold text-gray-900">
                                {inviteTarget.user ? "Resend portal invite" : "Send portal invite"}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {inviteTarget.user
                                    ? `A new invite link will be generated and sent to ${inviteTarget.email}.`
                                    : `An invite will be sent to ${inviteTarget.email} so they can set their password.`}
                            </p>
                        </div>
                        <div className="px-6 py-4">
                            <div className="rounded-md bg-gray-50 px-4 py-3">
                                <p className="text-sm font-semibold text-gray-800">{inviteTarget.name}</p>
                                <p className="text-xs text-gray-500">{inviteTarget.email}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleInviteCancel}
                                className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleInviteConfirm}
                                disabled={inviteMutation.isPending}
                                className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                            >
                                {inviteMutation.isPending ? "Sending…" : inviteTarget.user ? "Resend Invite" : "Send Invite"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                        <Link href={breadcrumbHref} className="hover:text-brand-blue">
                            {breadcrumbLabel}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">{sectionLabel}</span>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="mt-2 text-sm text-gray-600">{description}</p>
                        </div>
                        <Link
                            href={addVendorHref}
                            className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Vendor
                        </Link>
                    </div>
                </div>
            </header>

            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl space-y-6 px-8 py-6">
                    {isLoading ? <VendorsSkeleton /> : null}

                    {notice ? (
                        <div
                            className={`rounded-lg border p-4 ${notice.type === "success"
                                ? "border-brand-green/20 bg-brand-green/10 text-brand-green"
                                : "border-brand-red/20 bg-brand-red/10 text-brand-red"
                                }`}
                        >
                            <p className="text-sm font-semibold">{notice.message}</p>
                        </div>
                    ) : null}

                    {!isLoading && (error || !data) ? (
                        <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load vendors</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Unable to fetch vendor data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {!isLoading && data ? (
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
                    ) : null}
                </div>
            </main>
        </>
    );
}
