import type { ReactElement } from "react";
import type { Client } from "@/types/clients";

interface ClientsTableProps {
    clients: Client[];
    onView: (client: Client) => void;
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
    pendingClientId: number | null;
    pendingAction: "delete" | "edit" | null;
}

const statusStyles: Record<string, string> = {
    Active: "bg-brand-green/10 text-brand-green",
    Dormant: "bg-brand-yellow/20 text-brand-black",
    Inactive: "bg-brand-red/10 text-brand-red",
};

export default function ClientsTable({
    clients,
    onView,
    onEdit,
    onDelete,
    pendingClientId,
    pendingAction,
}: ClientsTableProps): ReactElement {
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
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client: Client): ReactElement => {
                        const isRowBusy = pendingClientId === client.id;

                        return (
                            <tr key={client.id} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">{client.client_id}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{client.name}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{client.email || "—"}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{client.phone || "—"}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{client.client_type}</td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(client.status)}`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">{formatDate(client.created_at)}</td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={(): void => onView(client)}
                                            disabled={isRowBusy}
                                            className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 disabled:opacity-50"
                                        >
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(): void => onEdit(client)}
                                            disabled={isRowBusy}
                                            className="text-sm font-semibold text-gray-700 hover:text-gray-900 disabled:opacity-50"
                                        >
                                            {isRowBusy && pendingAction === "edit" ? "Saving..." : "Edit"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(): void => onDelete(client)}
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
