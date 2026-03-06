"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactElement } from "react";
import VendorLayout from "@/components/vendor/vendor-layout";
import {
    fetchVendorProofs,
    fetchVendorProofStats,
    fetchVendorActivePurchaseOrders,
    createVendorProof,
    deleteVendorProof,
} from "@/services/vendors";
import type {
    VendorProof,
    ProofStats,
    CreateProofPayload,
    PurchaseOrderBasic,
    ProofStatus,
} from "@/types/vendors";
import {
    FileImage,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    AlertCircle,
    Calendar,
    Upload,
    Eye,
} from "lucide-react";
import Image from "next/image";

type FilterStatus = "all" | ProofStatus;

export default function VendorProofsPage(): ReactElement {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showUploadForm, setShowUploadForm] = useState(false);

    const queryClient = useQueryClient();

    const { data: proofsData, isLoading: isLoadingProofs } = useQuery({
        queryKey: ["vendor-proofs"],
        queryFn: fetchVendorProofs,
        staleTime: 30 * 1000,
    });

    const { data: stats } = useQuery({
        queryKey: ["vendor-proof-stats"],
        queryFn: fetchVendorProofStats,
        staleTime: 60 * 1000,
    });

    const { data: activePOsData } = useQuery({
        queryKey: ["vendor-active-pos"],
        queryFn: fetchVendorActivePurchaseOrders,
        staleTime: 5 * 60 * 1000,
    });

    const proofs = Array.isArray(proofsData) ? proofsData : [];
    const activePOs = Array.isArray(activePOsData) ? activePOsData : [];

    const createMutation = useMutation({
        mutationFn: createVendorProof,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-proofs"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-proof-stats"] });
            setShowUploadForm(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVendorProof,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-proofs"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-proof-stats"] });
        },
    });

    const filteredProofs = proofs.filter((proof) => {
        const matchesStatus = filterStatus === "all" || proof.status === filterStatus;
        const matchesSearch =
            proof.purchase_order.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proof.purchase_order.product_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proof.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: ProofStatus) => {
        const config = {
            pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Pending Review" },
            approved: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2, label: "Approved" },
            rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Rejected" },
        };
        return config[status];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <VendorLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Proofs & Samples</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Submit proofs for review and track approval status
                    </p>
                </div>
            </header>

            <main className="p-8">
                {/* Stats Cards */}
                {isLoadingProofs ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <StatsCardSkeleton key={i} />
                        ))}
                    </div>
                ) : stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <StatsCard
                            label="Total Submitted"
                            value={stats.total_submitted}
                            icon={FileImage}
                            color="blue"
                        />
                        <StatsCard
                            label="Pending Review"
                            value={stats.pending_review}
                            icon={Clock}
                            color="yellow"
                        />
                        <StatsCard
                            label="Approved"
                            value={stats.approved}
                            icon={CheckCircle2}
                            color="green"
                        />
                        <StatsCard
                            label="Rejected"
                            value={stats.rejected}
                            icon={XCircle}
                            color="red"
                        />
                    </div>
                )}

                {/* Actions and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <button
                            onClick={() => setShowUploadForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-5 h-5" />
                            Upload New Proof
                        </button>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search proofs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent w-full md:w-64"
                                />
                            </div>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Upload Form */}
                {showUploadForm && (
                    <ProofUploadForm
                        activePOs={activePOs}
                        onSubmit={(data) => createMutation.mutate(data)}
                        onCancel={() => setShowUploadForm(false)}
                        isSubmitting={createMutation.isPending}
                    />
                )}

                {/* Proofs List */}
                {isLoadingProofs && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <ProofCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {!isLoadingProofs && filteredProofs.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                            {searchQuery || filterStatus !== "all"
                                ? "No proofs match your filters"
                                : "No proofs yet. Upload your first proof to get started."}
                        </p>
                    </div>
                )}

                {!isLoadingProofs && filteredProofs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProofs.map((proof) => {
                            const statusBadge = getStatusBadge(proof.status);
                            const StatusIcon = statusBadge.icon;

                            return (
                                <div
                                    key={proof.id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {/* Image Preview */}
                                    <div className="relative h-48 bg-gray-100">
                                        <Image
                                            src={proof.proof_image}
                                            alt={`Proof for ${proof.purchase_order.po_number}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusBadge.color}`}
                                            >
                                                <StatusIcon className="w-3 h-3" />
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                                            {proof.purchase_order.po_number}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {proof.purchase_order.product_type}
                                        </p>

                                        {proof.description && (
                                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                                {proof.description}
                                            </p>
                                        )}

                                        {/* Rejection Reason */}
                                        {proof.status === "rejected" && proof.rejection_reason && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-medium text-red-900 mb-1">
                                                            Rejection Reason:
                                                        </p>
                                                        <p className="text-xs text-red-700">
                                                            {proof.rejection_reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <Calendar className="w-3 h-3" />
                                            <span>Submitted {formatDate(proof.submitted_at)}</span>
                                        </div>

                                        {proof.reviewed_at && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>
                                                    {proof.status === "approved" ? "Approved" : "Reviewed"}{" "}
                                                    {formatDate(proof.reviewed_at)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            <a
                                                href={proof.proof_image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Full
                                            </a>
                                            {proof.status === "pending" && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Delete this proof?")) {
                                                            deleteMutation.mutate(proof.id);
                                                        }
                                                    }}
                                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
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
    icon: React.ElementType;
    color: "blue" | "yellow" | "green" | "red";
}

function StatsCard({ label, value, icon: Icon, color }: StatsCardProps): ReactElement {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        yellow: "bg-yellow-100 text-yellow-600",
        green: "bg-green-100 text-green-600",
        red: "bg-red-100 text-red-600",
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

interface ProofUploadFormProps {
    activePOs: PurchaseOrderBasic[];
    onSubmit: (data: CreateProofPayload) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

function ProofUploadForm({ activePOs, onSubmit, onCancel, isSubmitting }: ProofUploadFormProps): ReactElement {
    const [selectedPO, setSelectedPO] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !selectedPO) return;

        onSubmit({
            purchase_order_id: selectedPO,
            proof_image: selectedFile,
            description,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upload New Proof</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purchase Order *
                        </label>
                        <select
                            required
                            value={selectedPO}
                            onChange={(e) => setSelectedPO(Number(e.target.value))}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description / Notes
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add any notes or context about this proof..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                {/* Right Column - File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-blue transition-colors">
                        {previewUrl ? (
                            <div className="space-y-3">
                                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Remove image
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    required
                                />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting || !selectedFile || !selectedPO}
                    className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Uploading..." : "Submit for Review"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

function StatsCardSkeleton(): ReactElement {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
    );
}

function ProofCardSkeleton(): ReactElement {
    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
}
