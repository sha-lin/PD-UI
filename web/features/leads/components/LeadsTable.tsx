import type { ReactElement } from "react";
import type { Lead } from "@/types/leads";

interface LeadsTableProps {
    leads: Lead[];
    onView: (lead: Lead) => void;
    pendingLeadId: number | null;
    pendingAction: "qualify" | "delete" | "convert" | "mark_lost" | "mark_contacted" | null;
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
            {/* Mobile card list */}
            <ul className="divide-y divide-gray-100 sm:hidden">
                {leads.map((lead: Lead): ReactElement => {
                    const isRowBusy = pendingLeadId === lead.id && pendingAction === "delete";
                    return (
                        <li key={lead.id} className="flex items-center justify-between px-4 py-3 gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
                                <p className="text-xs text-gray-500 truncate">{lead.lead_id}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{lead.email || lead.phone || "—"}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(lead.status)}`}>
                                    {lead.status}
                                </span>
                                <button
                                    type="button"
                                    onClick={(): void => onView(lead)}
                                    disabled={isRowBusy}
                                    className="rounded-md bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
                                >
                                    View
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* Desktop table */}
            <table className="w-full hidden sm:table">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                        <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                        <th className="hidden lg:table-cell text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                        <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="hidden lg:table-cell text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead: Lead): ReactElement => {
                        const isRowBusy = pendingLeadId === lead.id && pendingAction === "delete";

                        return (
                            <tr
                                key={lead.id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                                onClick={(): void => onView(lead)}
                            >
                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">{lead.lead_id}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{lead.name}</td>
                                <td className="hidden md:table-cell py-3 px-4 text-sm text-gray-700">{lead.email || "—"}</td>
                                <td className="hidden lg:table-cell py-3 px-4 text-sm text-gray-700">{lead.phone || "—"}</td>
                                <td className="hidden md:table-cell py-3 px-4 text-sm text-gray-700">{lead.source || "—"}</td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="hidden lg:table-cell py-3 px-4 text-sm text-gray-500">{formatDate(lead.created_at)}</td>
                                <td className="py-3 px-4 text-right" onClick={(e): void => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={(): void => onView(lead)}
                                        disabled={isRowBusy}
                                        className="rounded-md bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
