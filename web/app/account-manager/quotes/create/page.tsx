"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    Search,
    Plus,
    Trash2,
    UploadCloud,
    FileText,
} from "lucide-react";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";
import type { Client } from "@/types/clients";
import type { Lead } from "@/types/leads";
import type { Product } from "@/types/products";
import type { CreateQuoteInput, PaymentTerms, Quote, MultiProductQuote } from "@/types/quotes";
import type { ProductionUser } from "@/types/users";
import { fetchClients } from "@/services/clients";
import { fetchLeads } from "@/services/leads";
import { fetchProducts } from "@/services/products";
import { createMultiProductQuote, fetchQuote, updateQuote, sendQuoteToPT, sendQuoteToCustomer } from "@/services/quotes";
import { getCurrentUser } from "@/services/users";
import SelectProductionMemberModal from "@/features/quotes/components/SelectProductionMemberModal";
import ConfirmModal from "@/features/quotes/components/ConfirmModal";
import { toast } from "sonner";

interface LineItem {
    tempId: string;
    product_id: number;
    product_name: string;
    product_sku: string;
    customization_level: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    discount_type: "percent" | "fixed";
    variable_amount: number;
}

export default function CreateQuotePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const editId = searchParams.get("edit");
    const isEditMode = !!editId;
    const quoteId = editId ? Number(editId) : null;

    const [clientType, setClientType] = useState<"client" | "lead">("client");
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [quoteDate, setQuoteDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [expiryDate, setExpiryDate] = useState(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );
    const [customerNotes, setCustomerNotes] = useState("");
    const [termsAndConditions, setTermsAndConditions] = useState("");

    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [enableTax, setEnableTax] = useState(true);
    const [taxRate, setTaxRate] = useState(16);
    const [enableShipping, setEnableShipping] = useState(false);
    const [shippingCharges, setShippingCharges] = useState(0);
    const [enableAdjustment, setEnableAdjustment] = useState(false);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);
    const [adjustmentReason, setAdjustmentReason] = useState("");

    const [pendingAction, setPendingAction] = useState<"draft" | "send_pt" | "send_customer" | null>(null);
    const [savedQuoteId, setSavedQuoteId] = useState<number | null>(null);
    const [showPTModal, setShowPTModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    const { data: existingQuote, isLoading: quoteLoading } = useQuery({
        queryKey: ["quote", quoteId],
        queryFn: () => fetchQuote(quoteId!),
        enabled: isEditMode && quoteId !== null,
    });

    const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useQuery({
        queryKey: ["clients", 1, 100, ""],
        queryFn: () =>
            fetchClients({
                page: 1,
                pageSize: 100,
                search: "",
                status: "all",
                clientType: "all",
            }),
    });

    const { data: leadsData, isLoading: leadsLoading, error: leadsError } = useQuery({
        queryKey: ["leads-for-quotes", 1, 100, ""],
        queryFn: () =>
            fetchLeads({
                page: 1,
                pageSize: 100,
                search: "",
                status: "Qualified",
                source: "all",
            }),
    });

    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ["products", 1, 200, ""],
        queryFn: () =>
            fetchProducts({
                page: 1,
                pageSize: 200,
                search: "",
                status: "published",
                customizationLevel: "all",
                category: "all",
                subCategory: "all",
                visibility: "all",
            }),
    });

    const { data: currentUser } = useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser,
    });

    const clients = clientsData?.results || [];
    const leads = leadsData?.results || [];
    const products = productsData?.results || [];
    const filteredProducts = productSearch
        ? products.filter(
            (p: Product) =>
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                p.internal_code?.toLowerCase().includes(productSearch.toLowerCase())
        )
        : products;

    const displayUserName = currentUser
        ? currentUser.name || currentUser.email
        : "Loading...";

    useEffect(() => {
        if (isEditMode && existingQuote && existingQuote.line_items) {
            if (existingQuote.client) {
                setClientType("client");
                setSelectedClientId(existingQuote.client);
            } else if (existingQuote.lead) {
                setClientType("lead");
                setSelectedLeadId(existingQuote.lead);
            }

            setReferenceNumber(existingQuote.reference_number || "");
            setQuoteDate(existingQuote.quote_date);
            setExpiryDate(existingQuote.valid_until);
            setCustomerNotes(existingQuote.customer_notes || "");
            setTermsAndConditions(existingQuote.custom_terms || "");

            setEnableTax(existingQuote.include_vat ?? true);
            setTaxRate(existingQuote.tax_rate || 16);
            setEnableShipping((existingQuote.shipping_charges ?? 0) > 0);
            setShippingCharges(existingQuote.shipping_charges || 0);
            setEnableAdjustment((existingQuote.adjustment_amount ?? 0) !== 0);
            setAdjustmentAmount(existingQuote.adjustment_amount || 0);
            setAdjustmentReason(existingQuote.adjustment_reason || "");

            const mappedLineItems = existingQuote.line_items.map((item, index) => ({
                tempId: `existing-${item.id || index}`,
                product_id: item.product || 0,
                product_name: item.product_name,
                product_sku: "",
                customization_level: item.customization_level_snapshot || "",
                quantity: item.quantity,
                unit_price: typeof item.unit_price === "string" ? parseFloat(item.unit_price) : (item.unit_price || 0),
                discount_amount: item.discount_amount || 0,
                discount_type: (item.discount_type as "percent" | "fixed") || "percent",
                variable_amount: item.variable_amount || 0,
            }));
            setLineItems(mappedLineItems);
        }
    }, [isEditMode, existingQuote]);

    const createMutation = useMutation<Quote | MultiProductQuote, Error, CreateQuoteInput>({
        mutationFn: (data: CreateQuoteInput) =>
            isEditMode && quoteId ? updateQuote(quoteId, data) : createMultiProductQuote(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["multi-product-quotes"] });
            queryClient.invalidateQueries({ queryKey: ["quote-stats"] });
            if (isEditMode && quoteId) {
                queryClient.invalidateQueries({ queryKey: ["quote", quoteId] });
            }

            const createdQuoteId = data.id;
            setSavedQuoteId(createdQuoteId);

            if (pendingAction === "send_pt") {
                setShowPTModal(true);
            } else if (pendingAction === "send_customer") {
                setShowCustomerModal(true);
            } else {
                toast.success(isEditMode ? "Quote updated successfully" : "Quote created successfully");
                router.push("/account-manager/quotes");
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to save quote");
        },
    });

    const sendToPTMutation = useMutation({
        mutationFn: ({ quoteId, assignedTo }: { quoteId: number; assignedTo: number }) =>
            sendQuoteToPT(quoteId, assignedTo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multi-product-quotes"] });
            queryClient.invalidateQueries({ queryKey: ["quote-stats"] });
            toast.success("Quote sent to Production Team successfully");
            setShowPTModal(false);
            router.push("/account-manager/quotes");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to send quote to PT");
        },
    });

    const sendToCustomerMutation = useMutation({
        mutationFn: (quoteId: number) => sendQuoteToCustomer(quoteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multi-product-quotes"] });
            queryClient.invalidateQueries({ queryKey: ["quote-stats"] });
            toast.success("Quote sent to customer successfully");
            setShowCustomerModal(false);
            router.push("/account-manager/quotes");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to send quote to customer");
        },
    });

    const handleAddAnotherLine = () => {
        setProductSearch("");
        setShowSearchResults(true);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);
    };

    const addProductToLine = (product: Product) => {
        const newItem: LineItem = {
            tempId: Date.now().toString(),
            product_id: product.id,
            product_name: product.name,
            product_sku: product.internal_code || "",
            customization_level: product.customization_level,
            quantity: 1,
            unit_price: product.base_price || 0,
            discount_amount: 0,
            discount_type: "percent",
            variable_amount: 0,
        };
        setLineItems([...lineItems, newItem]);
        setProductSearch("");
        setShowSearchResults(false);
    };

    const removeLineItem = (tempId: string) => {
        setLineItems(lineItems.filter((item) => item.tempId !== tempId));
    };

    const updateLineItem = (
        tempId: string,
        field: keyof LineItem,
        value: string | number
    ) => {
        setLineItems(
            lineItems.map((item) =>
                item.tempId === tempId ? { ...item, [field]: value } : item
            )
        );
    };

    const calculateLineTotal = (item: LineItem) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const variableAmount = Number(item.variable_amount) || 0;
        const discountAmount = Number(item.discount_amount) || 0;

        const subtotal = quantity * (unitPrice + variableAmount);
        const discount =
            item.discount_type === "percent"
                ? subtotal * (discountAmount / 100)
                : discountAmount;
        return subtotal - discount;
    };

    const calculateSubtotal = () => {
        return lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    };

    const calculateDiscountTotal = () => {
        return lineItems.reduce((sum, item) => {
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unit_price) || 0;
            const variableAmount = Number(item.variable_amount) || 0;
            const discountAmount = Number(item.discount_amount) || 0;

            const subtotal = quantity * (unitPrice + variableAmount);
            const discount =
                item.discount_type === "percent"
                    ? subtotal * (discountAmount / 100)
                    : discountAmount;
            return sum + discount;
        }, 0);
    };

    const calculateTaxTotal = () => {
        if (!enableTax) return 0;
        const subtotal = calculateSubtotal();
        const rate = Number(taxRate) || 0;
        return subtotal * (rate / 100);
    };

    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = calculateTaxTotal();
        const shipping = enableShipping ? (Number(shippingCharges) || 0) : 0;
        const adjustment = enableAdjustment ? (Number(adjustmentAmount) || 0) : 0;
        return subtotal + tax + shipping + adjustment;
    };

    const handleSubmit = async (action: "draft" | "send_pt" | "send_customer") => {
        if (!selectedClientId && !selectedLeadId) {
            toast.error("Please select a client or lead");
            return;
        }

        if (lineItems.length === 0) {
            toast.error("Please add at least one product");
            return;
        }

        const invalidItems = lineItems.filter(
            (item) => !item.product_id || item.quantity <= 0
        );
        if (invalidItems.length > 0) {
            toast.error("Please complete all line items with valid products and quantities");
            return;
        }

        setPendingAction(action);

        const quoteData: CreateQuoteInput = {
            client_id: clientType === "client" ? selectedClientId || undefined : undefined,
            lead_id: clientType === "lead" ? selectedLeadId || undefined : undefined,
            reference_number: referenceNumber || undefined,
            quote_date: quoteDate,
            valid_until: expiryDate,
            payment_terms: "Prepaid",
            include_vat: enableTax,
            tax_rate: taxRate,
            shipping_charges: enableShipping ? shippingCharges : undefined,
            adjustment_amount: enableAdjustment ? adjustmentAmount : undefined,
            adjustment_reason: adjustmentReason || undefined,
            notes: customerNotes || undefined,
            custom_terms: termsAndConditions || undefined,
            line_items: lineItems.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount_amount: item.discount_amount || undefined,
                discount_type: item.discount_type,
                variable_amount: item.variable_amount || undefined,
            })),
        };

        try {
            await createMutation.mutateAsync(quoteData);
        } catch (error) {
            console.error("Failed to save quote:", error);
            setPendingAction(null);
        }
    };

    const handleConfirmSendToPT = async (memberId: number) => {
        if (savedQuoteId) {
            await sendToPTMutation.mutateAsync({ quoteId: savedQuoteId, assignedTo: memberId });
        }
    };

    const handleConfirmSendToCustomer = async () => {
        if (savedQuoteId) {
            await sendToCustomerMutation.mutateAsync(savedQuoteId);
        }
    };

    const handleCancelAction = () => {
        setShowPTModal(false);
        setShowCustomerModal(false);
        toast.success(isEditMode ? "Quote updated successfully" : "Quote created successfully");
        router.push("/account-manager/quotes");
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 2,
        }).format(value);
    };

    if (isEditMode && quoteLoading) {
        return (
            <AccountManagerLayout>
                <div className="min-h-screen bg-white">
                    <div className="bg-white border-b border-gray-200 px-6 py-3">
                        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                            <div className="flex items-center gap-4">
                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-9 w-40 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-[1400px] mx-auto px-6 py-6">
                        <div className="flex gap-6">
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="w-80">
                                <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </AccountManagerLayout>
        );
    }

    if (isEditMode && !quoteLoading && !existingQuote) {
        return (
            <AccountManagerLayout>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 text-lg font-semibold">Quote not found</p>
                        <button
                            onClick={() => router.push("/account-manager/quotes")}
                            className="mt-4 px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-700"
                        >
                            Back to Quotes
                        </button>
                    </div>
                </div>
            </AccountManagerLayout>
        );
    }

    return (
        <AccountManagerLayout>
            <div className="min-h-screen bg-white">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
                    <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {isEditMode ? `Edit Quote${existingQuote ? ` - ${existingQuote.quote_id}` : ""}` : "New Quote"}
                                </h1>
                                {isEditMode && existingQuote?.status === "Draft" && (
                                    <p className="text-xs text-gray-500 mt-0.5">Only draft quotes can be edited</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {(!isEditMode || existingQuote?.status === "Draft") ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit("draft")}
                                        disabled={createMutation.isPending}
                                        className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
                                    >
                                        {isEditMode ? "Save Changes" : "Save as Draft"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit("send_pt")}
                                        disabled={createMutation.isPending}
                                        className="px-5 py-2 bg-brand-blue text-white rounded hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
                                    >
                                        {isEditMode ? "Save & Send to PT" : "Send to PT for Costing"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit("send_customer")}
                                        disabled={createMutation.isPending}
                                        className="px-5 py-2 bg-brand-green text-white rounded hover:bg-green-700 font-medium text-sm disabled:opacity-50"
                                    >
                                        {isEditMode ? "Save & Email Client" : "Email Client"}
                                    </button>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded border border-gray-200">
                                    Quote status: <span className="font-semibold">{existingQuote?.status}</span> - Cannot be edited
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 py-6">
                    <div className="flex gap-6">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Header Section */}
                            <div className="grid grid-cols-2 gap-8 mb-6">
                                {/* Left: Client Info */}
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer Name *
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Select an existing client or qualified lead to create a quote for</p>
                                        <select
                                            value={
                                                clientType === "client"
                                                    ? `client-${selectedClientId || ""}`
                                                    : `lead-${selectedLeadId || ""}`
                                            }
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.startsWith("client-")) {
                                                    setClientType("client");
                                                    setSelectedClientId(
                                                        Number(val.replace("client-", "")) || null
                                                    );
                                                    setSelectedLeadId(null);
                                                } else if (val.startsWith("lead-")) {
                                                    setClientType("lead");
                                                    setSelectedLeadId(
                                                        Number(val.replace("lead-", "")) || null
                                                    );
                                                    setSelectedClientId(null);
                                                }
                                            }}
                                            required
                                            disabled={clientsLoading || leadsLoading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {(clientsLoading || leadsLoading) ? "Loading customers..." : (clientsError || leadsError) ? "Error loading customers" : "Select a Customer"}
                                            </option>
                                            {!clientsLoading && !clientsError && clients.length > 0 && (
                                                <optgroup label="Clients">
                                                    {clients.map((client: Client) => (
                                                        <option key={client.id} value={`client-${client.id}`}>
                                                            {client.company || client.name} ({client.client_id})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                            {!leadsLoading && !leadsError && leads.length > 0 && (
                                                <optgroup label="Qualified Leads">
                                                    {leads.map((lead: Lead) => (
                                                        <option key={lead.id} value={`lead-${lead.id}`}>
                                                            {lead.name} ({lead.lead_id})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                            {!clientsLoading && !clientsError && clients.length === 0 && !leadsLoading && !leadsError && leads.length === 0 && (
                                                <option value="" disabled>No clients or leads found</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reference Number
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Client's purchase order (PO) or LPO reference number (optional)</p>
                                        <input
                                            type="text"
                                            value={referenceNumber}
                                            onChange={(e) => setReferenceNumber(e.target.value)}
                                            placeholder="e.g., PO-12345"
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Right: Quote Details */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Quote Date
                                            </label>
                                            <p className="text-xs text-gray-500 mb-1">Date when quote is issued</p>
                                            <input
                                                type="date"
                                                value={quoteDate}
                                                onChange={(e) => setQuoteDate(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Expiry Date
                                            </label>
                                            <p className="text-xs text-gray-500 mb-1">Quote validity period (default 7 days)</p>
                                            <input
                                                type="date"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Salesperson
                                        </label>
                                        <p className="text-xs text-gray-500 mb-1">Account manager assigned to this quote</p>
                                        <input
                                            type="text"
                                            value={displayUserName}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="border border-gray-200 rounded-lg mb-6">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase w-6">
                                                #
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase">
                                                Item Details
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase w-24">
                                                Quantity
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase w-32">
                                                Rate
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase w-28">
                                                Discount
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase w-32">
                                                Amount
                                            </th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {lineItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center">
                                                    <div className="text-gray-400 mb-2">
                                                        <FileText className="w-12 h-12 mx-auto mb-2" />
                                                    </div>
                                                    <p className="text-sm text-gray-500">No items added</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            lineItems.map((item, index) => (
                                                <tr key={item.tempId} className="border-b border-gray-200">
                                                    <td className="px-4 py-3 text-xs text-gray-600">{index + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.product_name}
                                                        </p>
                                                        {item.product_sku && (
                                                            <p className="text-xs text-gray-500">
                                                                SKU: {item.product_sku}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateLineItem(
                                                                    item.tempId,
                                                                    "quantity",
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                            min="1"
                                                            className="w-20 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={item.unit_price}
                                                            onChange={(e) =>
                                                                updateLineItem(
                                                                    item.tempId,
                                                                    "unit_price",
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                            min="0"
                                                            step="0.01"
                                                            className="w-28 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={item.discount_amount}
                                                                onChange={(e) =>
                                                                    updateLineItem(
                                                                        item.tempId,
                                                                        "discount_amount",
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                                min="0"
                                                                step="0.01"
                                                                className="w-16 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                            />
                                                            <select
                                                                value={item.discount_type}
                                                                onChange={(e) =>
                                                                    updateLineItem(
                                                                        item.tempId,
                                                                        "discount_type",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                            >
                                                                <option value="percent">%</option>
                                                                <option value="fixed">KES</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                        {formatCurrency(calculateLineTotal(item))}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLineItem(item.tempId)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {/* Inline Search Row */}
                                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 relative">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Search className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={productSearch}
                                                onChange={(e) => {
                                                    setProductSearch(e.target.value);
                                                    setShowSearchResults(true);
                                                }}
                                                onFocus={() => setShowSearchResults(true)}
                                                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                                placeholder="Search products by name or SKU..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                                            />

                                            {/* Search Results Dropdown */}
                                            {showSearchResults && filteredProducts.length > 0 && (
                                                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                                                    {filteredProducts.map((product: Product) => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() => addProductToLine(product)}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {product.internal_code} • {formatCurrency(product.base_price || 0)}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddAnotherLine}
                                            className="text-brand-blue hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add another line
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Customer Notes
                                    </label>
                                    <textarea
                                        value={customerNotes}
                                        onChange={(e) => setCustomerNotes(e.target.value)}
                                        rows={3}
                                        placeholder="Looking forward to your business."
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This will be displayed on the quote
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Terms & Conditions
                                    </label>
                                    <textarea
                                        value={termsAndConditions}
                                        onChange={(e) => setTermsAndConditions(e.target.value)}
                                        rows={3}
                                        placeholder="Enter the terms and conditions of your business."
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Legal terms, payment conditions, and policies for this quote
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Totals */}
                        <div className="w-80 flex-shrink-0">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sticky top-24">
                                <div className="space-y-3 pb-4 mb-4 border-b border-gray-300">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Sub Total</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(calculateSubtotal())}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Discount</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(calculateDiscountTotal())}
                                        </span>
                                    </div>
                                </div>

                                {/* Tax Section */}
                                <div className="pb-4 mb-4 border-b border-gray-300">
                                    <div className="mb-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={enableTax}
                                                onChange={(e) => setEnableTax(e.target.checked)}
                                                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                            />
                                            <span>VAT</span>
                                        </label>
                                        <p className="text-xs text-gray-500 ml-6">Apply Value Added Tax (standard rate 16%)</p>
                                    </div>
                                    {enableTax && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="number"
                                                    value={taxRate}
                                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                />
                                                <span className="text-xs text-gray-600">%</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-sm text-gray-600">VAT</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(calculateTaxTotal())}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Charges */}
                                <div className="pb-4 mb-4 border-b border-gray-300">
                                    <div className="mb-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={enableShipping}
                                                onChange={(e) => setEnableShipping(e.target.checked)}
                                                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                            />
                                            <span>Shipping Charges</span>
                                        </label>
                                        <p className="text-xs text-gray-500 ml-6">Add delivery or transportation costs</p>
                                    </div>
                                    {enableShipping && (
                                        <input
                                            type="number"
                                            value={shippingCharges}
                                            onChange={(e) => setShippingCharges(Number(e.target.value))}
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        />
                                    )}
                                </div>

                                {/* Adjustment */}
                                <div className="pb-4 mb-4 border-b border-gray-300">
                                    <div className="mb-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={enableAdjustment}
                                                onChange={(e) => setEnableAdjustment(e.target.checked)}
                                                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                            />
                                            <span>Adjustment</span>
                                        </label>
                                        <p className="text-xs text-gray-500 ml-6">Apply final price adjustment (+ or -)</p>
                                    </div>
                                    {enableAdjustment && (
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Amount (KES)</label>
                                                <input
                                                    type="number"
                                                    value={adjustmentAmount}
                                                    onChange={(e) =>
                                                        setAdjustmentAmount(Number(e.target.value))
                                                    }
                                                    step="0.01"
                                                    placeholder="Enter amount"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Reason</label>
                                                <input
                                                    type="text"
                                                    value={adjustmentReason}
                                                    onChange={(e) => setAdjustmentReason(e.target.value)}
                                                    placeholder="e.g., Bulk discount, Rush fee"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-semibold text-gray-900">
                                            Total (KES)
                                        </span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {(calculateGrandTotal() || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showPTModal && savedQuoteId && (
                <SelectProductionMemberModal
                    quoteId={String(savedQuoteId)}
                    onClose={handleCancelAction}
                    onConfirm={handleConfirmSendToPT}
                />
            )}

            {showCustomerModal && (
                <ConfirmModal
                    title="Send to Customer"
                    message="This will send the quote to the customer via email with a PDF attachment. The customer will receive a link to view and accept/reject the quote. Continue?"
                    confirmText="Send to Customer"
                    confirmColor="purple"
                    onClose={handleCancelAction}
                    onConfirm={handleConfirmSendToCustomer}
                />
            )}
        </AccountManagerLayout>
    );
}
