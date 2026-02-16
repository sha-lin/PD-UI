import type { ReactElement } from "react";
import type { Quote, QuoteHistoryItem } from "@/types/quotes";

interface QuoteDetailDrawerProps {
    quote: Quote | null;
    history: QuoteHistoryItem[];
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
}

export default function QuoteDetailDrawer({
    quote,
    history,
    isOpen,
    isLoading,
    onClose,
}: QuoteDetailDrawerProps): ReactElement | null {
    if (!isOpen) {
        return null;
    }

    const formatDate = (value: string): string =>
        new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatMoney = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined) {
            return "—";
        }

        if (typeof value === "number") {
            return `KES ${value.toFixed(2)}`;
        }

        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            return "—";
        }

        return `KES ${parsed.toFixed(2)}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
            <aside className="h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Quote Detail</h2>
                        <p className="text-sm text-gray-600 mt-1">Review quote summary and activity history.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                        Close
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {isLoading || !quote ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-56"></div>
                            <div className="h-4 bg-gray-200 rounded w-80"></div>
                            <div className="h-28 bg-gray-100 rounded"></div>
                        </div>
                    ) : (
                        <>
                            <section className="rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Quote ID</p>
                                        <p className="font-semibold text-gray-900">{quote.quote_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <p className="font-semibold text-gray-900">{quote.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Product</p>
                                        <p className="font-semibold text-gray-900">{quote.product_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Amount</p>
                                        <p className="font-semibold text-gray-900">{formatMoney(quote.total_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Payment Terms</p>
                                        <p className="font-semibold text-gray-900">{quote.payment_terms || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Production Status</p>
                                        <p className="font-semibold text-gray-900">{quote.production_status || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Quantity</p>
                                        <p className="font-semibold text-gray-900">{quote.quantity ?? "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Unit Price</p>
                                        <p className="font-semibold text-gray-900">{formatMoney(quote.unit_price)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Quote Date</p>
                                        <p className="font-semibold text-gray-900">{formatDate(quote.quote_date || quote.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Valid Until</p>
                                        <p className="font-semibold text-gray-900">{quote.valid_until ? formatDate(quote.valid_until) : "—"}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Activity History</h3>
                                {history.length === 0 ? (
                                    <p className="text-sm text-gray-600 mt-3">No activity history found.</p>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        {history.map((item: QuoteHistoryItem): ReactElement => (
                                            <article key={item.id} className="rounded-md border border-gray-200 p-3">
                                                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{item.activity_type} · {formatDate(item.created_at)}</p>
                                                <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}
