"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { toast } from "sonner";
import VendorLayout from "@/components/vendor/vendor-layout";
import {
    fetchVendorPurchaseOrders,
    fetchVendorPOStats,
    acceptPurchaseOrder,
    updatePOMilestone,
    acknowledgePOAssets,
} from "@/services/vendors";
import type {
    PurchaseOrder,
    POStats,
    POStatus,
    POMilestone,
    UpdateMilestonePayload,
} from "@/types/vendors";
import {
    Package,
    Search,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    Eye,
    Check,
    FileText,
} from "lucide-react";

type FilterStatus = "all" | POStatus;

export default function VendorPurchaseOrdersPage(): ReactElement {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const queryClient = useQueryClient();

    const { data: posData, isLoading: isLoadingPOs } = useQuery({
        queryKey: ["vendor-purchase-orders"],
        queryFn: fetchVendorPurchaseOrders,
        staleTime: 30 * 1000,
    });

    const { data: stats } = useQuery({
        queryKey: ["vendor-po-stats"],
        queryFn: fetchVendorPOStats,
        staleTime: 60 * 1000,
    });

    const purchaseOrders = Array.isArray(posData) ? posData : [];

    const acceptMutation = useMutation({
        mutationFn: acceptPurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-purchase-orders"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-po-stats"] });
            toast.success("Purchase order accepted");
        },
        onError: () => toast.error("Failed to accept purchase order. Please try again."),
    });

    const updateMilestoneMutation = useMutation({
        mutationFn: ({ poId, payload }: { poId: number; payload: UpdateMilestonePayload }) =>
            updatePOMilestone(poId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-purchase-orders"] });
            toast.success("Milestone updated");
        },
        onError: () => toast.error("Failed to update milestone. Please try again."),
    });

    const acknowledgeMutation = useMutation({
        mutationFn: acknowledgePOAssets,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-purchase-orders"] });
            toast.success("Assets acknowledged");
        },
        onError: () => toast.error("Failed to acknowledge assets. Please try again."),
    });

    const filteredPOs = purchaseOrders.filter((po) => {
        const matchesStatus = filterStatus === "all" || po.status.toLowerCase() === filterStatus.toLowerCase();
        const matchesSearch =
            po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.product_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.job_number.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
            new: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: FileText, label: "New" },
            accepted: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2, label: "Accepted" },
            in_production: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: TrendingUp, label: "In Production" },
            awaiting_approval: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Awaiting Approval" },
            blocked: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Blocked" },
            at_risk: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertTriangle, label: "At Risk" },
            completed: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: CheckCircle2, label: "Completed" },
            cancelled: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle, label: "Cancelled" },
        };
        return config[status.toLowerCase()] ?? { color: "bg-gray-100 text-gray-700 border-gray-200", icon: FileText, label: status };
    };

    const getMilestoneBadge = (milestone: POMilestone) => {
        const config: Record<POMilestone, { color: string; label: string }> = {
            awaiting_acceptance: { color: "bg-blue-50 text-blue-700", label: "Awaiting Acceptance" },
            in_production: { color: "bg-purple-50 text-purple-700", label: "In Production" },
            quality_check: { color: "bg-yellow-50 text-yellow-700", label: "Quality Check" },
            completed: { color: "bg-green-50 text-green-700", label: "Completed" },
        };
        return config[milestone];
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const isOverdue = (po: PurchaseOrder) => {
        const s = po.status.toLowerCase();
        if (s === "completed" || s === "cancelled") return false;
        return new Date(po.required_by) < new Date();
    };

    return (
        <VendorLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Purchase Orders</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your assigned purchase orders and track progress
                    </p>
                </div>
            </header>

            <main className="p-8">
                {/* Stats Cards */}
                {isLoadingPOs ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <StatsCardSkeleton key={i} />
                        ))}
                    </div>
                ) : stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatsCard
                            label="Total POs"
                            value={stats.total_pos}
                            color="blue"
                        />
                        <StatsCard
                            label="Active"
                            value={stats.active_pos}
                            color="purple"
                        />
                        <StatsCard
                            label="Completed"
                            value={stats.completed_pos}
                            color="green"
                        />
                        <StatsCard
                            label="At Risk"
                            value={stats.at_risk_pos}
                            color="orange"
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by PO#, Product, Job#..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent w-full"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="NEW">New</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="IN_PRODUCTION">In Production</option>
                            <option value="AWAITING_APPROVAL">Awaiting Approval</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>

                {/* PO List */}
                {isLoadingPOs && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <POCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {!isLoadingPOs && filteredPOs.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                            {searchQuery || filterStatus !== "all"
                                ? "No purchase orders match your filters"
                                : "No purchase orders yet."}
                        </p>
                    </div>
                )}

                {!isLoadingPOs && filteredPOs.length > 0 && (
                    <div className="space-y-4">
                        {filteredPOs.map((po) => {
                            const statusBadge = getStatusBadge(po.status);
                            const StatusIcon = statusBadge.icon;
                            const milestoneBadge = getMilestoneBadge(po.milestone);
                            const overdue = isOverdue(po);

                            return (
                                <div
                                    key={po.id}
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg text-gray-900">
                                                    {po.po_number}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusBadge.color}`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusBadge.label}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs ${milestoneBadge.color}`}>
                                                    {milestoneBadge.label}
                                                </span>
                                                {overdue && (
                                                    <span className="px-2 py-1 rounded text-xs bg-red-50 text-red-700 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Job:</span> {po.job_number} • <span className="font-medium">Product:</span> {po.product_type}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Quantity: {po.quantity} • Total: {formatCurrency(po.total_cost)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500 flex items-center gap-1 justify-end mb-1">
                                                <Calendar className="w-3 h-3" />
                                                Due: {formatDate(po.required_by)}
                                            </div>
                                            {po.days_until_due > 0 && po.status.toLowerCase() !== "completed" && (
                                                <p className="text-xs text-gray-500">
                                                    {po.days_until_due} days remaining
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Blocked Reason */}
                                    {po.is_blocked && po.blocked_reason && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-start gap-2">
                                                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-900">Blocked</p>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        {po.blocked_reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Description */}
                                    {po.product_description && (
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-gray-700">{po.product_description}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                        <div className="flex-1 flex items-center gap-4 text-xs text-gray-500">
                                            {!po.assets_acknowledged && (
                                                <span className="flex items-center gap-1 text-orange-600">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Assets not acknowledged
                                                </span>
                                            )}
                                            {po.vendor_accepted && (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Accepted {po.vendor_accepted_at && `on ${formatDate(po.vendor_accepted_at)}`}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {po.status.toLowerCase() === "new" && !po.vendor_accepted && (
                                                <button
                                                    onClick={() => {
                                                        const poId = po.id;
                                                        const poNum = po.po_number;
                                                        toast(`Accept PO ${poNum}?`, {
                                                            action: {
                                                                label: "Accept",
                                                                onClick: () => acceptMutation.mutate(poId),
                                                            },
                                                        });
                                                    }}
                                                    disabled={acceptMutation.isPending}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-brand-blue rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Accept PO
                                                </button>
                                            )}
                                            {po.status.toLowerCase() === "in_production" && (
                                                <select
                                                    onChange={(e) => {
                                                        const milestone = e.target.value as POMilestone;
                                                        const poId = po.id;
                                                        if (milestone) {
                                                            toast(`Update milestone to "${milestone.replace(/_/g, " ")}"?`, {
                                                                action: {
                                                                    label: "Update",
                                                                    onClick: () => updateMilestoneMutation.mutate({ poId, payload: { milestone } }),
                                                                },
                                                            });
                                                        }
                                                        e.target.value = "";
                                                    }}
                                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                                >
                                                    <option value="">Update Milestone</option>
                                                    <option value="in_production">In Production</option>
                                                    <option value="quality_check">Quality Check</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            )}
                                            {!po.assets_acknowledged && (
                                                <button
                                                    onClick={() => {
                                                        const poId = po.id;
                                                        toast("Confirm assets received?", {
                                                            action: {
                                                                label: "Confirm",
                                                                onClick: () => acknowledgeMutation.mutate(poId),
                                                            },
                                                        });
                                                    }}
                                                    disabled={acknowledgeMutation.isPending}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Acknowledge Assets
                                                </button>
                                            )}
                                            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </VendorLayout>
    );
}

interface StatsCardProps {
    label: string;
    value: number;
    color: "blue" | "purple" | "green" | "orange";
}

function StatsCard({ label, value, color }: StatsCardProps): ReactElement {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function StatsCardSkeleton(): ReactElement {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
    );
}

function POCardSkeleton(): ReactElement {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                        <div className="h-6 bg-gray-200 rounded w-28"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="text-right space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="flex gap-2 ml-auto">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
}
