import { DeliveryStatus } from "@/types/deliveries";

interface DeliveryStatusBadgeProps {
    status: DeliveryStatus;
}

export default function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
    const styles: Record<DeliveryStatus, string> = {
        staged: "bg-brand-yellow/10 text-brand-yellow",
        in_transit: "bg-brand-blue/10 text-brand-blue",
        delivered: "bg-brand-green/10 text-brand-green",
        failed: "bg-brand-red/10 text-brand-red",
    };

    const labels: Record<DeliveryStatus, string> = {
        staged: "Staged",
        in_transit: "In Transit",
        delivered: "Delivered",
        failed: "Failed",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
