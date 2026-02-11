import type { ReactElement } from "react";

interface ProcessesSummary {
    totalVisible: number;
    activeVisible: number;
    tierVisible: number;
    formulaVisible: number;
}

interface ProcessesSummaryStripProps {
    summary: ProcessesSummary;
}

interface SummaryItem {
    label: string;
    value: number;
    helper: string;
}

export default function ProcessesSummaryStrip({ summary }: ProcessesSummaryStripProps): ReactElement {
    const items: SummaryItem[] = [
        { label: "Visible", value: summary.totalVisible, helper: "Processes in view" },
        { label: "Active", value: summary.activeVisible, helper: "Active status" },
        { label: "Tier", value: summary.tierVisible, helper: "Tier-based" },
        { label: "Formula", value: summary.formulaVisible, helper: "Formula-based" },
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
