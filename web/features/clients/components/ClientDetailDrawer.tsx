import type { ReactElement } from "react";
import type { BrandAsset, Client, ClientContact, ComplianceDocument } from "@/types/clients";

interface ClientDetailDrawerProps {
    client: Client | null;
    contacts: ClientContact[];
    brandAssets: BrandAsset[];
    complianceDocuments: ComplianceDocument[];
    isOpen: boolean;
    isLoading: boolean;
    isLoadingRelations: boolean;
    onClose: () => void;
    onEdit: (client: Client) => void;
}

export default function ClientDetailDrawer({
    client,
    contacts,
    brandAssets,
    complianceDocuments,
    isOpen,
    isLoading,
    isLoadingRelations,
    onClose,
    onEdit,
}: ClientDetailDrawerProps): ReactElement | null {
    if (!isOpen) {
        return null;
    }

    const formatDate = (value: string): string =>
        new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatAmount = (value: number | string): string => {
        const parsed = typeof value === "number" ? value : Number(value);
        if (!Number.isFinite(parsed)) {
            return "—";
        }
        return parsed.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
            <aside className="h-full w-full max-w-3xl bg-white shadow-2xl overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Client Detail</h2>
                        <p className="text-sm text-gray-600 mt-1">Review account profile and related records.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                        Close
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {isLoading || client === null ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-56"></div>
                            <div className="h-4 bg-gray-200 rounded w-80"></div>
                            <div className="h-28 bg-gray-100 rounded"></div>
                        </div>
                    ) : (
                        <>
                            <section className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Summary</h3>
                                    <button
                                        type="button"
                                        onClick={(): void => onEdit(client)}
                                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700"
                                    >
                                        Edit Client
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Client ID</p>
                                        <p className="font-semibold text-gray-900">{client.client_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <p className="font-semibold text-gray-900">{client.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Type</p>
                                        <p className="font-semibold text-gray-900">{client.client_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-semibold text-gray-900">{client.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Company</p>
                                        <p className="font-semibold text-gray-900">{client.company || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-semibold text-gray-900">{client.email || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Phone</p>
                                        <p className="font-semibold text-gray-900">{client.phone || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Preferred Channel</p>
                                        <p className="font-semibold text-gray-900">{client.preferred_channel || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Payment Terms</p>
                                        <p className="font-semibold text-gray-900">{client.payment_terms || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Credit Limit</p>
                                        <p className="font-semibold text-gray-900">{formatAmount(client.credit_limit)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Markup %</p>
                                        <p className="font-semibold text-gray-900">{formatAmount(client.default_markup)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Risk Rating</p>
                                        <p className="font-semibold text-gray-900">{client.risk_rating || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Created</p>
                                        <p className="font-semibold text-gray-900">{formatDate(client.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Last Activity</p>
                                        <p className="font-semibold text-gray-900">{formatDate(client.last_activity)}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Related Records</h3>
                                {isLoadingRelations ? (
                                    <p className="text-sm text-gray-600 mt-3">Loading related records...</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                        <div className="rounded-md bg-gray-50 p-3 border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Contacts</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{contacts.length}</p>
                                            <p className="text-xs text-gray-600 mt-2">
                                                {contacts[0]?.full_name ? `Primary: ${contacts[0].full_name}` : "No contacts"}
                                            </p>
                                        </div>
                                        <div className="rounded-md bg-gray-50 p-3 border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Brand Assets</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{brandAssets.length}</p>
                                            <p className="text-xs text-gray-600 mt-2">
                                                {brandAssets[0]?.asset_type ? `Latest: ${brandAssets[0].asset_type}` : "No assets"}
                                            </p>
                                        </div>
                                        <div className="rounded-md bg-gray-50 p-3 border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Compliance Docs</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{complianceDocuments.length}</p>
                                            <p className="text-xs text-gray-600 mt-2">
                                                {complianceDocuments[0]?.document_type
                                                    ? `Latest: ${complianceDocuments[0].document_type}`
                                                    : "No documents"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}
