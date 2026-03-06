import { Eye, Download, FileEdit, Copy, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import type { MultiProductQuote, QuoteStatus } from "@/types/quotes";

interface MultiProductQuotesTableProps {
    quotes: MultiProductQuote[];
    onViewDetail: (quote: MultiProductQuote) => void;
    onDownloadPdf: (quoteId: string) => void;
    onClone: (quoteId: number) => void;
}

export default function MultiProductQuotesTable({
    quotes,
    onViewDetail,
    onDownloadPdf,
    onClone,
}: MultiProductQuotesTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadgeClass = (status: QuoteStatus): string => {
        const baseClasses = "px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1";

        switch (status) {
            case "Draft":
                return `${baseClasses} bg-gray-100 text-gray-700`;
            case "Sent to PT":
                return `${baseClasses} bg-yellow-100 text-yellow-700`;
            case "Costed":
                return `${baseClasses} bg-blue-100 text-blue-700`;
            case "Sent to Customer":
                return `${baseClasses} bg-purple-100 text-purple-700`;
            case "Approved":
                return `${baseClasses} bg-green-100 text-green-700`;
            case "Lost":
                return `${baseClasses} bg-red-100 text-red-700`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-500`;
        }
    };

    const getStatusIcon = (status: QuoteStatus) => {
        const iconClass = "w-3 h-3";

        switch (status) {
            case "Approved":
                return <CheckCircle className={iconClass} />;
            case "Lost":
                return <XCircle className={iconClass} />;
            case "Sent to PT":
            case "Sent to Customer":
                return <AlertCircle className={iconClass} />;
            default:
                return <Clock className={iconClass} />;
        }
    };

    const getMarginColorClass = (margin: number): string => {
        if (margin >= 25) return "text-green-600";
        if (margin >= 15) return "text-yellow-600";
        return "text-red-600";
    };

    if (quotes.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FileEdit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes found</h3>
                <p className="text-gray-600 mb-4">
                    Create your first multi-product quote to get started
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white border-b border-gray-200">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Quote #
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Client
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Account Manager
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Items
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Total Value
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Margin
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Status
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Valid Until
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map((quote) => (
                            <tr
                                key={quote.quote_id}
                                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => onViewDetail(quote)}
                            >
                                <td className="py-4 px-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{quote.quote_id}</p>
                                        <p className="text-xs text-gray-500">{quote.created_date}</p>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-900">{quote.client_name}</td>
                                <td className="py-4 px-4 text-sm text-gray-600">{quote.account_manager}</td>
                                <td className="py-4 px-4">
                                    <div>
                                        <p className="text-sm text-gray-900">
                                            {quote.item_count} {quote.item_count === 1 ? "product" : "products"}
                                        </p>
                                        {quote.approved_items > 0 && (
                                            <p className="text-xs text-green-600">{quote.approved_items} approved</p>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {quote.total_value > 0 ? (
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(quote.total_value)}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500">Pending</p>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    {quote.margin > 0 ? (
                                        <span className={`text-sm font-medium ${getMarginColorClass(quote.margin)}`}>
                                            {quote.margin.toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500">-</span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <span className={getStatusBadgeClass(quote.status)}>
                                        {getStatusIcon(quote.status)}
                                        {quote.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <div>
                                        <p className="text-sm text-gray-900">{quote.valid_until}</p>
                                        {quote.days_remaining > 0 && quote.days_remaining <= 7 && (
                                            <p className="text-xs text-yellow-600">{quote.days_remaining} days left</p>
                                        )}
                                        {quote.days_remaining <= 0 && (
                                            <p className="text-xs text-red-600">Expired</p>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetail(quote);
                                            }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            title="View Quote"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDownloadPdf(quote.quote_id);
                                            }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClone(quote.id);
                                            }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-brand-blue hover:bg-blue-50 rounded transition-colors"
                                            title="Clone Quote"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Clone
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
