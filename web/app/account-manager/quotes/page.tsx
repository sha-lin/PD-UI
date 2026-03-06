"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";
import QuotesStatsCards from "@/features/quotes/components/QuotesStatsCards";
import MultiProductQuotesTable from "@/features/quotes/components/MultiProductQuotesTable";
import QuoteDetailModal from "@/features/quotes/components/QuoteDetailModal";
import type { MultiProductQuote, QuoteStatus } from "@/types/quotes";
import {
    fetchMultiProductQuotes,
    fetchQuoteStats,
    downloadQuotePdf,
    cloneQuote,
    sendQuoteToPT,
    sendQuoteToCustomer,
    markQuoteLost,
    convertQuoteToJob,
} from "@/services/quotes";

export default function MultiProductQuotesPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedQuote, setSelectedQuote] = useState<MultiProductQuote | null>(null);
    const queryClient = useQueryClient();

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["quote-stats"],
        queryFn: fetchQuoteStats,
    });

    const { data: quotes = [], isLoading: quotesLoading } = useQuery({
        queryKey: ["multi-product-quotes", statusFilter, searchQuery],
        queryFn: () => fetchMultiProductQuotes(statusFilter, searchQuery),
    });

    const cloneMutation = useMutation({
        mutationFn: cloneQuote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multi-product-quotes"] });
            queryClient.invalidateQueries({ queryKey: ["quote-stats"] });
        },
    });

    const sendToPTMutation = useMutation({
        mutationFn: sendQuoteToPT,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multi-product-quotes"] });
            queryClient.invalidateQueries({ queryKey: ["quote-stats"] });
            setSelectedQuote(null);
        },
    });

    const sendToCustomerMutation = useMutation({
        mutationFn: sendQuoteToCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multi-product-quotes"] });
            queryClient.invalidateQueries({ queryKey: ["quote-stats"] });
            setSelectedQuote(null);
        },
    });

    const markLostMutation = useMutation({
        mutationFn: ({ quoteId, reason }: { quoteId: number; reason: string }) =>
            markQuoteLost(quoteId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multi-product-quotes"] });
            queryClient.invalidateQueries({ queryKey: ["quote-stats"] });
            setSelectedQuote(null);
        },
    });

    const convertToJobMutation = useMutation({
        mutationFn: convertQuoteToJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multi-product-quotes"] });
            queryClient.invalidateQueries({ queryKey: ["quote-stats"] });
            setSelectedQuote(null);
        },
    });

    const handleViewDetail = (quote: MultiProductQuote) => {
        setSelectedQuote(quote);
    };

    const handleDownloadPdf = async (quoteId: string) => {
        try {
            const blob = await downloadQuotePdf(quoteId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `quote-${quoteId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to download PDF:", error);
        }
    };

    const handleClone = async (quoteId: number) => {
        if (confirm("Clone this quote?")) {
            try {
                await cloneMutation.mutateAsync(quoteId);
            } catch (error) {
                console.error("Failed to clone quote:", error);
            }
        }
    };

    const handleSendToPT = async (quoteId: number) => {
        if (confirm("Send this quote to the production team for costing?")) {
            try {
                await sendToPTMutation.mutateAsync(quoteId);
            } catch (error) {
                console.error("Failed to send quote to PT:", error);
            }
        }
    };

    const handleSendToCustomer = async (quoteId: number) => {
        if (confirm("Send this quote to the customer?")) {
            try {
                await sendToCustomerMutation.mutateAsync(quoteId);
            } catch (error) {
                console.error("Failed to send quote to customer:", error);
            }
        }
    };

    const handleMarkLost = async (quoteId: number) => {
        const reason = prompt("Why is this quote being marked as lost?");
        if (reason) {
            try {
                await markLostMutation.mutateAsync({ quoteId, reason });
            } catch (error) {
                console.error("Failed to mark quote as lost:", error);
            }
        }
    };

    const handleConvertToJob = async (quoteId: number) => {
        if (confirm("Convert this approved quote to a job?")) {
            try {
                await convertToJobMutation.mutateAsync(quoteId);
            } catch (error) {
                console.error("Failed to convert quote to job:", error);
            }
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    return (
        <AccountManagerLayout>
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                                Multi-Product Quotes
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage quotes with multiple products and line items
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push("/account-manager/quotes/create")}
                            className="px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Multi-Product Quote
                        </button>
                    </div>

                    {statsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse"
                                >
                                    <div className="h-10 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : stats ? (
                        <div className="mb-6">
                            <QuotesStatsCards stats={stats} />
                        </div>
                    ) : null}

                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by quote number or client name..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | "all")}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="Draft">Draft</option>
                                <option value="Sent to PT">Sent to PT</option>
                                <option value="Costed">Costed</option>
                                <option value="Sent to Customer">Sent to Customer</option>
                                <option value="Approved">Approved</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </form>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Showing {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
                        </p>
                    </div>

                    {quotesLoading ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <MultiProductQuotesTable
                            quotes={quotes}
                            onViewDetail={handleViewDetail}
                            onDownloadPdf={handleDownloadPdf}
                            onClone={handleClone}
                        />
                    )}
                </div>
            </div>

            <QuoteDetailModal
                quote={selectedQuote}
                onClose={() => setSelectedQuote(null)}
                onSendToPT={handleSendToPT}
                onSendToCustomer={handleSendToCustomer}
                onMarkLost={handleMarkLost}
                onConvertToJob={handleConvertToJob}
                onDownloadPdf={handleDownloadPdf}
            />
        </AccountManagerLayout>
    );
}
