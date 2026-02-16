"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import QuoteDetailDrawer from "@/features/quotes/components/QuoteDetailDrawer";
import QuotesFilters from "@/features/quotes/components/QuotesFilters";
import QuotesMetrics from "@/features/quotes/components/QuotesMetrics";
import QuotesPagination from "@/features/quotes/components/QuotesPagination";
import QuotesTable from "@/features/quotes/components/QuotesTable";
import {
    approveQuote,
    cloneQuote,
    deleteQuote,
    fetchQuote,
    fetchQuoteHistory,
    fetchQuotes,
    sendQuoteToCustomer,
    sendQuoteToPT,
} from "@/services/quotes";
import type { Quote, QuoteHistoryResponse, QuoteStatus, QuotesQueryParams, QuotesResponse } from "@/types/quotes";

export default function QuotesPage(): ReactElement {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<"all" | QuoteStatus>("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

    useEffect((): (() => void) => {
        const timer = setTimeout((): void => {
            setDebouncedSearch(search);
        }, 400);

        return (): void => clearTimeout(timer);
    }, [search]);

    const quoteQueryParams = useMemo(
        (): QuotesQueryParams => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
        }),
        [page, pageSize, debouncedSearch, status]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["quotes", quoteQueryParams],
        queryFn: (): Promise<QuotesResponse> => fetchQuotes(quoteQueryParams),
    });

    const { data: detailData, isLoading: isDetailLoading } = useQuery({
        queryKey: ["quote", selectedQuoteId],
        queryFn: (): Promise<Quote> => fetchQuote(selectedQuoteId as number),
        enabled: selectedQuoteId !== null,
    });

    const { data: historyData } = useQuery({
        queryKey: ["quote-history", selectedQuoteId],
        queryFn: (): Promise<QuoteHistoryResponse> => fetchQuoteHistory(selectedQuoteId as number),
        enabled: selectedQuoteId !== null,
    });

    const deleteMutation = useMutation({
        mutationFn: (quoteId: number): Promise<void> => deleteQuote(quoteId),
        onSuccess: (): void => {
            toast.success("Quote deleted.");
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
        },
        onError: (): void => {
            toast.error("Unable to delete quote.");
        },
    });

    const sendToPTMutation = useMutation({
        mutationFn: (quoteId: number): Promise<unknown> => sendQuoteToPT(quoteId),
        onSuccess: (): void => {
            toast.success("Quote sent to PT.");
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            if (selectedQuoteId !== null) {
                queryClient.invalidateQueries({ queryKey: ["quote", selectedQuoteId] });
                queryClient.invalidateQueries({ queryKey: ["quote-history", selectedQuoteId] });
            }
        },
        onError: (): void => {
            toast.error("Unable to send quote to PT.");
        },
    });

    const sendToCustomerMutation = useMutation({
        mutationFn: (quoteId: number): Promise<unknown> => sendQuoteToCustomer(quoteId),
        onSuccess: (): void => {
            toast.success("Quote sent to customer.");
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            if (selectedQuoteId !== null) {
                queryClient.invalidateQueries({ queryKey: ["quote", selectedQuoteId] });
                queryClient.invalidateQueries({ queryKey: ["quote-history", selectedQuoteId] });
            }
        },
        onError: (): void => {
            toast.error("Unable to send quote to customer.");
        },
    });

    const approveMutation = useMutation({
        mutationFn: (quoteId: number): Promise<unknown> => approveQuote(quoteId),
        onSuccess: (): void => {
            toast.success("Quote approved.");
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            if (selectedQuoteId !== null) {
                queryClient.invalidateQueries({ queryKey: ["quote", selectedQuoteId] });
                queryClient.invalidateQueries({ queryKey: ["quote-history", selectedQuoteId] });
            }
        },
        onError: (): void => {
            toast.error("Unable to approve quote.");
        },
    });

    const cloneMutation = useMutation({
        mutationFn: (quoteId: number): Promise<unknown> => cloneQuote(quoteId),
        onSuccess: (): void => {
            toast.success("Quote cloned as revision.");
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            if (selectedQuoteId !== null) {
                queryClient.invalidateQueries({ queryKey: ["quote", selectedQuoteId] });
                queryClient.invalidateQueries({ queryKey: ["quote-history", selectedQuoteId] });
            }
        },
        onError: (): void => {
            toast.error("Unable to clone quote.");
        },
    });

    const handleResetFilters = (): void => {
        setSearch("");
        setStatus("all");
        setPage(1);
    };

    const handleDelete = (quote: Quote): void => {
        const shouldDelete = window.confirm(`Delete ${quote.quote_id}? This cannot be undone.`);
        if (!shouldDelete) {
            return;
        }

        deleteMutation.mutate(quote.id);
    };

    const handleView = (quote: Quote): void => {
        setSelectedQuoteId(quote.id);
    };

    const handleSendToPT = (quote: Quote): void => {
        sendToPTMutation.mutate(quote.id);
    };

    const handleSendToCustomer = (quote: Quote): void => {
        sendToCustomerMutation.mutate(quote.id);
    };

    const handleApprove = (quote: Quote): void => {
        approveMutation.mutate(quote.id);
    };

    const handleClone = (quote: Quote): void => {
        cloneMutation.mutate(quote.id);
    };

    const quotes = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    return (
        <AdminLayout>
            <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <a href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">Quotes</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Track and manage quote records across draft, costing, and approval stages.
                        </p>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen pt-24">
                <div className="px-8 py-6 space-y-6">
                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load quotes</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch quote data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!error && (
                        <>
                            <QuotesMetrics quotes={quotes} totalCount={totalCount} />

                            <QuotesFilters
                                search={search}
                                status={status}
                                onSearchChange={(value: string): void => {
                                    setSearch(value);
                                    setPage(1);
                                }}
                                onStatusChange={(value: "all" | QuoteStatus): void => {
                                    setStatus(value);
                                    setPage(1);
                                }}
                                onReset={handleResetFilters}
                            />

                            {isLoading ? (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                                    <div className="h-4 bg-gray-200 rounded w-72 mt-3"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        {[1, 2, 3, 4].map((item: number): ReactElement => (
                                            <div key={item} className="h-16 bg-gray-100 rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : quotes.length > 0 ? (
                                <>
                                    <QuotesTable
                                        quotes={quotes}
                                        onView={handleView}
                                        onSendToPT={handleSendToPT}
                                        onSendToCustomer={handleSendToCustomer}
                                        onApprove={handleApprove}
                                        onClone={handleClone}
                                        onDelete={handleDelete}
                                    />
                                    <QuotesPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={setPage}
                                        onPageSizeChange={(size: number): void => {
                                            setPageSize(size);
                                            setPage(1);
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900">No quotes found</h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Try changing the search or status filter.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <QuoteDetailDrawer
                    quote={detailData ?? null}
                    history={historyData?.history ?? []}
                    isOpen={selectedQuoteId !== null}
                    isLoading={isDetailLoading}
                    onClose={(): void => setSelectedQuoteId(null)}
                />
            </main>
        </AdminLayout>
    );
}
