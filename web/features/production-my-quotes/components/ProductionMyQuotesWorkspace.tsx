"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";
import QuoteDetailDrawer from "@/features/quotes/components/QuoteDetailDrawer";
import QuotesPagination from "@/features/quotes/components/QuotesPagination";
import { costQuote, fetchQuote, fetchQuoteHistory, fetchQuotes } from "@/services/quotes";
import type {
    Quote,
    QuoteCostPayload,
    QuoteHistoryResponse,
    QuoteProductionStatus,
    QuotesQueryParams,
    QuotesResponse,
} from "@/types/quotes";

type QueueFilter = "all" | QuoteProductionStatus;

const queueFilterOptions: Array<{ value: QueueFilter; label: string }> = [
    { value: "all", label: "All Queue Items" },
    { value: "pending", label: "Awaiting Costing" },
    { value: "in_progress", label: "In Costing" },
    { value: "costed", label: "Costed" },
];

const isQueueStatus = (status: string): boolean => {
    return status === "pending" || status === "in_progress" || status === "costed";
};

const isQuoteInProductionQueue = (quote: Quote): boolean => {
    const productionStatus = quote.production_status.toLowerCase();
    return quote.status === "Sent to PT" || quote.status === "Costed" || isQueueStatus(productionStatus);
};

const canCostQuote = (quote: Quote): boolean => {
    const productionStatus = quote.production_status.toLowerCase();
    return quote.status === "Sent to PT" && (productionStatus === "pending" || productionStatus === "in_progress");
};

const getQueueBadgeClass = (productionStatus: string): string => {
    if (productionStatus === "pending") {
        return "bg-brand-yellow/20 text-brand-black";
    }

    if (productionStatus === "in_progress") {
        return "bg-brand-blue/10 text-brand-blue";
    }

    if (productionStatus === "costed") {
        return "bg-brand-green/10 text-brand-green";
    }

    return "bg-gray-100 text-gray-700";
};

const formatMoney = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
        return "—";
    }

    return `KES ${value.toFixed(2)}`;
};

const formatDate = (value: string): string => {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
};

