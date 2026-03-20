import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import type { Lead, LeadConvertPayload } from "@/types/leads";

interface LeadDetailDrawerProps {
    lead: Lead | null;
    isOpen: boolean;
    isLoading: boolean;
    isQualifying: boolean;
    isConverting: boolean;
    isMarkingLost: boolean;
    isMarkingContacted: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onEdit: (lead: Lead) => void;
    onMarkContacted: (lead: Lead) => void;
    onQualify: (lead: Lead) => void;
    onMarkLost: (lead: Lead) => void;
    onDelete: (lead: Lead) => void;
    onConvert: (lead: Lead, payload: LeadConvertPayload) => void;
}

export default function LeadDetailDrawer({
    lead,
    isOpen,
    isLoading,
    isQualifying,
    isConverting,
    isMarkingLost,
    isMarkingContacted,
    isDeleting,
    onClose,
    onEdit,
    onMarkContacted,
    onQualify,
    onMarkLost,
    onDelete,
    onConvert,
}: LeadDetailDrawerProps): ReactElement | null {
    const [clientType, setClientType] = useState<"B2B" | "B2C">("B2C");
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [company, setCompany] = useState<string>("");
    const [vatTaxId, setVatTaxId] = useState<string>("");
    const [kraPin, setKraPin] = useState<string>("");
    const [industry, setIndustry] = useState<string>("");
    const [contactName, setContactName] = useState<string>("");
    const [contactEmail, setContactEmail] = useState<string>("");
    const [contactPhone, setContactPhone] = useState<string>("");
    const [contactRole, setContactRole] = useState<string>("");

    const shouldShowConvert = useMemo((): boolean => {
        if (lead === null) {
            return false;
        }
        return !lead.converted_to_client && lead.status !== "Converted";
    }, [lead]);

    useEffect((): void => {
        if (lead === null) {
            return;
        }

        setClientType(lead.preferred_client_type === "B2B" ? "B2B" : "B2C");
    }, [lead]);

    if (!isOpen) {
        return null;
    }

    const formatDateTime = (value: string): string =>
        new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const resetConvertForm = (): void => {
        setClientType("B2C");
        setCompany("");
        setVatTaxId("");
        setKraPin("");
        setIndustry("");
        setContactName("");
        setContactEmail("");
        setContactPhone("");
        setContactRole("");
    };

    const handleClose = (): void => {
        resetConvertForm();
        onClose();
    };

    const handleClientTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        setClientType(event.target.value as "B2B" | "B2C");
    };

    const handleSubmitConvert = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (lead === null) {
            return;
        }

        const payload: LeadConvertPayload = {
            client_type: clientType,
        };

        if (clientType === "B2B") {
            const trimmedCompany = company.trim();
            const trimmedVatTaxId = vatTaxId.trim();
            const trimmedKraPin = kraPin.trim();
            const trimmedIndustry = industry.trim();

            if (trimmedCompany) {
                payload.company = trimmedCompany;
            }
            if (trimmedVatTaxId) {
                payload.vat_tax_id = trimmedVatTaxId;
            }
            if (trimmedKraPin) {
                payload.kra_pin = trimmedKraPin;
            }
            if (trimmedIndustry) {
                payload.industry = trimmedIndustry;
            }

            const trimmedContactName = contactName.trim();
            const trimmedContactEmail = contactEmail.trim();
            const trimmedContactPhone = contactPhone.trim();
            const trimmedContactRole = contactRole.trim();

            if (trimmedContactName || trimmedContactEmail || trimmedContactPhone || trimmedContactRole) {
                payload.contacts = [
                    {
                        full_name: trimmedContactName,
                        email: trimmedContactEmail,
                        phone: trimmedContactPhone,
                        role: trimmedContactRole,
                        is_primary: true,
                    },
                ];
            }
        }

        onConvert(lead, payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
            <aside className="h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Lead Detail</h2>
                        <p className="text-sm text-gray-600 mt-1">Review profile and run lead workflow actions.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                        Close
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {isLoading || lead === null ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-56"></div>
                            <div className="h-4 bg-gray-200 rounded w-80"></div>
                            <div className="h-28 bg-gray-100 rounded"></div>
                        </div>
                    ) : (
                        <>
                            <section className="rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Lead ID</p>
                                        <p className="font-semibold text-gray-900">{lead.lead_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <p className="font-semibold text-gray-900">{lead.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-semibold text-gray-900">{lead.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-semibold text-gray-900">{lead.email || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Phone</p>
                                        <p className="font-semibold text-gray-900">{lead.phone || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Source</p>
                                        <p className="font-semibold text-gray-900">{lead.source || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Preferred Contact</p>
                                        <p className="font-semibold text-gray-900">{lead.preferred_contact}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Preferred Client Type</p>
                                        <p className="font-semibold text-gray-900">{lead.preferred_client_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Follow-up Date</p>
                                        <p className="font-semibold text-gray-900">
                                            {lead.follow_up_date ? formatDateTime(lead.follow_up_date) : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Created</p>
                                        <p className="font-semibold text-gray-900">{formatDateTime(lead.created_at)}</p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-gray-500 text-sm">Notes</p>
                                    <p className="font-semibold text-gray-900 text-sm mt-1 whitespace-pre-wrap">{lead.notes || "—"}</p>
                                </div>
                            </section>

                            <section className="rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Workflow</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={(): void => onEdit(lead)}
                                        className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
                                    >
                                        Edit Lead
                                    </button>
                                    {lead.status === "New" && (
                                        <button
                                            type="button"
                                            onClick={(): void => onMarkContacted(lead)}
                                            disabled={isMarkingContacted}
                                            className="rounded-md border border-brand-blue bg-brand-blue/5 px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue/10 disabled:opacity-50"
                                        >
                                            {isMarkingContacted ? "Saving..." : "Mark Contacted"}
                                        </button>
                                    )}
                                    {(lead.status === "New" || lead.status === "Contacted") && (
                                        <button
                                            type="button"
                                            onClick={(): void => onQualify(lead)}
                                            disabled={isQualifying}
                                            className="rounded-md bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-black disabled:opacity-50"
                                        >
                                            {isQualifying ? "Qualifying..." : "Qualify Lead"}
                                        </button>
                                    )}
                                    {lead.status !== "Converted" && lead.status !== "Lost" && (
                                        <button
                                            type="button"
                                            onClick={(): void => onMarkLost(lead)}
                                            disabled={isMarkingLost}
                                            className="rounded-md border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                                        >
                                            {isMarkingLost ? "Marking..." : "Mark as Lost"}
                                        </button>
                                    )}
                                    {!shouldShowConvert && lead.status !== "Lost" && (
                                        <p className="text-sm text-gray-600">Lead is already converted.</p>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {confirmingDelete ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm text-gray-700 w-full">Delete this lead permanently?</p>
                                            <button
                                                type="button"
                                                onClick={(): void => { onDelete(lead); setConfirmingDelete(false); }}
                                                disabled={isDeleting}
                                                className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-50"
                                            >
                                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(): void => setConfirmingDelete(false)}
                                                disabled={isDeleting}
                                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(): void => setConfirmingDelete(true)}
                                            className="rounded-md border border-brand-red/40 px-4 py-2 text-sm font-semibold text-brand-red hover:bg-brand-red/5"
                                        >
                                            Delete Lead
                                        </button>
                                    )}
                                </div>
                            </section>

                            {shouldShowConvert && (
                                <section className="rounded-lg border border-gray-200 p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Convert to Client</h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Conversion requires at least one approved quote linked to this lead.
                                    </p>

                                    <form onSubmit={handleSubmitConvert} className="space-y-4 mt-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client Type</label>
                                            <select
                                                value={clientType}
                                                onChange={handleClientTypeChange}
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            >
                                                <option value="B2C">B2C</option>
                                                <option value="B2B">B2B</option>
                                            </select>
                                        </div>

                                        {clientType === "B2B" && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</label>
                                                        <input
                                                            type="text"
                                                            value={company}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setCompany(event.target.value)}
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</label>
                                                        <input
                                                            type="text"
                                                            value={industry}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setIndustry(event.target.value)}
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">VAT / Tax ID</label>
                                                        <input
                                                            type="text"
                                                            value={vatTaxId}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setVatTaxId(event.target.value)}
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">KRA PIN</label>
                                                        <input
                                                            type="text"
                                                            value={kraPin}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setKraPin(event.target.value)}
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Contact Name</label>
                                                        <input
                                                            type="text"
                                                            value={contactName}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setContactName(event.target.value)}
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Contact Email</label>
                                                        <input
                                                            type="email"
                                                            value={contactEmail}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setContactEmail(event.target.value)}
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Contact Phone</label>
                                                        <input
                                                            type="text"
                                                            value={contactPhone}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setContactPhone(event.target.value)}
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Contact Role</label>
                                                        <input
                                                            type="text"
                                                            value={contactRole}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setContactRole(event.target.value)}
                                                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isConverting}
                                            className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                        >
                                            {isConverting ? "Converting..." : "Convert Lead"}
                                        </button>
                                    </form>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}
