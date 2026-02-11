import { Payment, PaymentMethod } from "@/types/payments";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface PaymentsTableProps {
    payments: Payment[];
    onView: (payment: Payment) => void;
}

export default function PaymentsTable({ payments, onView }: PaymentsTableProps) {
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
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">LPO</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {payment.reference_number || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {payment.lpo_number || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {payment.client_name || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                {formatAmount(payment.amount)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {methodLabels[payment.payment_method]}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <PaymentStatusBadge status={payment.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {formatDate(payment.payment_date)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    type="button"
                                    onClick={() => onView(payment)}
                                    className="text-brand-blue text-sm font-semibold hover:text-brand-blue/80"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
