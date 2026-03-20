"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";
import type { Client } from "@/types/clients";
import type { Lead } from "@/types/leads";
import type { Product } from "@/types/products";
import type { CreateQuoteInput, Quote, MultiProductQuote } from "@/types/quotes";
import type { LineItem } from "@/features/quotes/types";
import { fetchClients } from "@/services/clients";
import { fetchLeads } from "@/services/leads";
import { fetchProducts } from "@/services/products";
import { createMultiProductQuote, fetchQuote, updateQuote, sendQuoteToPT, sendQuoteToCustomer } from "@/services/quotes";
import { getCurrentUser } from "@/services/users";
import QuoteTopBar from "@/features/quotes/components/QuoteTopBar";
import QuoteHeaderSection from "@/features/quotes/components/QuoteHeaderSection";
import QuoteLineItemsTable from "@/features/quotes/components/QuoteLineItemsTable";
import QuoteNotesSection from "@/features/quotes/components/QuoteNotesSection";
import QuoteTotalsSidebar from "@/features/quotes/components/QuoteTotalsSidebar";
import QuotePTCostBanner from "@/features/quotes/components/QuotePTCostBanner";
import SelectProductionMemberModal from "@/features/quotes/components/SelectProductionMemberModal";
import ConfirmModal from "@/features/quotes/components/ConfirmModal";
import { toast } from "sonner";

export default function CreateQuotePage() {
    return (
        <Suspense fallback={null}>
            <CreateQuotePageContent />
        </Suspense>
    );
}