const getValidityLabel = (validUntil: string): { label: string; className: string } => {
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const target = new Date(validUntil);
    const targetDateOnly = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const daysDiff = Math.floor((targetDateOnly.getTime() - todayDateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
        return {
            label: `Overdue by ${Math.abs(daysDiff)}d`,
            className: "text-brand-red",
        };
    }

    if (daysDiff === 0) {
        return {
            label: "Due today",
            className: "text-brand-orange",
        };
    }

    return {
        label: `${daysDiff}d left`,
        className: "text-gray-600",
    };
};

export default function ProductionMyQuotesWorkspace(): ReactElement {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [queueFilter, setQueueFilter] = useState<QueueFilter>("pending");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
    const [costingQuote, setCostingQuote] = useState<Quote | null>(null);
    const [productionCost, setProductionCost] = useState<string>("");
    const [productionNotes, setProductionNotes] = useState<string>("");

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
            status: "all",
            productionStatus: queueFilter,
        }),
        [page, pageSize, debouncedSearch, queueFilter]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["production-my-quotes", quoteQueryParams],
        queryFn: (): Promise<QuotesResponse> => fetchQuotes(quoteQueryParams),
    });

    const filteredQuotes = useMemo((): Quote[] => {
        const quotes = data?.results ?? [];
        if (queueFilter === "all") {
            return quotes.filter(isQuoteInProductionQueue);
        }

        return quotes;
    }, [data?.results, queueFilter]);

    const totalCount = data?.count ?? 0;

    const pendingCount = filteredQuotes.filter((quote: Quote): boolean => quote.production_status.toLowerCase() === "pending").length;
    const inProgressCount = filteredQuotes.filter((quote: Quote): boolean => quote.production_status.toLowerCase() === "in_progress").length;
    const overdueCount = filteredQuotes.filter((quote: Quote): boolean => getValidityLabel(quote.valid_until).className === "text-brand-red").length;

    const { data: detailData, isLoading: isDetailLoading } = useQuery({
        queryKey: ["production-quote", selectedQuoteId],
        queryFn: (): Promise<Quote> => fetchQuote(selectedQuoteId as number),
        enabled: selectedQuoteId !== null,
    });

    const { data: historyData } = useQuery({
        queryKey: ["production-quote-history", selectedQuoteId],
        queryFn: (): Promise<QuoteHistoryResponse> => fetchQuoteHistory(selectedQuoteId as number),
        enabled: selectedQuoteId !== null,
    });

    const costMutation = useMutation({
        mutationFn: ({ quoteId, payload }: { quoteId: number; payload: QuoteCostPayload }): Promise<unknown> => costQuote(quoteId, payload),
        onSuccess: (): void => {
            toast.success("Quote costed successfully.");
            queryClient.invalidateQueries({ queryKey: ["production-my-quotes"] });
            if (selectedQuoteId !== null) {
                queryClient.invalidateQueries({ queryKey: ["production-quote", selectedQuoteId] });
                queryClient.invalidateQueries({ queryKey: ["production-quote-history", selectedQuoteId] });
            }
            setCostingQuote(null);
            setProductionCost("");
            setProductionNotes("");
        },
        onError: (): void => {
            toast.error("Unable to submit costing.");
        },
    });

    const openCostingModal = (quote: Quote): void => {
        setCostingQuote(quote);
        setProductionCost(quote.production_cost !== null && quote.production_cost !== undefined ? quote.production_cost.toString() : "");
        setProductionNotes(quote.production_notes ?? "");
    };

    const submitCosting = (): void => {
        if (!costingQuote) {
            return;
        }

        const parsedProductionCost = Number(productionCost);
        if (!Number.isFinite(parsedProductionCost) || parsedProductionCost <= 0) {
            toast.error("Enter a valid production cost greater than zero.");
            return;
        }

        costMutation.mutate({
            quoteId: costingQuote.id,
            payload: {
                production_cost: parsedProductionCost,
                notes: productionNotes.trim(),
            },
        });
    };

    return (
        <main className="bg-gray-50 min-h-screen p-8 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">My Quotes</h1>
                <p className="mt-2 text-sm text-gray-600">Production Team costing queue for incoming quotes.</p>
            </header>

            {!isLoading && (error || !data) && (
                <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                        <div>
                            <h3 className="font-semibold text-brand-red">Failed to load costing queue</h3>
                            <p className="text-sm text-gray-600 mt-1">Unable to fetch quote records right now.</p>
                        </div>
                    </div>
                </div>
            )}

            {!error && (
                <>
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <article className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Queue Total</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{totalCount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Records matching current filters</p>
                        </article>
                        <article className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Awaiting Costing</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{pendingCount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Current page count</p>
                        </article>
                        <article className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">In Costing</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{inProgressCount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Current page count</p>
                        </article>
                        <article className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Overdue Validity</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{overdueCount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Quotes past valid-until date</p>
                        </article>
                    </section>

                    <section className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
                                <p className="text-xs text-gray-500 mt-1">Quote ID, product, client, lead, or reference.</p>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search queue"
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Queue</label>
                                <p className="text-xs text-gray-500 mt-1">Production costing stage.</p>
                                <select
                                    value={queueFilter}
                                    onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                                        setQueueFilter(event.target.value as QueueFilter);
                                        setPage(1);
                                    }}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                >
                                    {queueFilterOptions.map((option): ReactElement => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {isLoading ? (
                        <section className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm flex items-center gap-2 text-gray-600">
                            <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading quote queue...</span>
                        </section>
                    ) : filteredQuotes.length > 0 ? (
                        <>
                            <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quote</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client / Lead</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product & Items</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quote Amount</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Production Cost</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Validity</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Queue Status</th>
                                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQuotes.map((quote: Quote): ReactElement => {
                                            const productionStatus = quote.production_status.toLowerCase();
                                            const validity = getValidityLabel(quote.valid_until);
                                            const lineItemsCount = quote.line_items?.length ?? 0;
                                            const customerLabel =
                                                quote.client_name ??
                                                quote.lead_name ??
                                                (quote.client !== null
                                                    ? `Client #${quote.client}`
                                                    : quote.lead !== null
                                                        ? `Lead #${quote.lead}`
                                                        : "—");

                                            return (
                                                <tr key={quote.id} className="border-b border-gray-100 last:border-0">
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-semibold">{quote.quote_id}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{customerLabel}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        <p className="font-medium text-gray-900">{quote.product_name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {lineItemsCount > 0 ? `${lineItemsCount} item${lineItemsCount === 1 ? "" : "s"}` : "Single line quote"}
                                                        </p>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{formatMoney(quote.total_amount)}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{formatMoney(quote.production_cost)}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        <p>{formatDate(quote.valid_until)}</p>
                                                        <p className={`text-xs mt-1 ${validity.className}`}>{validity.label}</p>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getQueueBadgeClass(
                                                                productionStatus
                                                            )}`}
                                                        >
                                                            {productionStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={(): void => setSelectedQuoteId(quote.id)}
                                                                className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                                                            >
                                                                View
                                                            </button>
                                                            {canCostQuote(quote) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(): void => openCostingModal(quote)}
                                                                    className="text-sm font-semibold text-brand-yellow hover:text-brand-yellow/80"
                                                                >
                                                                    Cost Quote
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </section>

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
                        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900">No queue records found</h3>
                            <p className="text-sm text-gray-600 mt-2">Try changing the queue filter or search criteria.</p>
                        </section>
                    )}
                </>
            )}

            {costingQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <section className="w-full max-w-xl rounded-lg border border-gray-200 bg-white shadow-2xl">
                        <header className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Cost Quote</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {costingQuote.quote_id} · {costingQuote.product_name}
                            </p>
                        </header>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Production Cost (KES)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={productionCost}
                                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setProductionCost(event.target.value)}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    placeholder="Enter total production cost"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Production Notes</label>
                                <textarea
                                    value={productionNotes}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => setProductionNotes(event.target.value)}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    placeholder="Optional costing notes"
                                />
                            </div>
                        </div>
                        <footer className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={(): void => setCostingQuote(null)}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitCosting}
                                disabled={costMutation.isPending}
                                className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {costMutation.isPending ? "Saving..." : "Submit Costing"}
                            </button>
                        </footer>
                    </section>
                </div>
            )}

            <QuoteDetailDrawer
                quote={detailData ?? null}
                history={historyData?.history ?? []}
                isOpen={selectedQuoteId !== null}
                isLoading={isDetailLoading}
                onClose={(): void => setSelectedQuoteId(null)}
            />
        </main>
    );
}
