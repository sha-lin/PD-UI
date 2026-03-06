"use client";

import { useState, useRef, useEffect } from "react";
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
    Eye,
    Check,
    FileText,
    MoreHorizontal,
} from "lucide-react";

type FilterStatus = "all" | POStatus;

export default function VendorPurchaseOrdersPage(): ReactElement {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

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
            in_production: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Clock, label: "In Production" },
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
            {viewingPO && (
                <PODetailModal
                    po={viewingPO}
                    onClose={() => setViewingPO(null)}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                />
            )}
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

                {/* PO Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <th className="text-left px-4 py-3 font-medium">PO #</th>
                                <th className="text-left px-4 py-3 font-medium">Job</th>
                                <th className="text-left px-4 py-3 font-medium">Product</th>
                                <th className="text-right px-4 py-3 font-medium">Qty</th>
                                <th className="text-right px-4 py-3 font-medium">Total (KES)</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-left px-4 py-3 font-medium">Due</th>
                                <th className="text-right px-4 py-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingPOs && (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="border-b border-gray-100 animate-pulse">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-100 rounded" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}

                            {!isLoadingPOs && filteredPOs.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                                        <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        {searchQuery || filterStatus !== "all"
                                            ? "No purchase orders match your filters"
                                            : "No purchase orders yet."}
                                    </td>
                                </tr>
                            )}

                            {!isLoadingPOs && filteredPOs.map((po) => {
                                const statusBadge = getStatusBadge(po.status);
                                const StatusIcon = statusBadge.icon;
                                const overdue = isOverdue(po);

                                return (
                                    <tr
                                        key={po.id}
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${po.is_blocked ? "border-l-2 border-l-red-400" : overdue ? "border-l-2 border-l-orange-400" : ""}`}
                                    >
                                        {/* PO # */}
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-brand-blue">{po.po_number}</span>
                                            {po.is_blocked && (
                                                <div className="flex items-center gap-1 text-xs text-red-600 mt-0.5">
                                                    <XCircle className="w-3 h-3" />
                                                    Blocked
                                                </div>
                                            )}
                                        </td>

                                        {/* Job */}
                                        <td className="px-4 py-3 text-gray-700">{po.job_number}</td>

                                        {/* Product */}
                                        <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate" title={po.product_type}>
                                            {po.product_type}
                                        </td>

                                        {/* Qty */}
                                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                                            {po.quantity.toLocaleString()}
                                        </td>

                                        {/* Total */}
                                        <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
                                            {formatCurrency(po.total_cost)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusBadge.label}
                                            </span>
                                        </td>

                                        {/* Due */}
                                        <td className="px-4 py-3">
                                            <div className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(po.required_by)}
                                            </div>
                                            {po.days_until_due > 0 && po.status.toLowerCase() !== "completed" && (
                                                <p className="text-xs text-gray-400 mt-0.5">{po.days_until_due}d left</p>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right">
                                            <PORowActions
                                                po={po}
                                                onViewDetails={() => setViewingPO(po)}
                                                onAccept={() => {
                                                    toast(`Accept PO ${po.po_number}?`, {
                                                        action: { label: "Accept", onClick: () => acceptMutation.mutate(po.id) },
                                                    });
                                                }}
                                                onMilestone={(milestone) => {
                                                    toast(`Update milestone to "${milestone.replace(/_/g, " ")}"?`, {
                                                        action: { label: "Update", onClick: () => updateMilestoneMutation.mutate({ poId: po.id, payload: { milestone } }) },
                                                    });
                                                }}
                                                onAcknowledgeAssets={() => {
                                                    toast("Confirm you have received all job assets?", {
                                                        action: { label: "Confirm", onClick: () => acknowledgeMutation.mutate(po.id) },
                                                    });
                                                }}
                                                acceptPending={acceptMutation.isPending}
                                                acknowledgePending={acknowledgeMutation.isPending}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
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
    return <></>;
}

interface PODetailModalProps {
    po: PurchaseOrder;
    onClose: () => void;
    formatCurrency: (n: number) => string;
    formatDate: (s: string) => string;
    getStatusBadge: (s: string) => { color: string; icon: React.ElementType; label: string };
}

function PODetailModal({ po, onClose, formatCurrency, formatDate, getStatusBadge }: PODetailModalProps): ReactElement {
    const statusBadge = getStatusBadge(po.status);
    const StatusIcon = statusBadge.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
                    <div>
                        <h2 className="text-lg font-bold text-brand-black">{po.po_number}</h2>
                        <p className="text-sm text-gray-500">{po.product_type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                        </span>
                        <button onClick={onClose} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Blocked banner */}
                    {po.is_blocked && po.blocked_reason && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-900">This PO is blocked</p>
                                <p className="text-sm text-red-700 mt-1">{po.blocked_reason}</p>
                            </div>
                        </div>
                    )}

                    {/* Order Info */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Information</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Job Number</p>
                                <p className="font-medium text-gray-900">{po.job_number}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Quantity</p>
                                <p className="font-medium text-gray-900">{po.quantity.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Unit Cost</p>
                                <p className="font-medium text-gray-900">{formatCurrency(po.unit_cost)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Total Value</p>
                                <p className="font-bold text-brand-blue">{formatCurrency(po.total_cost)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Required By</p>
                                <p className="font-medium text-gray-900">{formatDate(po.required_by)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Created</p>
                                <p className="font-medium text-gray-900">{formatDate(po.created_at)}</p>
                            </div>
                            {po.completed_at && (
                                <div>
                                    <p className="text-gray-500">Completed</p>
                                    <p className="font-medium text-gray-900">{formatDate(po.completed_at)}</p>
                                </div>
                            )}
                            {po.vendor_accepted_at && (
                                <div>
                                    <p className="text-gray-500">Accepted On</p>
                                    <p className="font-medium text-gray-900">{formatDate(po.vendor_accepted_at)}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Product Description */}
                    {po.product_description && (
                        <section>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Product Description</h3>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">{po.product_description}</p>
                        </section>
                    )}

                    {/* Milestones & Flags */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Progress</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                {po.vendor_accepted
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    : <Clock className="w-4 h-4 text-gray-300" />}
                                <span className={po.vendor_accepted ? "text-gray-900" : "text-gray-400"}>PO Accepted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {po.assets_acknowledged
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    : <Clock className="w-4 h-4 text-gray-300" />}
                                <span className={po.assets_acknowledged ? "text-gray-900" : "text-gray-400"}>Assets Received</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {po.invoice_sent
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    : <Clock className="w-4 h-4 text-gray-300" />}
                                <span className={po.invoice_sent ? "text-gray-900" : "text-gray-400"}>Invoice Sent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {po.invoice_paid
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    : <Clock className="w-4 h-4 text-gray-300" />}
                                <span className={po.invoice_paid ? "text-gray-900" : "text-gray-400"}>Invoice Paid</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {po.ready_for_pickup
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    : <Clock className="w-4 h-4 text-gray-300" />}
                                <span className={po.ready_for_pickup ? "text-gray-900" : "text-gray-400"}>Ready for Pickup</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {po.completed_on_time
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    : <Clock className="w-4 h-4 text-gray-300" />}
                                <span className={po.completed_on_time ? "text-gray-900" : "text-gray-400"}>Completed On Time</span>
                            </div>
                        </div>
                    </section>

                    {/* Shipping */}
                    {(po.shipping_method || po.tracking_number) && (
                        <section>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shipping</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                {po.shipping_method && (
                                    <div>
                                        <p className="text-gray-500">Shipping Method</p>
                                        <p className="font-medium text-gray-900">{po.shipping_method}</p>
                                    </div>
                                )}
                                {po.tracking_number && (
                                    <div>
                                        <p className="text-gray-500">Tracking Number</p>
                                        <p className="font-medium text-gray-900">{po.tracking_number}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Notes */}
                    {po.vendor_notes && (
                        <section>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">{po.vendor_notes}</p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

interface PORowActionsProps {
    po: PurchaseOrder;
    onViewDetails: () => void;
    onAccept: () => void;
    onMilestone: (m: POMilestone) => void;
    onAcknowledgeAssets: () => void;
    acceptPending: boolean;
    acknowledgePending: boolean;
}

function PORowActions({
    po,
    onViewDetails,
    onAccept,
    onMilestone,
    onAcknowledgeAssets,
    acceptPending,
    acknowledgePending,
}: PORowActionsProps): ReactElement {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, right: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleOutside(e: MouseEvent) {
            if (
                menuRef.current && !menuRef.current.contains(e.target as Node) &&
                btnRef.current && !btnRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [open]);

    function handleOpen() {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen((v) => !v);
    }

    const showAccept = po.status.toLowerCase() === "new" && !po.vendor_accepted;
    const showMilestone = po.status.toLowerCase() === "in_production";
    const showAcknowledge = !po.assets_acknowledged;

    const milestoneOptions: { value: POMilestone; label: string }[] = [
        { value: "in_production", label: "In Production" },
        { value: "quality_check", label: "Quality Check" },
        { value: "completed", label: "Completed" },
    ];

    return (
        <>
            <button
                ref={btnRef}
                onClick={handleOpen}
                className="p-1.5 rounded text-gray-400 hover:text-brand-blue hover:bg-gray-100 transition-colors"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {open && (
                <div
                    ref={menuRef}
                    style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
                    className="w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
                >
                    <button
                        onClick={() => { setOpen(false); onViewDetails(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Eye className="w-4 h-4 text-gray-400" />
                        View Details
                    </button>

                    {showAccept && (
                        <>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                                onClick={() => { setOpen(false); onAccept(); }}
                                disabled={acceptPending}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-blue hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                Accept PO
                            </button>
                        </>
                    )}

                    {showMilestone && (
                        <>
                            <div className="border-t border-gray-100 my-1" />
                            <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Update Milestone</p>
                            {milestoneOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => { setOpen(false); onMilestone(opt.value); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {opt.label}
                                </button>
                            ))}
                        </>
                    )}

                    {showAcknowledge && (
                        <>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                                onClick={() => { setOpen(false); onAcknowledgeAssets(); }}
                                disabled={acknowledgePending}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                Mark Assets Received
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
