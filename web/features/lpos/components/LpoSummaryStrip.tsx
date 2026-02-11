import { LPOSummary } from "@/types/lpos";

interface LpoSummaryStripProps {
    summary: LPOSummary;
}

export default function LpoSummaryStrip({ summary }: LpoSummaryStripProps) {
    const formatAmount = (value: number): string => `KES ${value.toLocaleString()}`;

    const items = [
        {
            label: "Total LPO Value",
            value: formatAmount(summary.total_amount),
            helper: `${summary.total_count} total`,
        },
        {
            label: "Pending",
            value: formatAmount(summary.pending_amount),
            helper: `${summary.pending_count} pending`,
        },
        {
            label: "Approved",
            value: formatAmount(summary.approved_amount),
            helper: `${summary.approved_count} approved`,
        },
        {
            label: "Completed",
            value: formatAmount(summary.completed_amount),
            helper: `${summary.completed_count} completed`,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.label}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">{item.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.helper}</div>
                </div>
            ))}
        </div>
    );
}
