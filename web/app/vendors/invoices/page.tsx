"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactElement } from "react";
import VendorLayout from "@/components/vendor/vendor-layout";
import {
    fetchVendorInvoices,
    fetchVendorInvoiceStats,
    fetchVendorActivePurchaseOrders,
    createVendorInvoice,
    updateVendorInvoice,
    submitVendorInvoice,
    deleteVendorInvoice,
} from "@/services/vendors";
import type {
    VendorInvoice,
    InvoiceStats,
    CreateInvoicePayload,
    InvoiceStatus,
    InvoiceLineItem,
    PurchaseOrderBasic,
} from "@/types/vendors";
import {
    FileText,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    DollarSign,
    AlertCircle,
    Calendar,
    Edit,
    Send,
    Trash2,
    Eye,
} from "lucide-react";

type FilterStatus = "all" | InvoiceStatus;

export default function VendorInvoicesPage(): ReactElement {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<VendorInvoice | null>(null);

    const queryClient = useQueryClient();

    const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
        queryKey: ["vendor-invoices"],
        queryFn: fetchVendorInvoices,
        staleTime: 30 * 1000,
    });

    const { data: stats } = useQuery({
        queryKey: ["vendor-invoice-stats"],
        queryFn: fetchVendorInvoiceStats,
        staleTime: 60 * 1000,
    });

    const { data: activePOsData } = useQuery({
        queryKey: ["vendor-active-pos"],
        queryFn: fetchVendorActivePurchaseOrders,
        staleTime: 5 * 60 * 1000,
    });

    const invoices = Array.isArray(invoicesData) ? invoicesData : [];
    const activePOs = Array.isArray(activePOsData) ? activePOsData : [];

    const createMutation = useMutation({
        mutationFn: createVendorInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-invoices"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-invoice-stats"] });
            setShowCreateForm(false);
        },
    });

    const submitMutation = useMutation({
        mutationFn: submitVendorInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-invoices"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-invoice-stats"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVendorInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-invoices"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-invoice-stats"] });
        },
    });

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
        const matchesSearch =
            invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.vendor_invoice_ref.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: InvoiceStatus) => {
        const config = {
            draft: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Edit, label: "Draft" },
            submitted: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Submitted" },
            approved: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2, label: "Approved" },
            paid: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: DollarSign, label: "Paid" },
            rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Rejected" },
        };
        return config[status];
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

    return (
        <VendorLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Invoices</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Submit payment requests for completed work
                    </p>
                </div>
            </header>

            <main className="p-8">
                {/* Stats Cards */}
                {isLoadingInvoices ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <StatsCardSkeleton key={i} />
                        ))}
                    </div>
                ) : stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                        <StatsCard
                            label="Draft"
                            value={stats.draft_count}
                            icon={Edit}
                            color="gray"
                        />
                        <StatsCard
                            label="Pending Payment"
                            value={formatCurrency(stats.total_pending_amount)}
                            subtitle={`${stats.submitted_count + stats.approved_count} invoices`}
                            icon={Clock}
                            color="yellow"
                        />
                        <StatsCard
                            label="Paid This Month"
                            value={formatCurrency(stats.current_month_amount)}
                            icon={DollarSign}
                            color="green"
                        />
                        <StatsCard
                            label="Total Paid"
                            value={formatCurrency(stats.total_paid_amount)}
                            subtitle={`${stats.paid_count} invoices`}
                            icon={CheckCircle2}
                            color="blue"
                        />
                    </div>
                )}

                {/* Actions and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <button
                            onClick={() => {
                                setEditingInvoice(null);
                                setShowCreateForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Invoice
                        </button>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search invoices..."
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
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Create/Edit Form */}
                {showCreateForm && (
                    <InvoiceForm
                        invoice={editingInvoice}
                        activePOs={activePOs}
                        onSubmit={(data) => createMutation.mutate(data)}
                        onCancel={() => {
                            setShowCreateForm(false);
                            setEditingInvoice(null);
                        }}
                    />
                )}

                {/* Invoices List */}
                {isLoadingInvoices && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <InvoiceCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {!isLoadingInvoices && filteredInvoices.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                            {searchQuery || filterStatus !== "all"
                                ? "No invoices match your filters"
                                : "No invoices yet. Create your first invoice to get started."}
                        </p>
                    </div>
                )}

                {!isLoadingInvoices && filteredInvoices.length > 0 && (
                    <div className="space-y-4">
                        {filteredInvoices.map((invoice) => {
                            const statusBadge = getStatusBadge(invoice.status);
                            const StatusIcon = statusBadge.icon;

                            return (
                                <div
                                    key={invoice.id}
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg text-gray-900">
                                                    {invoice.invoice_number}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusBadge.color}`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {invoice.po_number} - {invoice.purchase_order.product_type}
                                            </p>
                                            {invoice.vendor_invoice_ref && (
                                                <p className="text-sm text-gray-500">
                                                    Your Ref: {invoice.vendor_invoice_ref}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(invoice.total_amount)}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1 justify-end mt-1">
                                                <Calendar className="w-3 h-3" />
                                                Due: {formatDate(invoice.due_date)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rejection Reason */}
                                    {invoice.status === "rejected" && invoice.rejection_reason && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-900">Rejected</p>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        {invoice.rejection_reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Line Items Summary */}
                                    {invoice.line_items && invoice.line_items.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                            <p className="text-xs font-medium text-gray-600 mb-2">
                                                {invoice.line_items.length} line item(s):
                                            </p>
                                            {invoice.line_items.slice(0, 2).map((item, idx) => (
                                                <p key={idx} className="text-sm text-gray-700">
                                                    • {item.description} ({item.quantity} × {formatCurrency(item.unit_price)})
                                                </p>
                                            ))}
                                            {invoice.line_items.length > 2 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    +{invoice.line_items.length - 2} more
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {invoice.status === "draft" && `Created ${formatDate(invoice.created_at)}`}
                                                {invoice.status === "submitted" && invoice.submitted_at && `Submitted ${formatDate(invoice.submitted_at)}`}
                                                {invoice.status === "approved" && invoice.approved_at && `Approved ${formatDate(invoice.approved_at)}`}
                                                {invoice.status === "paid" && invoice.paid_at && `Paid ${formatDate(invoice.paid_at)}`}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 ml-auto">
                                            {invoice.status === "draft" && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingInvoice(invoice);
                                                            setShowCreateForm(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Submit this invoice for approval?")) {
                                                                submitMutation.mutate(invoice.id);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-brand-blue rounded-lg hover:opacity-90 transition-opacity"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        Submit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Delete this draft invoice?")) {
                                                                deleteMutation.mutate(invoice.id);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                            {invoice.status !== "draft" && (
                                                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                    View Details
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
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: "gray" | "yellow" | "green" | "blue";
}

function StatsCard({ label, value, subtitle, icon: Icon, color }: StatsCardProps): ReactElement {
    const colorClasses = {
        gray: "bg-gray-100 text-gray-600",
        yellow: "bg-yellow-100 text-yellow-600",
        green: "bg-green-100 text-green-600",
        blue: "bg-blue-100 text-blue-600",
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
}

interface InvoiceFormProps {
    invoice: VendorInvoice | null;
    activePOs: PurchaseOrderBasic[];
    onSubmit: (data: CreateInvoicePayload) => void;
    onCancel: () => void;
}

function InvoiceForm({ invoice, activePOs, onSubmit, onCancel }: InvoiceFormProps): ReactElement {
    const [selectedPO, setSelectedPO] = useState<number>(invoice?.purchase_order.id || 0);
    const [vendorRef, setVendorRef] = useState(invoice?.vendor_invoice_ref || "");
    const [invoiceDate, setInvoiceDate] = useState(
        invoice?.invoice_date || new Date().toISOString().split("T")[0]
    );
    const [dueDate, setDueDate] = useState(
        invoice?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
        invoice?.line_items || [{ description: "", quantity: 1, unit_price: 0, amount: 0 }]
    );
    const [taxRate, setTaxRate] = useState(invoice?.tax_rate || 16);

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
        const updated = [...lineItems];
        updated[index] = { ...updated[index], [field]: value };

        if (field === "quantity" || field === "unit_price") {
            updated[index].amount = updated[index].quantity * updated[index].unit_price;
        }

        setLineItems(updated);
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0, amount: 0 }]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            purchase_order_id: selectedPO,
            vendor_invoice_ref: vendorRef,
            invoice_date: invoiceDate,
            due_date: dueDate,
            line_items: lineItems,
            subtotal,
            tax_rate: taxRate,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
                {invoice ? "Edit Invoice" : "Create New Invoice"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Order *
                    </label>
                    <select
                        required
                        value={selectedPO}
                        onChange={(e) => setSelectedPO(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                        disabled={!!invoice}
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
                        Your Invoice Reference
                    </label>
                    <input
                        type="text"
                        value={vendorRef}
                        onChange={(e) => setVendorRef(e.target.value)}
                        placeholder="e.g., VND-INV-2026-001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Date *
                    </label>
                    <input
                        required
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date *
                    </label>
                    <input
                        required
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Line Items *</label>
                    <button
                        type="button"
                        onClick={addLineItem}
                        className="text-sm text-brand-blue hover:text-blue-700 font-medium"
                    >
                        + Add Line Item
                    </button>
                </div>

                <div className="space-y-3">
                    {lineItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-start">
                            <input
                                required
                                type="text"
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                                className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                            <input
                                required
                                type="number"
                                min="1"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => handleLineItemChange(index, "quantity", Number(e.target.value))}
                                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Rate"
                                value={item.unit_price}
                                onChange={(e) => handleLineItemChange(index, "unit_price", Number(e.target.value))}
                                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                            <div className="col-span-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                    {item.amount.toFixed(2)}
                                </span>
                                {lineItems.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLineItem(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium text-gray-900">KES {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600">Tax ({taxRate}%):</span>
                        <span className="font-medium text-gray-900">KES {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-900">Total Amount:</span>
                            <span className="font-bold text-xl text-gray-900">KES {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    type="submit"
                    className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    {invoice ? "Update Invoice" : "Save as Draft"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-20 mt-2"></div>
        </div>
    );
}

function InvoiceCardSkeleton(): ReactElement {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="text-right space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="flex gap-2 ml-auto">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
}
