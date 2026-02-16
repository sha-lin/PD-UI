import type { ReactElement } from "react";
import type { Quote } from "@/types/quotes";

interface QuotesTableProps {
    quotes: Quote[];
    onView: (quote: Quote) => void;
    onSendToPT: (quote: Quote) => void;
    onSendToCustomer: (quote: Quote) => void;
    onApprove: (quote: Quote) => void;
    onClone: (quote: Quote) => void;
    onDelete: (quote: Quote) => void;
}

const statusStyles: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    "Sent to PT": "bg-brand-yellow/20 text-brand-black",
    Costed: "bg-brand-blue/10 text-brand-blue",
    "Sent to Customer": "bg-brand-purple/10 text-brand-purple",
    Approved: "bg-brand-green/10 text-brand-green",
    Lost: "bg-brand-red/10 text-brand-red",
};

export default function QuotesTable({
    quotes,
    onView,
    onSendToPT,
    onSendToCustomer,
    onApprove,
    onClone,
    onDelete,
}: QuotesTableProps): ReactElement {
    const formatDate = (value: string): string =>
        new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });

    const formatAmount = (value: number | null): string => {
        if (value === null) {
            return "—";
        }
        return `KES ${value.toFixed(2)}`;
    };

    const getStatusClass = (status: string): string => {
        return statusStyles[status] ?? "bg-gray-100 text-gray-700";
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quote</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client / Lead</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {quotes.map((quote: Quote): ReactElement => (
                        <tr key={quote.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4 text-sm text-gray-700 font-semibold">{quote.quote_id}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{quote.product_name}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {quote.client !== null ? `Client #${quote.client}` : quote.lead !== null ? `Lead #${quote.lead}` : "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{formatAmount(quote.total_amount)}</td>
                            <td className="py-3 px-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(quote.status)}`}>
                                    {quote.status}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{formatDate(quote.quote_date || quote.created_at)}</td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={(): void => onView(quote)}
                                        className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                                    >
                                        View
                                    </button>
                                    {quote.status === "Draft" && (
                                        <button
                                            type="button"
                                            onClick={(): void => onSendToPT(quote)}
                                            className="text-sm font-semibold text-brand-yellow hover:text-brand-yellow/80"
                                        >
                                            Send PT
                                        </button>
                                    )}
                                    {quote.status === "Costed" && (
                                        <button
                                            type="button"
                                            onClick={(): void => onSendToCustomer(quote)}
                                            className="text-sm font-semibold text-brand-purple hover:text-brand-purple/80"
                                        >
                                            Send Client
                                        </button>
                                    )}
                                    {quote.status === "Sent to Customer" && (
                                        <button
                                            type="button"
                                            onClick={(): void => onApprove(quote)}
                                            className="text-sm font-semibold text-brand-green hover:text-brand-green/80"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {quote.status === "Approved" && (
                                        <button
                                            type="button"
                                            onClick={(): void => onClone(quote)}
                                            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                                        >
                                            Clone
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(): void => onDelete(quote)}
                                        className="text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
