"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Download, FileText, Calendar, Hash, Mail, Phone, MapPin } from "lucide-react";
import { fetchQuoteByToken, acceptQuoteByToken, rejectQuoteByToken } from "@/services/quotes";
import type { Quote } from "@/types/quotes";

export default function QuoteAcceptancePage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [rejected, setRejected] = useState(false);

    const { data: quote, isLoading, error } = useQuery({
        queryKey: ["quote-public", token],
        queryFn: () => fetchQuoteByToken(token),
        enabled: !!token,
        retry: 1,
    });

    const acceptMutation = useMutation({
        mutationFn: () => acceptQuoteByToken(token),
        onSuccess: () => {
            setAccepted(true);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (reason: string) => rejectQuoteByToken(token, reason),
        onSuccess: () => {
            setRejected(true);
            setShowRejectModal(false);
        },
    });

    const formatCurrency = (value: number | null) => {
        if (value === null) return "N/A";
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 to-brand-yellow/5 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading quote...</p>
                </div>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 to-brand-yellow/5 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This quote link is invalid or has expired. Please contact us for assistance.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                        <p className="flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" />
                            info@printduka.co.ke
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" />
                            +254 700 000 000
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (accepted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-brand-yellow/5 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                    <CheckCircle2 className="w-20 h-20 text-brand-green mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Quote Accepted!</h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for accepting our quote. Our team will contact you shortly to proceed with your order.
                    </p>
                    <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-4 mb-6">
                        <p className="font-semibold text-brand-blue mb-1">Quote Reference</p>
                        <p className="text-2xl font-mono font-bold text-gray-900">{quote.quote_id}</p>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                        <p>You will receive a confirmation email shortly.</p>
                        <p>Our team will be in touch within 24 hours.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (rejected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-brand-blue/5 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                    <XCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Quote Declined</h1>
                    <p className="text-gray-600 mb-6">
                        We've received your response. Thank you for considering Print Duka.
                    </p>
                    <p className="text-sm text-gray-500">
                        If you change your mind or need a revised quote, please don't hesitate to contact us.
                    </p>
                </div>
            </div>
        );
    }

    const canAccept = quote.status === "Sent to Customer" || quote.status === "Costed";
    const alreadyProcessed = quote.status === "Approved" || quote.status === "Lost";

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 to-brand-yellow/5">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-brand-blue mb-1">Print Duka</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Quote Reference</p>
                            <p className="text-xl font-mono font-bold text-gray-900">{quote.quote_id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {alreadyProcessed && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800 font-medium">
                            This quote has already been {quote.status === "Approved" ? "accepted" : "declined"}.
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Quote Header Info */}
                    <div className="bg-brand-blue text-white p-6">
                        <h2 className="text-2xl font-bold mb-4">Quotation Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-brand-yellow text-xs font-medium mb-1">QUOTE DATE</p>
                                <p className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(quote.quote_date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-brand-yellow text-xs font-medium mb-1">VALID UNTIL</p>
                                <p className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(quote.valid_until)}
                                </p>
                            </div>
                            <div>
                                <p className="text-brand-yellow text-xs font-medium mb-1">STATUS</p>
                                <p className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {quote.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase">#</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Product</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quote.line_items && quote.line_items.length > 0 ? (
                                        quote.line_items.map((item, index) => (
                                            <tr key={item.id} className="border-b border-gray-100">
                                                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                                    {item.customization_level_snapshot && (
                                                        <p className="text-xs text-gray-500">{item.customization_level_snapshot}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                    {formatCurrency(Number(item.unit_price))}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(Number(item.unit_price) * item.quantity)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No items found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 p-6 border-t border-gray-200">
                        <div className="max-w-md ml-auto space-y-2">
                            {quote.include_vat && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">VAT ({quote.tax_rate}%)</span>
                                    <span className="text-gray-900">Included</span>
                                </div>
                            )}
                            {quote.shipping_charges && quote.shipping_charges > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900">{formatCurrency(quote.shipping_charges)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300">
                                <span className="text-gray-900">Total Amount</span>
                                <span className="text-brand-blue">{formatCurrency(quote.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {(quote.customer_notes || quote.custom_terms) && (
                        <div className="p-6 border-t border-gray-200 space-y-4">
                            {quote.customer_notes && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.customer_notes}</p>
                                </div>
                            )}
                            {quote.custom_terms && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.custom_terms}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!alreadyProcessed && canAccept && (
                        <div className="bg-gray-50 p-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => acceptMutation.mutate()}
                                    disabled={acceptMutation.isPending}
                                    className="px-8 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {acceptMutation.isPending ? "Processing..." : "Accept Quote"}
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={rejectMutation.isPending}
                                    className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Decline Quote
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div className="mt-8 text-center text-sm text-gray-600">
                    <p className="mb-2">Questions? Contact us:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="mailto:info@printduka.co.ke" className="flex items-center gap-1 hover:text-brand-blue">
                            <Mail className="w-4 h-4" />
                            info@printduka.co.ke
                        </a>
                        <a href="tel:+254700000000" className="flex items-center gap-1 hover:text-brand-blue">
                            <Phone className="w-4 h-4" />
                            +254 700 000 000
                        </a>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="border-b border-gray-200 p-4">
                            <h3 className="text-lg font-semibold text-gray-900">Decline Quote</h3>
                        </div>
                        <div className="p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason (Optional)
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please let us know why you're declining..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                            />
                        </div>
                        <div className="border-t border-gray-200 p-4 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => rejectMutation.mutate(rejectReason)}
                                disabled={rejectMutation.isPending}
                                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {rejectMutation.isPending ? "Processing..." : "Decline Quote"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
