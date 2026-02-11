import { PaymentStatus } from "@/types/payments";

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    const styles: Record<PaymentStatus, string> = {
        pending: "bg-brand-yellow/10 text-brand-yellow",
        completed: "bg-brand-green/10 text-brand-green",
        failed: "bg-brand-red/10 text-brand-red",
        refunded: "bg-gray-200 text-gray-700",
    };

    const labels: Record<PaymentStatus, string> = {
        pending: "Pending",
        completed: "Completed",
        failed: "Failed",
        refunded: "Refunded",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
