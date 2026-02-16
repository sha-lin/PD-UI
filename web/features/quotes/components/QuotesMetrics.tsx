import type { ReactElement } from "react";
import type { Quote } from "@/types/quotes";

interface QuotesMetricsProps {
    quotes: Quote[];
    totalCount: number;
}

export default function QuotesMetrics({ quotes, totalCount }: QuotesMetricsProps): ReactElement {
    const draftCount = quotes.filter((quote: Quote): boolean => quote.status === "Draft").length;
    const sentToCustomerCount = quotes.filter((quote: Quote): boolean => quote.status === "Sent to Customer").length;
    const approvedCount = quotes.filter((quote: Quote): boolean => quote.status === "Approved").length;

    const cards = [
        {
            title: "Total Quotes",
            value: totalCount.toLocaleString(),
            description: "All matching records",
        },
        {
            title: "Draft",
            value: draftCount.toLocaleString(),
            description: "In current page",
        },
        {
            title: "Sent to Customer",
            value: sentToCustomerCount.toLocaleString(),
            description: "In current page",
        },
        {
            title: "Approved",
            value: approvedCount.toLocaleString(),
            description: "In current page",
        },
    ] as const;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cards.map((card): ReactElement => (
                <div key={card.title} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.title}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
            ))}
        </div>
    );
}
