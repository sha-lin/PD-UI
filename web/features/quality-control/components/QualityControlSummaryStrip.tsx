import type { ReactElement } from "react";
import { QCInspectionsSummary } from "@/types/quality-control";

interface QualityControlSummaryStripProps {
    summary: QCInspectionsSummary;
}

interface SummaryItem {
    label: string;
    value: string;
    helper: string;
}

export default function QualityControlSummaryStrip({ summary }: QualityControlSummaryStripProps): ReactElement {
    const items: SummaryItem[] = [
        {
            label: "Total",
            value: summary.total_count.toLocaleString(),
            helper: `${summary.failed_count} failed`,
        },
        {
            label: "Pending",
            value: summary.pending_count.toLocaleString(),
            helper: "Awaiting review",
        },
        {
            label: "Passed",
            value: summary.passed_count.toLocaleString(),
            helper: "Cleared for handoff",
        },
        {
            label: "Rework",
            value: summary.rework_count.toLocaleString(),
            helper: "Needs follow-up",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item: SummaryItem): ReactElement => (
                <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.label}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">{item.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.helper}</div>
                </div>
            ))}
        </div>
    );
}
