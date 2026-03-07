import { useState, useRef, useEffect } from "react";
import { Eye, Download, FileEdit, Copy, CheckCircle, XCircle, Clock, AlertCircle, MoreVertical } from "lucide-react";
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
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const clickedButton = Object.values(buttonRefs.current).some(btn => btn?.contains(target));
            if (!clickedButton && openMenuId) {
                const dropdown = document.getElementById(`dropdown-${openMenuId}`);
                if (dropdown && !dropdown.contains(target)) {
                    setOpenMenuId(null);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenuId]);

    const handleMenuToggle = (quoteId: string, buttonElement: HTMLButtonElement) => {
        if (openMenuId === quoteId) {
            setOpenMenuId(null);
        } else {
            const rect = buttonElement.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY + 4,
                right: window.innerWidth - rect.right + window.scrollX,
            });
            setOpenMenuId(quoteId);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadgeClass = (status: QuoteStatus): string => {
        const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";

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
        if (margin >= 25) return "text-brand-green";
        if (margin >= 15) return "text-brand-yellow";
        return "text-brand-red";
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Quote #
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Client
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Items
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Total Value
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Margin
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Status
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Valid Until
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map((quote) => (
                            <tr
                                key={quote.quote_id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                            >
                                <td className="py-3 px-4">
                                    <div className="font-semibold text-gray-900 text-sm">{quote.quote_id}</div>
                                    <div className="text-xs text-gray-500">{quote.created_date}</div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {quote.client_name || "—"}
                                </td>
                                <td className="py-3 px-4">
                                    {quote.item_count > 0 ? (
                                        <span className="text-sm text-gray-900 font-medium">
                                            {quote.item_count}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500">—</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    {quote.total_value > 0 ? (
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(quote.total_value)}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500">—</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    {quote.margin > 0 ? (
                                        <span className={`text-sm font-semibold ${getMarginColorClass(quote.margin)}`}>
                                            {quote.margin.toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500">—</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={getStatusBadgeClass(quote.status)}>
                                        {getStatusIcon(quote.status)}
                                        {quote.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div>
                                        <div className="text-sm text-gray-900">{quote.valid_until}</div>
                                        {quote.days_remaining > 0 && quote.days_remaining <= 7 && (
                                            <div className="text-xs text-brand-yellow">{quote.days_remaining} days left</div>
                                        )}
                                        {quote.days_remaining <= 0 && (
                                            <div className="text-xs text-brand-red">Expired</div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        ref={(el): void => { buttonRefs.current[quote.quote_id] = el; }}
                                        onClick={(e): void => handleMenuToggle(quote.quote_id, e.currentTarget)}
                                        className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                                        type="button"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {openMenuId && (
                <div
                    id={`dropdown-${openMenuId}`}
                    className="fixed w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                    style={{
                        top: `${menuPosition.top}px`,
                        right: `${menuPosition.right}px`,
                    }}
                >
                    {quotes
                        .filter((q) => q.quote_id === openMenuId)
                        .map((quote) => (
                            <div key={quote.quote_id}>
                                <button
                                    onClick={(): void => {
                                        onViewDetail(quote);
                                        setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    type="button"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={(): void => {
                                        onDownloadPdf(quote.quote_id);
                                        setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    type="button"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={(): void => {
                                        onClone(quote.id);
                                        setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    type="button"
                                >
                                    <Copy className="w-4 h-4" />
                                    Clone
                                </button>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
