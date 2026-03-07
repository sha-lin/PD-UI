import { X } from "lucide-react";
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
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadgeClass = (status: string): string => {
        const baseClasses = "px-3 py-1 text-xs font-medium rounded";

        switch (status) {
            case "Draft":
                return `${baseClasses} bg-gray-100 text-gray-700`;
            case "Sent to PT":
                return `${baseClasses} bg-brand-yellow/20 text-brand-black`;
            case "Costed":
                return `${baseClasses} bg-brand-blue/10 text-brand-blue`;
            case "Sent to Customer":
                return `${baseClasses} bg-brand-purple/10 text-brand-purple`;
            case "Approved":
                return `${baseClasses} bg-brand-green/10 text-brand-green`;
            case "Lost":
                return `${baseClasses} bg-brand-red/10 text-brand-red`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-500`;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{quote.quote_id}</h2>
                            <p className="text-sm text-gray-600 mt-1">{quote.client_name || "—"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{quote.created_date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={getStatusBadgeClass(quote.status)}>
                                {quote.status}
                            </span>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                type="button"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Quick Info */}
                    <div className="grid grid-cols-4 gap-3 pb-4 border-b border-gray-200">
                        <div>
                            <p className="text-xs text-gray-500">Items</p>
                            <p className="text-lg font-semibold text-gray-900">{quote.item_count}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(quote.total_value)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Margin</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {quote.margin > 0 ? `${quote.margin.toFixed(1)}%` : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Valid Until</p>
                            <p className="text-sm font-semibold text-gray-900">{quote.valid_until}</p>
                            {quote.days_remaining > 0 && quote.days_remaining <= 7 && (
                                <p className="text-xs text-brand-yellow mt-0.5">{quote.days_remaining}d left</p>
                            )}
                            {quote.days_remaining <= 0 && (
                                <p className="text-xs text-brand-red mt-0.5">Expired</p>
                            )}
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Line Items</h3>
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">Product</th>
                                        <th className="text-center py-2 px-3 text-xs font-medium text-gray-600">Qty</th>
                                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-600">Unit Price</th>
                                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-600">Discount</th>
                                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quote.line_items && quote.line_items.length > 0 ? (
                                        quote.line_items.map((item: QuoteLineItemDetailed) => (
                                            <tr key={item.id} className="border-b border-gray-100 last:border-0">
                                                <td className="py-2 px-3">
                                                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                                    {item.customization_level_snapshot && (
                                                        <p className="text-xs text-gray-500">{item.customization_level_snapshot}</p>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-center">{item.quantity}</td>
                                                <td className="py-2 px-3 text-right">
                                                    {typeof item.unit_price === "number"
                                                        ? formatCurrency(Number(item.unit_price))
                                                        : "—"}
                                                </td>
                                                <td className="py-2 px-3 text-right">
                                                    {Number(item.discount_amount) > 0
                                                        ? item.discount_type === "percent"
                                                            ? `${item.discount_amount}%`
                                                            : formatCurrency(Number(item.discount_amount))
                                                        : "—"}
                                                </td>
                                                <td className="py-2 px-3 text-right font-medium">
                                                    {formatCurrency(Number(item.line_total))}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                                                No line items available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="bg-gray-50 rounded p-3 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Pricing Summary</h3>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                            </div>
                            {quote.discount_total > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-medium text-brand-red">-{formatCurrency(quote.discount_total)}</span>
                                </div>
                            )}
                            {quote.include_vat && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax ({quote.tax_rate}%)</span>
                                    <span className="font-medium">{formatCurrency(quote.tax_total)}</span>
                                </div>
                            )}
                            {quote.shipping_charges > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">{formatCurrency(quote.shipping_charges)}</span>
                                </div>
                            )}
                            {quote.adjustment_amount !== 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Adjustment
                                        {quote.adjustment_reason && ` (${quote.adjustment_reason})`}
                                    </span>
                                    <span className={`font-medium ${quote.adjustment_amount > 0 ? "text-brand-green" : "text-brand-red"}`}>
                                        {quote.adjustment_amount > 0 ? "+" : ""}
                                        {formatCurrency(quote.adjustment_amount)}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-brand-blue">
                                    {formatCurrency(quote.total_value)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Terms */}
                    {(quote.notes || quote.custom_terms) && (
                        <div className="space-y-3">
                            {quote.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                    <h3 className="text-xs font-semibold text-brand-blue mb-1">Notes</h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                                </div>
                            )}
                            {quote.custom_terms && (
                                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                    <h3 className="text-xs font-semibold text-brand-purple mb-1">Terms</h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.custom_terms}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loss Reason */}
                    {quote.loss_reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                            <h3 className="text-xs font-semibold text-brand-red mb-1">Loss Reason</h3>
                            <p className="text-sm text-red-700 whitespace-pre-wrap">{quote.loss_reason}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <button
                            onClick={(): void => onDownloadPdf(quote.quote_id)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            type="button"
                        >
                            Download PDF
                        </button>

                        <div className="flex items-center gap-2">
                            {quote.status === "Draft" && (
                                <button
                                    onClick={(): void => onSendToPT(quote.id)}
                                    className="px-4 py-2 text-sm font-medium bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 rounded transition-colors"
                                    type="button"
                                >
                                    Send to Production Team
                                </button>
                            )}

                            {quote.status === "Costed" && (
                                <button
                                    onClick={(): void => onSendToCustomer(quote.id)}
                                    className="px-4 py-2 text-sm font-medium bg-brand-purple text-white hover:bg-brand-purple/90 rounded transition-colors"
                                    type="button"
                                >
                                    Send to Customer
                                </button>
                            )}

                            {quote.status === "Approved" && (
                                <button
                                    onClick={(): void => onConvertToJob(quote.id)}
                                    className="px-4 py-2 text-sm font-medium bg-brand-green text-white hover:bg-brand-green/90 rounded transition-colors"
                                    type="button"
                                >
                                    Convert to Job
                                </button>
                            )}

                            {quote.status !== "Approved" && quote.status !== "Lost" && (
                                <button
                                    onClick={(): void => onMarkLost(quote.id)}
                                    className="px-4 py-2 text-sm font-medium bg-brand-red text-white hover:bg-brand-red/90 rounded transition-colors"
                                    type="button"
                                >
                                    Mark as Lost
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
