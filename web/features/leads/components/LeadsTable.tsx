import type { ReactElement } from "react";
import type { Lead } from "@/types/leads";

interface LeadsTableProps {
    leads: Lead[];
    onView: (lead: Lead) => void;
    onQualify: (lead: Lead) => void;
    onDelete: (lead: Lead) => void;
    pendingLeadId: number | null;
    pendingAction: "qualify" | "delete" | "convert" | null;
}

const statusStyles: Record<string, string> = {
    New: "bg-gray-100 text-gray-700",
    Contacted: "bg-brand-yellow/20 text-brand-black",
    Qualified: "bg-brand-blue/10 text-brand-blue",
    Converted: "bg-brand-green/10 text-brand-green",
    Lost: "bg-brand-red/10 text-brand-red",
};

export default function LeadsTable({
    leads,
    onView,
    onQualify,
    onDelete,
    pendingLeadId,
    pendingAction,
}: LeadsTableProps): ReactElement {
    const formatDate = (value: string): string =>
        new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });

    const getStatusClass = (status: string): string => {
        return statusStyles[status] ?? "bg-gray-100 text-gray-700";
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead: Lead): ReactElement => {
                        const isRowBusy = pendingLeadId === lead.id;

                        return (
                            <tr key={lead.id} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">{lead.lead_id}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{lead.name}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{lead.email || "—"}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{lead.phone || "—"}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{lead.source || "—"}</td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">{formatDate(lead.created_at)}</td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={(): void => onView(lead)}
                                            disabled={isRowBusy}
                                            className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 disabled:opacity-50"
                                        >
                                            View
                                        </button>
                                        {lead.status === "New" && (
                                            <button
                                                type="button"
                                                onClick={(): void => onQualify(lead)}
                                                disabled={isRowBusy}
                                                className="text-sm font-semibold text-brand-yellow hover:text-brand-yellow/80 disabled:opacity-50"
                                            >
                                                {isRowBusy && pendingAction === "qualify" ? "Qualifying..." : "Qualify"}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(): void => onDelete(lead)}
                                            disabled={isRowBusy}
                                            className="text-sm font-semibold text-brand-red hover:text-brand-red/80 disabled:opacity-50"
                                        >
                                            {isRowBusy && pendingAction === "delete" ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
