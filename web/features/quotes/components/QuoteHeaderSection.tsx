"use client";

import type { ReactElement } from "react";
import type { Client } from "@/types/clients";
import type { Lead } from "@/types/leads";

interface QuoteHeaderSectionProps {
    clients: Client[];
    leads: Lead[];
    clientsLoading: boolean;
    leadsLoading: boolean;
    clientsError: Error | null;
    leadsError: Error | null;
    clientType: "client" | "lead";
    selectedClientId: number | null;
    selectedLeadId: number | null;
    onCustomerChange: (type: "client" | "lead", id: number | null) => void;
    referenceNumber: string;
    onReferenceChange: (value: string) => void;
    quoteDate: string;
    onQuoteDateChange: (value: string) => void;
    expiryDate: string;
    onExpiryDateChange: (value: string) => void;
    salesperson: string;
}

const fieldClass =
    "w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed";

const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export default function QuoteHeaderSection({
    clients,
    leads,
    clientsLoading,
    leadsLoading,
    clientsError,
    leadsError,
    clientType,
    selectedClientId,
    selectedLeadId,
    onCustomerChange,
    referenceNumber,
    onReferenceChange,
    quoteDate,
    onQuoteDateChange,
    expiryDate,
    onExpiryDateChange,
    salesperson,
}: QuoteHeaderSectionProps): ReactElement {
    const selectValue =
        clientType === "client"
            ? `client-${selectedClientId ?? ""}`
            : `lead-${selectedLeadId ?? ""}`;

    const handleCustomerChange = (value: string): void => {
        if (value.startsWith("client-")) {
            onCustomerChange("client", Number(value.replace("client-", "")) || null);
        } else if (value.startsWith("lead-")) {
            onCustomerChange("lead", Number(value.replace("lead-", "")) || null);
        }
    };

    const isLoadingCustomers = clientsLoading || leadsLoading;
    const hasCustomerError = !!clientsError || !!leadsError;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg border border-gray-200">
            {/* Left — Customer + Reference */}
            <div className="space-y-4">
                <div>
                    <label className={labelClass}>Customer *</label>
                    <select
                        value={selectValue}
                        onChange={(e): void => handleCustomerChange(e.target.value)}
                        required
                        disabled={isLoadingCustomers}
                        className={fieldClass}
                    >
                        <option value="">
                            {isLoadingCustomers
                                ? "Loading…"
                                : hasCustomerError
                                    ? "Error loading customers"
                                    : "Select a customer"}
                        </option>
                        {!clientsLoading && !clientsError && clients.length > 0 && (
                            <optgroup label="Clients">
                                {clients.map((client: Client) => (
                                    <option key={client.id} value={`client-${client.id}`}>
                                        {client.company || client.name} ({client.client_id})
                                    </option>
                                ))}
                            </optgroup>
                        )}
                        {!leadsLoading && !leadsError && leads.length > 0 && (
                            <optgroup label="Qualified Leads">
                                {leads.map((lead: Lead) => (
                                    <option key={lead.id} value={`lead-${lead.id}`}>
                                        {lead.name} ({lead.lead_id})
                                    </option>
                                ))}
                            </optgroup>
                        )}
                        {!isLoadingCustomers &&
                            !hasCustomerError &&
                            clients.length === 0 &&
                            leads.length === 0 && (
                                <option value="" disabled>
                                    No clients or qualified leads found
                                </option>
                            )}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Reference / PO Number</label>
                    <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e): void => onReferenceChange(e.target.value)}
                        placeholder="e.g. PO-12345"
                        className={fieldClass}
                    />
                </div>
            </div>

            {/* Right — Dates + Salesperson */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Quote Date</label>
                        <input
                            type="date"
                            value={quoteDate}
                            onChange={(e): void => onQuoteDateChange(e.target.value)}
                            required
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Expiry Date</label>
                        <input
                            type="date"
                            value={expiryDate}
                            onChange={(e): void => onExpiryDateChange(e.target.value)}
                            className={fieldClass}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Salesperson</label>
                    <input
                        type="text"
                        value={salesperson}
                        readOnly
                        className={`${fieldClass} bg-gray-50 cursor-default`}
                    />
                </div>
            </div>
        </div>
    );
}
