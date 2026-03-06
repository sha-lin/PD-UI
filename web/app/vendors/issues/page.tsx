"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactElement } from "react";
import VendorLayout from "@/components/vendor/vendor-layout";
import {
    fetchVendorIssues,
    fetchMaterialSubstitutions,
    fetchVendorActivePurchaseOrders,
    createVendorIssue,
    createMaterialSubstitution,
} from "@/services/vendors";
import type {
    VendorIssue,
    MaterialSubstitution,
    CreateIssuePayload,
    CreateSubstitutionPayload,
    IssueType,
    PurchaseOrderBasic,
} from "@/types/vendors";
import {
    AlertCircle,
    Plus,
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    Package,
} from "lucide-react";

type TabType = "issues" | "substitutions";

export default function VendorIssuesPage(): ReactElement {
    const [activeTab, setActiveTab] = useState<TabType>("issues");
    const [showIssueForm, setShowIssueForm] = useState(false);
    const [showSubstitutionForm, setShowSubstitutionForm] = useState(false);

    const queryClient = useQueryClient();

    const { data: issuesData, isLoading: isLoadingIssues } = useQuery({
        queryKey: ["vendor-issues"],
        queryFn: fetchVendorIssues,
        staleTime: 30 * 1000,
    });

    const { data: substitutionsData, isLoading: isLoadingSubstitutions } = useQuery({
        queryKey: ["material-substitutions"],
        queryFn: fetchMaterialSubstitutions,
        staleTime: 30 * 1000,
    });

    const { data: activePOsData } = useQuery({
        queryKey: ["vendor-active-pos"],
        queryFn: fetchVendorActivePurchaseOrders,
        staleTime: 5 * 60 * 1000,
    });

    const issues = Array.isArray(issuesData) ? issuesData : [];
    const substitutions = Array.isArray(substitutionsData) ? substitutionsData : [];
    const activePOs = Array.isArray(activePOsData) ? activePOsData : [];

    const createIssueMutation = useMutation({
        mutationFn: createVendorIssue,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-issues"] });
            setShowIssueForm(false);
        },
    });

    const createSubstitutionMutation = useMutation({
        mutationFn: createMaterialSubstitution,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["material-substitutions"] });
            setShowSubstitutionForm(false);
        },
    });

    const openIssuesCount = issues.filter((issue) => issue.status === "open").length;
    const pendingSubstitutionsCount = substitutions.filter(
        (sub) => sub.approval_status === "pending"
    ).length;

    const getStatusBadge = (status: string) => {
        const styles = {
            open: "bg-red-100 text-red-800 border-red-200",
            in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
            resolved: "bg-green-100 text-green-800 border-green-200",
            closed: "bg-gray-100 text-gray-800 border-gray-200",
        };
        return styles[status as keyof typeof styles] || styles.open;
    };

    const getApprovalBadge = (status: string) => {
        const config = {
            pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Pending" },
            approved: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2, label: "Approved" },
            rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Rejected" },
            customer_notified: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: AlertCircle, label: "Customer Notified" },
        };
        return config[status as keyof typeof config] || config.pending;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
        if (diffInHours < 48) return "Yesterday";
        return date.toLocaleDateString();
    };

    return (
        <VendorLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Issues & Requests</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Report issues and request material substitutions for your purchase orders
                    </p>
                </div>
            </header>

            <main className="p-8">
                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("issues")}
                            className={`px-6 py-4 font-medium transition-colors relative ${activeTab === "issues"
                                ? "text-brand-blue border-b-2 border-brand-blue"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span>Issues</span>
                                {openIssuesCount > 0 && (
                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {openIssuesCount}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("substitutions")}
                            className={`px-6 py-4 font-medium transition-colors relative ${activeTab === "substitutions"
                                ? "text-brand-blue border-b-2 border-brand-blue"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                <span>Material Substitutions</span>
                                {pendingSubstitutionsCount > 0 && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {pendingSubstitutionsCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === "issues" && (
                            <IssuesTab
                                issues={issues}
                                isLoading={isLoadingIssues}
                                showForm={showIssueForm}
                                setShowForm={setShowIssueForm}
                                activePOs={activePOs}
                                onSubmit={(data) => createIssueMutation.mutate(data)}
                                getStatusBadge={getStatusBadge}
                                formatDate={formatDate}
                            />
                        )}

                        {activeTab === "substitutions" && (
                            <SubstitutionsTab
                                substitutions={substitutions}
                                isLoading={isLoadingSubstitutions}
                                showForm={showSubstitutionForm}
                                setShowForm={setShowSubstitutionForm}
                                activePOs={activePOs}
                                onSubmit={(data) => createSubstitutionMutation.mutate(data)}
                                getApprovalBadge={getApprovalBadge}
                                formatDate={formatDate}
                            />
                        )}
                    </div>
                </div>
            </main>
        </VendorLayout>
    );
}

interface IssuesTabProps {
    issues: VendorIssue[];
    isLoading: boolean;
    showForm: boolean;
    setShowForm: (show: boolean) => void;
    activePOs: PurchaseOrderBasic[];
    onSubmit: (data: CreateIssuePayload) => void;
    getStatusBadge: (status: string) => string;
    formatDate: (date: string) => string;
}

function IssuesTab({
    issues,
    isLoading,
    showForm,
    setShowForm,
    activePOs,
    onSubmit,
    getStatusBadge,
    formatDate,
}: IssuesTabProps): ReactElement {
    const [formData, setFormData] = useState<CreateIssuePayload>({
        purchase_order_id: 0,
        issue_type: "other",
        description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ purchase_order_id: 0, issue_type: "other", description: "" });
    };

    return (
        <div className="space-y-6">
            {/* Create Issue Button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Report New Issue
                </button>
            )}

            {/* Create Issue Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="font-bold text-lg">Report New Issue</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purchase Order
                        </label>
                        <select
                            required
                            value={formData.purchase_order_id}
                            onChange={(e) => setFormData({ ...formData, purchase_order_id: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        >
                            <option value={0}>Select a purchase order</option>
                            {activePOs.map((po) => (
                                <option key={po.id} value={po.id}>
                                    {po.po_number} - {po.product_type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                        <select
                            required
                            value={formData.issue_type}
                            onChange={(e) => setFormData({ ...formData, issue_type: e.target.value as IssueType })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        >
                            <option value="quality">Quality Issue</option>
                            <option value="delivery">Delivery Delay</option>
                            <option value="technical">Technical Problem</option>
                            <option value="material">Material Issue</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Describe the issue in detail..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Submit Issue
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Issues List */}
            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                </div>
            )}

            {!isLoading && issues.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No issues reported yet</p>
                </div>
            )}

            {!isLoading && issues.length > 0 && (
                <div className="space-y-4">
                    {issues.map((issue) => (
                        <div
                            key={issue.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-semibold text-gray-900">
                                            {issue.purchase_order.po_number}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                                                issue.status
                                            )}`}
                                        >
                                            {issue.status.replace("_", " ").toUpperCase()}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                            {issue.issue_type.replace("_", " ").toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {issue.purchase_order.product_type}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-3">{issue.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>Reported {formatDate(issue.created_at)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

interface SubstitutionsTabProps {
    substitutions: MaterialSubstitution[];
    isLoading: boolean;
    showForm: boolean;
    setShowForm: (show: boolean) => void;
    activePOs: PurchaseOrderBasic[];
    onSubmit: (data: CreateSubstitutionPayload) => void;
    getApprovalBadge: (status: string) => { color: string; icon: React.ElementType; label: string };
    formatDate: (date: string) => string;
}

function SubstitutionsTab({
    substitutions,
    isLoading,
    showForm,
    setShowForm,
    activePOs,
    onSubmit,
    getApprovalBadge,
    formatDate,
}: SubstitutionsTabProps): ReactElement {
    const [formData, setFormData] = useState<CreateSubstitutionPayload>({
        purchase_order_id: 0,
        original_material: "",
        substitute_material: "",
        reason: "",
        original_cost: 0,
        substitute_cost: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            purchase_order_id: 0,
            original_material: "",
            substitute_material: "",
            reason: "",
            original_cost: 0,
            substitute_cost: 0,
        });
    };

    return (
        <div className="space-y-6">
            {/* Create Substitution Button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Request Material Substitution
                </button>
            )}

            {/* Create Substitution Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="font-bold text-lg">Request Material Substitution</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purchase Order
                        </label>
                        <select
                            required
                            value={formData.purchase_order_id}
                            onChange={(e) => setFormData({ ...formData, purchase_order_id: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        >
                            <option value={0}>Select a purchase order</option>
                            {activePOs.map((po) => (
                                <option key={po.id} value={po.id}>
                                    {po.po_number} - {po.product_type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Original Material
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.original_material}
                                onChange={(e) => setFormData({ ...formData, original_material: e.target.value })}
                                placeholder="e.g., Cotton White 200gsm"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Substitute Material
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.substitute_material}
                                onChange={(e) => setFormData({ ...formData, substitute_material: e.target.value })}
                                placeholder="e.g., Polyester Blend 200gsm"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Original Cost (KES)
                            </label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={formData.original_cost}
                                onChange={(e) => setFormData({ ...formData, original_cost: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Substitute Cost (KES)
                            </label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={formData.substitute_cost}
                                onChange={(e) => setFormData({ ...formData, substitute_cost: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Substitution</label>
                        <textarea
                            required
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            rows={4}
                            placeholder="Explain why this substitution is necessary..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Submit Request
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Substitutions List */}
            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                </div>
            )}

            {!isLoading && substitutions.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No substitution requests yet</p>
                </div>
            )}

            {!isLoading && substitutions.length > 0 && (
                <div className="space-y-4">
                    {substitutions.map((sub) => {
                        const badge = getApprovalBadge(sub.approval_status);
                        const BadgeIcon = badge.icon;
                        const costDiff = sub.substitute_cost - sub.original_cost;
                        const costImpact = sub.original_cost > 0
                            ? ((costDiff / sub.original_cost) * 100).toFixed(1)
                            : "0.0";

                        return (
                            <div
                                key={sub.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-gray-900">
                                                {sub.purchase_order.po_number}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${badge.color}`}
                                            >
                                                <BadgeIcon className="w-3 h-3" />
                                                {badge.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{sub.purchase_order.product_type}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Original Material</p>
                                            <p className="font-medium text-gray-900">{sub.original_material}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Substitute Material</p>
                                            <p className="font-medium text-gray-900">{sub.substitute_material}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Cost Impact:</span>
                                            <span
                                                className={`font-bold ${costDiff > 0
                                                    ? "text-red-600"
                                                    : costDiff < 0
                                                        ? "text-green-600"
                                                        : "text-gray-600"
                                                    }`}
                                            >
                                                {costDiff > 0 ? "+" : ""}KES {costDiff.toFixed(2)} ({costDiff > 0 ? "+" : ""}
                                                {costImpact}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                                    <p className="text-sm text-gray-600">{sub.reason}</p>
                                </div>

                                {sub.approval_notes && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                        <p className="text-sm font-medium text-blue-900 mb-1">Admin Notes:</p>
                                        <p className="text-sm text-blue-800">{sub.approval_notes}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>Requested {formatDate(sub.created_at)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
