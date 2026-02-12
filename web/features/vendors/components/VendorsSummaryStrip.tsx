import type { ReactElement } from "react";

interface VendorsSummary {
    totalVisible: number;
    activeVisible: number;
    recommendedVisible: number;
    averageVps: number;
}

interface VendorsSummaryStripProps {
    summary: VendorsSummary;
}

interface SummaryItem {
    label: string;
    value: string | number;
    helper: string;
}

export default function VendorsSummaryStrip({ summary }: VendorsSummaryStripProps): ReactElement {
    const items: SummaryItem[] = [
        { label: "Visible", value: summary.totalVisible, helper: "Vendors in view" },
        { label: "Active", value: summary.activeVisible, helper: "Currently active" },
        { label: "Recommended", value: summary.recommendedVisible, helper: "Marked recommended" },
        { label: "Avg VPS", value: summary.averageVps.toFixed(1), helper: "Average score" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
