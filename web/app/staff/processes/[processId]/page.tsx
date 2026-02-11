"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, ArrowLeftIcon, PencilIcon, SettingsIcon, Trash2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import { deleteProcess, fetchProcessDetailBundle } from "@/services/processes";
import { Process, ProcessDetailBundle, ProcessTier, ProcessVariable, ProcessVendor } from "@/types/processes";
import ProcessStatusBadge from "@/features/processes/components/ProcessStatusBadge";

export default function ProcessDetailPage(): ReactElement {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const processIdParam =
        typeof params.processId === "string"
            ? params.processId
            : Array.isArray(params.processId)
                ? params.processId[0]
                : "";
    const processId = useMemo((): number => Number(processIdParam), [processIdParam]);
    const hasValidId = Number.isFinite(processId);

    const { data, isLoading, error } = useQuery({
        queryKey: ["process-detail", processId],
        queryFn: (): Promise<ProcessDetailBundle> => fetchProcessDetailBundle(processId),
        enabled: hasValidId,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number): Promise<void> => deleteProcess(id),
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ["processes"] });
            router.push("/staff/processes");
        },
    });

    const handleDelete = (process: Process): void => {
        const confirmDelete = window.confirm(`Delete ${process.process_name}? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }
        deleteMutation.mutate(process.id);
    };

    const formatDate = (value: string): string => {
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
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
                        <a href="/staff/processes" className="hover:text-brand-blue">
                            Processes
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">Details</span>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Process Details</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Review pricing setup, vendors, and variables
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={(): void => router.push("/staff/processes")}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Back
                            </button>
                            {data?.process && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(): void => router.push(`/staff/processes/${data.process.id}/edit`)}
                                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        Edit
                                    </button>
                                    {data.process.pricing_type === "formula" && (
                                        <button
                                            type="button"
                                            onClick={(): void => router.push(`/staff/processes/${data.process.id}/variable-ranges`)}
                                            className="inline-flex items-center gap-2 rounded-md border border-brand-green/30 px-4 py-2 text-sm font-semibold text-brand-green hover:text-brand-green/80"
                                        >
                                            <SettingsIcon className="h-4 w-4" />
                                            Manage Ranges
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(): void => handleDelete(data.process)}
                                        className="inline-flex items-center gap-2 rounded-md border border-brand-red/30 px-4 py-2 text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
                    {!hasValidId && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Invalid process ID</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        The requested process could not be found.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && hasValidId && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-200 rounded w-72 mt-3"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {[1, 2, 3, 4].map((item: number): ReactElement => (
                                    <div key={item} className="h-20 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isLoading && (error || !data) && hasValidId && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load process</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch process details. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{data.process.process_name}</h2>
                                        <p className="text-sm text-gray-500 mt-1">ID: {data.process.process_id}</p>
                                    </div>
                                    <ProcessStatusBadge status={data.process.status} />
                                </div>
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</div>
                                        <div className="text-sm text-gray-900 mt-1">
                                            {data.process.category === "outsourced" ? "Outsourced" : "In-house"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pricing Type</div>
                                        <div className="text-sm text-gray-900 mt-1">
                                            {data.process.pricing_type === "tier" ? "Tier-Based" : "Formula-Based"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lead Time</div>
                                        <div className="text-sm text-gray-900 mt-1">
                                            {data.process.standard_lead_time} days
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unit of Measure</div>
                                        <div className="text-sm text-gray-900 mt-1">
                                            {data.process.unit_of_measure || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Base Cost</div>
                                        <div className="text-sm text-gray-900 mt-1">KES {data.process.base_cost}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approval Threshold</div>
                                        <div className="text-sm text-gray-900 mt-1">{data.process.approval_margin_threshold}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</div>
                                        <div className="text-sm text-gray-900 mt-1">{formatDate(data.process.created_at)}</div>
                                    </div>
                                </div>
                                {data.process.description && (
                                    <div className="mt-6 border-t border-gray-200 pt-4">
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</div>
                                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                                            {data.process.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {data.process.pricing_type === "tier" ? (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900">Tier Pricing</h3>
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Tier</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Min Qty</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Max Qty</th>
                                                    <th className="px-4 py-2 text-right font-medium text-gray-700">Price (KES)</th>
                                                    <th className="px-4 py-2 text-right font-medium text-gray-700">Cost (KES)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {data.tiers.length > 0 ? (
                                                    data.tiers.map((tier: ProcessTier): ReactElement => (
                                                        <tr key={tier.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-gray-900">{tier.tier_number}</td>
                                                            <td className="px-4 py-3 text-gray-900">{tier.quantity_from}</td>
                                                            <td className="px-4 py-3 text-gray-900">{tier.quantity_to}</td>
                                                            <td className="px-4 py-3 text-right text-gray-900">{tier.price}</td>
                                                            <td className="px-4 py-3 text-right text-gray-900">{tier.cost}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                                            No tiers configured yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900">Formula Variables</h3>
                                    <div className="mt-4 space-y-3">
                                        {data.variables.length > 0 ? (
                                            data.variables.map((variable: ProcessVariable): ReactElement => (
                                                <div key={variable.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{variable.variable_name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {variable.variable_type === "number" ? "Numeric" : "Alphanumeric"}
                                                                {variable.unit ? ` · ${variable.unit}` : ""}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-700">
                                                            Price: KES {variable.price} · Rate: {variable.rate}
                                                        </div>
                                                    </div>
                                                    {variable.description && (
                                                        <p className="text-sm text-gray-600 mt-2">{variable.description}</p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500">No variables configured yet.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {data.process.category === "outsourced" && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900">Vendors</h3>
                                    <div className="mt-4 space-y-3">
                                        {data.vendors.length > 0 ? (
                                            data.vendors.map((vendor: ProcessVendor): ReactElement => (
                                                <div key={vendor.id} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border border-gray-200 rounded-lg p-4">
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{vendor.vendor_name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {vendor.vendor_id} · VPS: {vendor.vps_score}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-700 capitalize">{vendor.priority}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500">No vendors linked yet.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