function CreateQuotePageContent() {
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
                pricingMode: "all",
                printCategory: "",
                category: "",
            }),
    });

    const { data: currentUser } = useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser,
    });

    const clients = clientsData?.results || [];
    const leads = leadsData?.results || [];
    const products = productsData?.results || [];

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
                pricing_mode: item.customization_level_snapshot || "",
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

    const addProductToLine = (product: Product): void => {
        const newItem: LineItem = {
            tempId: Date.now().toString(),
            product_id: product.id,
            product_name: product.name,
            product_sku: product.internal_code || "",
            pricing_mode: product.pricing_mode,
            quantity: 1,
            unit_price: 0,
            discount_amount: 0,
            discount_type: "percent",
            variable_amount: 0,
        };
        setLineItems([...lineItems, newItem]);
    };

    const removeLineItem = (tempId: string): void => {
        setLineItems(lineItems.filter((item) => item.tempId !== tempId));
    };

    const updateLineItem = (
        tempId: string,
        field: keyof LineItem,
        value: string | number
    ): void => {
        setLineItems(
            lineItems.map((item) =>
                item.tempId === tempId ? { ...item, [field]: value } : item
            )
        );
    };

    const calculateLineTotal = (item: LineItem): number => {
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

    const calculateSubtotal = (): number => {
        return lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    };

    const calculateDiscountTotal = (): number => {
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

    const calculateTaxTotal = (): number => {
        if (!enableTax) return 0;
        return calculateSubtotal() * ((Number(taxRate) || 0) / 100);
    };

    const calculateGrandTotal = (): number => {
        const subtotal = calculateSubtotal();
        const tax = calculateTaxTotal();
        const shipping = enableShipping ? (Number(shippingCharges) || 0) : 0;
        const adjustment = enableAdjustment ? (Number(adjustmentAmount) || 0) : 0;
        return subtotal + tax + shipping + adjustment;
    };

    const handleCustomerChange = (type: "client" | "lead", id: number | null): void => {
        setClientType(type);
        if (type === "client") {
            setSelectedClientId(id);
            setSelectedLeadId(null);
        } else {
            setSelectedLeadId(id);
            setSelectedClientId(null);
        }
    };

    const handleSubmit = async (action: "draft" | "send_pt" | "send_customer"): Promise<void> => {
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

        if (action === "send_customer" && calculateGrandTotal() === 0) {
            toast.error("Cannot send a quote with KES 0 total to the client. Set the Rate (KES) on each line item first.");
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
        } catch {
            setPendingAction(null);
        }
    };

    const handleConfirmSendToPT = async (memberId: number): Promise<void> => {
        if (savedQuoteId) {
            await sendToPTMutation.mutateAsync({ quoteId: savedQuoteId, assignedTo: memberId });
        }
    };

    const handleConfirmSendToCustomer = async (): Promise<void> => {
        if (savedQuoteId) {
            await sendToCustomerMutation.mutateAsync(savedQuoteId);
        }
    };

    const handleCancelAction = (): void => {
        setShowPTModal(false);
        setShowCustomerModal(false);
        toast.success(isEditMode ? "Quote updated successfully" : "Quote created successfully");
        router.push("/account-manager/quotes");
    };

    if (isEditMode && quoteLoading) {
        return (
            <AccountManagerLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
                        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-gray-200 rounded-md animate-pulse" />
                                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse" />
                                <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                                <div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div className="max-w-[1400px] mx-auto px-6 py-6">
                        <div className="flex gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="h-48 bg-white border border-gray-200 rounded-lg animate-pulse" />
                                <div className="h-64 bg-white border border-gray-200 rounded-lg animate-pulse" />
                                <div className="h-36 bg-white border border-gray-200 rounded-lg animate-pulse" />
                            </div>
                            <div className="w-72 flex-shrink-0">
                                <div className="h-80 bg-white border border-gray-200 rounded-lg animate-pulse" />
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
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-brand-red font-semibold">Quote not found</p>
                        <button
                            onClick={(): void => router.push("/account-manager/quotes")}
                            className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue/90 text-sm"
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
            <div className="min-h-screen bg-gray-50">
                <QuoteTopBar
                    isEditMode={isEditMode}
                    quoteDisplayId={existingQuote?.quote_id}
                    quoteStatus={existingQuote?.status}
                    isSaving={createMutation.isPending}
                    onBack={(): void => router.back()}
                    onSaveDraft={(): void => { handleSubmit("draft"); }}
                    onSendToPT={(): void => { handleSubmit("send_pt"); }}
                    onEmailClient={(): void => { handleSubmit("send_customer"); }}
                />

                <div className="max-w-[1400px] mx-auto px-6 py-6">
                    <div className="flex gap-6 items-start">
                        <div className="flex-1 min-w-0 space-y-4">
                            {isEditMode && existingQuote?.status === "Costed" && (
                                <QuotePTCostBanner
                                    productionCost={typeof existingQuote.production_cost === "string" ? parseFloat(existingQuote.production_cost) : (existingQuote.production_cost ?? 0)}
                                    currentSellingTotal={calculateGrandTotal()}
                                    costedByName={existingQuote.costed_by ? String(existingQuote.costed_by) : undefined}
                                />
                            )}

                            <QuoteHeaderSection
                                clients={clients}
                                leads={leads}
                                clientsLoading={clientsLoading}
                                leadsLoading={leadsLoading}
                                clientsError={clientsError as Error | null}
                                leadsError={leadsError as Error | null}
                                clientType={clientType}
                                selectedClientId={selectedClientId}
                                selectedLeadId={selectedLeadId}
                                onCustomerChange={handleCustomerChange}
                                referenceNumber={referenceNumber}
                                onReferenceChange={setReferenceNumber}
                                quoteDate={quoteDate}
                                onQuoteDateChange={setQuoteDate}
                                expiryDate={expiryDate}
                                onExpiryDateChange={setExpiryDate}
                                salesperson={displayUserName}
                            />

                            <QuoteLineItemsTable
                                lineItems={lineItems}
                                products={products}
                                onAddProduct={addProductToLine}
                                onRemoveItem={removeLineItem}
                                onUpdateItem={updateLineItem}
                            />

                            <QuoteNotesSection
                                customerNotes={customerNotes}
                                termsAndConditions={termsAndConditions}
                                onCustomerNotesChange={setCustomerNotes}
                                onTermsChange={setTermsAndConditions}
                            />
                        </div>

                        <div className="w-72 flex-shrink-0">
                            <QuoteTotalsSidebar
                                subtotal={calculateSubtotal()}
                                discountTotal={calculateDiscountTotal()}
                                taxTotal={calculateTaxTotal()}
                                grandTotal={calculateGrandTotal()}
                                enableTax={enableTax}
                                taxRate={taxRate}
                                enableShipping={enableShipping}
                                shippingCharges={shippingCharges}
                                enableAdjustment={enableAdjustment}
                                adjustmentAmount={adjustmentAmount}
                                adjustmentReason={adjustmentReason}
                                onEnableTaxChange={setEnableTax}
                                onTaxRateChange={setTaxRate}
                                onEnableShippingChange={setEnableShipping}
                                onShippingChargesChange={setShippingCharges}
                                onEnableAdjustmentChange={setEnableAdjustment}
                                onAdjustmentAmountChange={setAdjustmentAmount}
                                onAdjustmentReasonChange={setAdjustmentReason}
                            />
                        </div>
                    </div>
                </div>
            </div>

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
