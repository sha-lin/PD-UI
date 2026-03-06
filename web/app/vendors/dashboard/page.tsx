"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ReactElement } from "react";
import VendorLayout from "@/components/vendor/vendor-layout";
import {
    fetchCurrentVendor,
    fetchVendorPerformanceScorecard,
    fetchVendorPOStats,
    fetchVendorInvoiceStats,
    fetchVendorProofStats,
    fetchVendorPurchaseOrders,
    fetchVendorInvoices,
    fetchVendorProofs,
    fetchVendorIssues,
} from "@/services/vendors";
import {
    Package,
    FileText,
    Image as ImageIcon,
    AlertCircle,
    TrendingUp,
    Award,
    Clock,
    CheckCircle2,
    DollarSign,
    Plus,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function VendorDashboardPage(): ReactElement {
    const [activeTab, setActiveTab] = useState<"pos" | "invoices" | "proofs">("pos");

    const { data: vendor, isLoading: isLoadingVendor } = useQuery({
        queryKey: ["current-vendor"],
        queryFn: fetchCurrentVendor,
        staleTime: 5 * 60 * 1000,
    });

    const { data: performance } = useQuery({
        queryKey: ["vendor-performance", vendor?.id],
        queryFn: () => fetchVendorPerformanceScorecard(vendor!.id),
        enabled: !!vendor?.id,
        staleTime: 5 * 60 * 1000,
    });

    const { data: poStats } = useQuery({
        queryKey: ["vendor-po-stats"],
        queryFn: fetchVendorPOStats,
        staleTime: 60 * 1000,
    });

    const { data: invoiceStats } = useQuery({
        queryKey: ["vendor-invoice-stats"],
        queryFn: fetchVendorInvoiceStats,
        staleTime: 60 * 1000,
    });

    const { data: proofStats } = useQuery({
        queryKey: ["vendor-proof-stats"],
        queryFn: fetchVendorProofStats,
        staleTime: 60 * 1000,
    });

    const { data: recentPOs } = useQuery({
        queryKey: ["vendor-purchase-orders"],
        queryFn: fetchVendorPurchaseOrders,
        staleTime: 30 * 1000,
    });

    const { data: recentInvoices } = useQuery({
        queryKey: ["vendor-invoices"],
        queryFn: fetchVendorInvoices,
        staleTime: 30 * 1000,
    });

    const { data: recentProofs } = useQuery({
        queryKey: ["vendor-proofs"],
        queryFn: fetchVendorProofs,
        staleTime: 30 * 1000,
    });

    const { data: issues } = useQuery({
        queryKey: ["vendor-issues"],
        queryFn: fetchVendorIssues,
        staleTime: 60 * 1000,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getVPSColor = (grade: string) => {
        if (!grade) return "bg-gray-100 text-gray-800";
        const letter = grade.charAt(0).toUpperCase();
        if (letter === "A") return "bg-green-100 text-green-800";
        if (letter === "B") return "bg-blue-100 text-blue-800";
        if (letter === "C") return "bg-yellow-100 text-yellow-800";
        return "bg-gray-100 text-gray-800";
    };

    return (
        <VendorLayout>
            <main className="p-8 space-y-6">
                {/* Welcome Header */}
                {isLoadingVendor ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-8 bg-gray-200 rounded w-64"></div>
                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                            </div>
                            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                ) : vendor && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-brand-black mb-2">
                                    Welcome back, {vendor.name}
                                </h1>
                                <p className="text-gray-600">
                                    {vendor.contact_person && `${vendor.contact_person} • `}
                                    {vendor.email}
                                </p>
                            </div>
                            {performance && (
                                <div className="text-center">
                                    <div
                                        className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getVPSColor(performance.vps_grade)} font-bold text-3xl`}
                                    >
                                        {performance.vps_grade}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">VPS Grade</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <QuickStatCard
                        label="Active Purchase Orders"
                        value={poStats?.active_pos || 0}
                        subtitle={poStats ? formatCurrency(poStats.total_value) : ""}
                        icon={Package}
                        color="blue"
                        href="/vendors/purchase-orders"
                    />
                    <QuickStatCard
                        label="Pending Payment"
                        value={invoiceStats ? formatCurrency(invoiceStats.total_pending_amount) : "0"}
                        subtitle={`${invoiceStats?.submitted_count || 0} invoices`}
                        icon={DollarSign}
                        color="yellow"
                        href="/vendors/invoices"
                    />
                    <QuickStatCard
                        label="Pending Proofs"
                        value={proofStats?.pending_review || 0}
                        subtitle={`${proofStats?.total_submitted || 0} total`}
                        icon={ImageIcon}
                        color="purple"
                        href="/vendors/proofs"
                    />
                    <QuickStatCard
                        label="Open Issues"
                        value={Array.isArray(issues) ? issues.filter(i => i.status === "open").length : 0}
                        subtitle={`${Array.isArray(issues) ? issues.length : 0} total`}
                        icon={AlertCircle}
                        color="orange"
                        href="/vendors/issues"
                    />
                </div>

                {/* Performance Overview */}
                {performance && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-brand-blue" />
                                Performance Metrics
                            </h2>
                            <div className="space-y-4">
                                <MetricBar
                                    label="On-Time Delivery"
                                    value={performance.on_time_rate}
                                    color="green"
                                />
                                <MetricBar
                                    label="Quality Score"
                                    value={performance.quality_score}
                                    color="blue"
                                />
                                <MetricBar
                                    label="Overall Score"
                                    value={performance.overall_score}
                                    color="purple"
                                />
                            </div>
                            <Link
                                href="/vendors/performance"
                                className="mt-4 inline-flex items-center gap-2 text-sm text-brand-blue hover:opacity-80"
                            >
                                View Full Report
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-brand-blue" />
                                Key Statistics
                            </h2>
                            <div className="space-y-3">
                                <StatRow
                                    label="Completed Jobs"
                                    value={poStats?.completed_pos || 0}
                                />
                                <StatRow
                                    label="Total Value"
                                    value={poStats ? formatCurrency(poStats.total_value) : "KES 0"}
                                />
                                <StatRow
                                    label="Defect Rate"
                                    value={`${performance.defect_rate}%`}
                                />
                                <StatRow
                                    label="Avg Turnaround"
                                    value={`${performance.avg_turnaround} days`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setActiveTab("pos")}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "pos"
                                        ? "border-brand-blue text-brand-blue"
                                        : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Recent Purchase Orders
                            </button>
                            <button
                                onClick={() => setActiveTab("invoices")}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "invoices"
                                        ? "border-brand-blue text-brand-blue"
                                        : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Recent Invoices
                            </button>
                            <button
                                onClick={() => setActiveTab("proofs")}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "proofs"
                                        ? "border-brand-blue text-brand-blue"
                                        : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Recent Proofs
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === "pos" && (
                            <RecentPOsList pos={Array.isArray(recentPOs) ? recentPOs.slice(0, 5) : []} />
                        )}
                        {activeTab === "invoices" && (
                            <RecentInvoicesList
                                invoices={Array.isArray(recentInvoices) ? recentInvoices.slice(0, 5) : []}
                            />
                        )}
                        {activeTab === "proofs" && (
                            <RecentProofsList proofs={Array.isArray(recentProofs) ? recentProofs.slice(0, 5) : []} />
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickActionCard
                        title="Submit Proof"
                        description="Upload proof for review"
                        icon={ImageIcon}
                        href="/vendors/proofs"
                        color="purple"
                    />
                    <QuickActionCard
                        title="Create Invoice"
                        description="Submit payment request"
                        icon={FileText}
                        href="/vendors/invoices"
                        color="blue"
                    />
                    <QuickActionCard
                        title="Report Issue"
                        description="Flag PO problems"
                        icon={AlertCircle}
                        href="/vendors/issues"
                        color="orange"
                    />
                </div>
            </main>
        </VendorLayout>
    );
}

interface QuickStatCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: "blue" | "yellow" | "purple" | "orange";
    href: string;
}

function QuickStatCard({ label, value, subtitle, icon: Icon, color, href }: QuickStatCardProps): ReactElement {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        yellow: "bg-yellow-50 text-yellow-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <Link href={href} className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </Link>
    );
}

interface MetricBarProps {
    label: string;
    value: number;
    color: "green" | "blue" | "purple";
}

function MetricBar({ label, value, color }: MetricBarProps): ReactElement {
    const colorClasses = {
        green: "bg-green-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
    };

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">{label}</span>
                <span className="text-gray-900 font-semibold">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${colorClasses[color]} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
}

interface StatRowProps {
    label: string;
    value: string | number;
}

function StatRow({ label, value }: StatRowProps): ReactElement {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-semibold text-gray-900">{value}</span>
        </div>
    );
}

function RecentPOsList({ pos }: { pos: any[] }): ReactElement {
    if (pos.length === 0) {
        return <p className="text-center text-gray-500 py-8">No recent purchase orders</p>;
    }

    return (
        <div className="space-y-3">
            {pos.map((po) => (
                <div key={po.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">{po.po_number}</p>
                        <p className="text-sm text-gray-600">{po.product_type}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">{po.status_display}</span>
                </div>
            ))}
            <Link
                href="/vendors/purchase-orders"
                className="block text-center text-sm text-brand-blue hover:opacity-80 pt-2"
            >
                View All Purchase Orders →
            </Link>
        </div>
    );
}

function RecentInvoicesList({ invoices }: { invoices: any[] }): ReactElement {
    if (invoices.length === 0) {
        return <p className="text-center text-gray-500 py-8">No recent invoices</p>;
    }

    return (
        <div className="space-y-3">
            {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-600">KES {invoice.total_amount.toLocaleString()}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                        {invoice.status}
                    </span>
                </div>
            ))}
            <Link href="/vendors/invoices" className="block text-center text-sm text-brand-blue hover:opacity-80 pt-2">
                View All Invoices →
            </Link>
        </div>
    );
}

function RecentProofsList({ proofs }: { proofs: any[] }): ReactElement {
    if (proofs.length === 0) {
        return <p className="text-center text-gray-500 py-8">No recent proofs</p>;
    }

    return (
        <div className="space-y-3">
            {proofs.map((proof) => (
                <div key={proof.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">{proof.purchase_order.po_number}</p>
                        <p className="text-sm text-gray-600">{proof.purchase_order.product_type}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                        {proof.status_display}
                    </span>
                </div>
            ))}
            <Link href="/vendors/proofs" className="block text-center text-sm text-brand-blue hover:opacity-80 pt-2">
                View All Proofs →
            </Link>
        </div>
    );
}

interface QuickActionCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: "purple" | "blue" | "orange";
}

function QuickActionCard({ title, description, icon: Icon, href, color }: QuickActionCardProps): ReactElement {
    const colorClasses = {
        purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
        blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
        orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    };

    return (
        <Link href={href} className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </Link>
    );
}
