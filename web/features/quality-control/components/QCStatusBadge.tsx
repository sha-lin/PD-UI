import type { ReactElement } from "react";
import { QCStatus } from "@/types/quality-control";

interface QCStatusBadgeProps {
    status: QCStatus;
}

export default function QCStatusBadge({ status }: QCStatusBadgeProps): ReactElement {
    const styles: Record<QCStatus, string> = {
        pending: "bg-gray-100 text-gray-700",
        passed: "bg-brand-green/10 text-brand-green",
        failed: "bg-brand-red/10 text-brand-red",
        rework: "bg-brand-orange/10 text-brand-orange",
    };

    const labels: Record<QCStatus, string> = {
        pending: "Pending",
        passed: "Passed",
        failed: "Failed",
        rework: "Rework",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
