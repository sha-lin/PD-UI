import { Payment, PaymentMethod } from "@/types/payments";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface PaymentDetailsPanelProps {
    payment: Payment | null;
    onClose: () => void;
}

export default function PaymentDetailsPanel({ payment, onClose }: PaymentDetailsPanelProps) {
    if (!payment) {
        return null;
    }

    const methodLabels: Record<PaymentMethod, string> = {
        cash: "Cash",
        mpesa: "M-Pesa",
        bank_transfer: "Bank Transfer",
        cheque: "Cheque",
        credit_card: "Credit Card",
    };

    const formatAmount = (value: number): string => `KES ${value.toLocaleString()}`;

    const formatDate = (value: string): string => {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-black/30"
                aria-label="Close payment details"
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Details</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">
                            {payment.reference_number || "Payment"}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                    >
                        Close
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {payment.client_name || "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">LPO Number</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {payment.lpo_number || "—"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {formatAmount(payment.amount)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Method</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {methodLabels[payment.payment_method]}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                        <div className="mt-2">
                            <PaymentStatusBadge status={payment.status} />
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Date</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                            {formatDate(payment.payment_date)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</div>
                        <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {payment.notes || "No notes recorded."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
