import { DeliveriesSummary } from "@/types/deliveries";

interface DeliveriesSummaryStripProps {
    summary: DeliveriesSummary;
}

export default function DeliveriesSummaryStrip({ summary }: DeliveriesSummaryStripProps) {
    const items = [
        {
            label: "Total",
            value: summary.total_count.toLocaleString(),
            helper: `${summary.failed_count} failed`,
        },
        {
            label: "Staged",
            value: summary.staged_count.toLocaleString(),
            helper: "Awaiting pickup",
        },
        {
            label: "In Transit",
            value: summary.in_transit_count.toLocaleString(),
            helper: `${summary.urgent_count} urgent`,
        },
        {
            label: "Delivered",
            value: summary.delivered_count.toLocaleString(),
            helper: `${summary.handoff_confirmed_count} handoff confirmed`,
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
