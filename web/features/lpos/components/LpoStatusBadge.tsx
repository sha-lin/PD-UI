import { LPOStatus } from "@/types/lpos";

interface LpoStatusBadgeProps {
    status: LPOStatus;
}

export default function LpoStatusBadge({ status }: LpoStatusBadgeProps) {
    const styles: Record<LPOStatus, string> = {
        pending: "bg-brand-yellow/10 text-brand-yellow",
        approved: "bg-brand-blue/10 text-brand-blue",
        in_production: "bg-brand-purple/10 text-brand-purple",
        completed: "bg-brand-green/10 text-brand-green",
        cancelled: "bg-gray-200 text-gray-700",
    };

    const labels: Record<LPOStatus, string> = {
        pending: "Pending",
        approved: "Approved",
        in_production: "In Production",
        completed: "Completed",
        cancelled: "Cancelled",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
