import { X, Download, Copy, Send, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import type { MultiProductQuote, QuoteLineItemDetailed } from "@/types/quotes";

interface QuoteDetailModalProps {
    quote: MultiProductQuote | null;
    onClose: () => void;
    onSendToPT: (quoteId: number) => void;
    onSendToCustomer: (quoteId: number) => void;
    onMarkLost: (quoteId: number) => void;
    onConvertToJob: (quoteId: number) => void;
    onDownloadPdf: (quoteId: string) => void;
}

export default function QuoteDetailModal({
    quote,
    onClose,
    onSendToPT,
    onSendToCustomer,
    onMarkLost,
    onConvertToJob,
    onDownloadPdf,
}: QuoteDetailModalProps) {
    if (!quote) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 2,
        }).format(value);
    };

    const getStatusBadgeClass = (status: string): string => {
        const baseClasses = "px-3 py-1 text-sm font-medium rounded-full inline-flex items-center gap-2";

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">{quote.quote_id}</h2>
                        <p className="text-sm text-gray-600 mt-1">{quote.client_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={getStatusBadgeClass(quote.status)}>{quote.status}</span>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Account Manager
                            </p>
                            <p className="text-sm text-gray-900">{quote.account_manager}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Created Date
                            </p>
                            <p className="text-sm text-gray-900">{quote.created_date}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Valid Until
                            </p>
                            <p className="text-sm text-gray-900">{quote.valid_until}</p>
                            {quote.days_remaining > 0 && quote.days_remaining <= 7 && (
                                <p className="text-xs text-yellow-600">{quote.days_remaining} days left</p>
                            )}
                            {quote.days_remaining <= 0 && (
                                <p className="text-xs text-red-600">Expired</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Line Items</h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Product
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Quantity
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Unit Price
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Discount
                                        </th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Line Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quote.line_items && quote.line_items.length > 0 ? (
                                        quote.line_items.map((item: QuoteLineItemDetailed) => (
                                            <tr key={item.id} className="border-b border-gray-200">
                                                <td className="py-3 px-4">
                                                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                                    {item.customization_level_snapshot && (
                                                        <p className="text-xs text-gray-500">{item.customization_level_snapshot}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">{item.quantity}</td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {typeof item.unit_price === "number"
                                                        ? formatCurrency(item.unit_price)
                                                        : "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {item.discount_amount > 0
                                                        ? item.discount_type === "percent"
                                                            ? `${item.discount_amount}%`
                                                            : formatCurrency(item.discount_amount)
                                                        : "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                                                    {formatCurrency(item.line_total)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                                                No line items available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-900">{formatCurrency(quote.subtotal)}</span>
                        </div>
                        {quote.discount_total > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discount</span>
                                <span className="font-medium text-red-600">
                                    -{formatCurrency(quote.discount_total)}
                                </span>
                            </div>
                        )}
                        {quote.include_vat && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax ({quote.tax_rate}%)</span>
                                <span className="font-medium text-gray-900">{formatCurrency(quote.tax_total)}</span>
                            </div>
                        )}
                        {quote.shipping_charges > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(quote.shipping_charges)}
                                </span>
                            </div>
                        )}
                        {quote.adjustment_amount !== 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Adjustment
                                    {quote.adjustment_reason && ` (${quote.adjustment_reason})`}
                                </span>
                                <span
                                    className={`font-medium ${quote.adjustment_amount > 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {quote.adjustment_amount > 0 ? "+" : ""}
                                    {formatCurrency(quote.adjustment_amount)}
                                </span>
                            </div>
                        )}
                        <div className="border-t border-gray-300 pt-3 flex justify-between">
                            <span className="text-base font-semibold text-gray-900">Total Amount</span>
                            <span className="text-lg font-bold text-brand-blue">
                                {formatCurrency(quote.total_value)}
                            </span>
                        </div>
                    </div>

                    {quote.notes && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
                        </div>
                    )}

                    {quote.loss_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-semibold text-red-900 mb-1">Loss Reason</h3>
                                    <p className="text-sm text-red-700">{quote.loss_reason}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={() => onDownloadPdf(quote.quote_id)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>

                        {quote.status === "Draft" && (
                            <button
                                onClick={() => onSendToPT(quote.id)}
                                className="px-4 py-2 text-sm bg-brand-yellow text-brand-black hover:bg-yellow-500 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send to Production Team
                            </button>
                        )}

                        {quote.status === "Costed" && (
                            <button
                                onClick={() => onSendToCustomer(quote.id)}
                                className="px-4 py-2 text-sm bg-brand-blue text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send to Customer
                            </button>
                        )}

                        {quote.status === "Approved" && (
                            <button
                                onClick={() => onConvertToJob(quote.id)}
                                className="px-4 py-2 text-sm bg-brand-green text-white hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Convert to Job
                            </button>
                        )}

                        {quote.status !== "Approved" && quote.status !== "Lost" && (
                            <button
                                onClick={() => onMarkLost(quote.id)}
                                className="px-4 py-2 text-sm bg-brand-red text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Mark as Lost
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
