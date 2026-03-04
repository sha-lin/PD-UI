import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import type {
    Client,
    ClientFormPayload,
    ClientPaymentTerms,
    ClientPreferredChannel,
    ClientRiskRating,
    ClientStatus,
    ClientType,
} from "@/types/clients";

interface ClientFormDrawerProps {
    isOpen: boolean;
    isSubmitting: boolean;
    mode: "create" | "edit";
    client: Client | null;
    onClose: () => void;
    onSubmit: (payload: ClientFormPayload, clientId?: number) => void;
}

interface ClientFormState {
    clientType: ClientType;
    name: string;
    company: string;
    email: string;
    phone: string;
    vatTaxId: string;
    kraPin: string;
    address: string;
    industry: string;
    paymentTerms: ClientPaymentTerms;
    creditLimit: string;
    defaultMarkup: string;
    riskRating: ClientRiskRating;
    isReseller: boolean;
    deliveryAddress: string;
    deliveryInstructions: string;
    preferredChannel: ClientPreferredChannel;
    leadSource: string;
    status: ClientStatus;
}

const initialFormState: ClientFormState = {
    clientType: "B2B",
    name: "",
    company: "",
    email: "",
    phone: "",
    vatTaxId: "",
    kraPin: "",
    address: "",
    industry: "",
    paymentTerms: "Prepaid",
    creditLimit: "0",
    defaultMarkup: "30",
    riskRating: "Low",
    isReseller: false,
    deliveryAddress: "",
    deliveryInstructions: "",
    preferredChannel: "Email",
    leadSource: "",
    status: "Active",
};

export default function ClientFormDrawer({
    isOpen,
    isSubmitting,
    mode,
    client,
    onClose,
    onSubmit,
}: ClientFormDrawerProps): ReactElement | null {
    const [formState, setFormState] = useState<ClientFormState>(initialFormState);

    useEffect((): void => {
        if (!isOpen) {
            return;
        }

        if (mode === "edit" && client !== null) {
            setFormState({
                clientType: client.client_type,
                name: client.name,
                company: client.company || "",
                email: client.email || "",
                phone: client.phone || "",
                vatTaxId: client.vat_tax_id || "",
                kraPin: client.kra_pin || "",
                address: client.address || "",
                industry: client.industry || "",
                paymentTerms: client.payment_terms,
                creditLimit: String(client.credit_limit ?? "0"),
                defaultMarkup: String(client.default_markup ?? "0"),
                riskRating: client.risk_rating,
                isReseller: Boolean(client.is_reseller),
                deliveryAddress: client.delivery_address || "",
                deliveryInstructions: client.delivery_instructions || "",
                preferredChannel: client.preferred_channel,
                leadSource: client.lead_source || "",
                status: (client.status as ClientStatus) || "Active",
            });
            return;
        }

        setFormState(initialFormState);
    }, [isOpen, mode, client]);

    const title = useMemo((): string => {
        return mode === "create" ? "Add Client" : "Edit Client";
    }, [mode]);

    if (!isOpen) {
        return null;
    }

    const handleInputChange = (field: keyof ClientFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
        setFormState((currentState: ClientFormState): ClientFormState => ({
            ...currentState,
            [field]: event.target.value,
        }));
    };

    const handleCheckboxChange = (field: keyof ClientFormState) => (event: ChangeEvent<HTMLInputElement>): void => {
        setFormState((currentState: ClientFormState): ClientFormState => ({
            ...currentState,
            [field]: event.target.checked,
        }));
    };

    const buildPayload = (): ClientFormPayload => {
        const payload: ClientFormPayload = {
            client_type: formState.clientType,
            name: formState.name.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
            status: formState.status,
            preferred_channel: formState.preferredChannel,
            lead_source: formState.leadSource.trim(),
            address: formState.address.trim(),
            delivery_address: formState.deliveryAddress.trim(),
            delivery_instructions: formState.deliveryInstructions.trim(),
            payment_terms: formState.paymentTerms,
        };

        if (formState.clientType === "B2B") {
            payload.company = formState.company.trim();
            payload.vat_tax_id = formState.vatTaxId.trim();
            payload.kra_pin = formState.kraPin.trim();
            payload.industry = formState.industry.trim();
            payload.credit_limit = Number(formState.creditLimit || "0");
            payload.default_markup = Number(formState.defaultMarkup || "0");
            payload.risk_rating = formState.riskRating;
            payload.is_reseller = formState.isReseller;
        }

        return payload;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const payload = buildPayload();

        if (mode === "edit" && client !== null) {
            onSubmit(payload, client.id);
            return;
        }

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
            <aside className="h-full w-full max-w-3xl bg-white shadow-2xl overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        <p className="text-sm text-gray-600 mt-1">Capture core account and financial settings.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 disabled:opacity-50"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <section className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client Type</label>
                                <select
                                    value={formState.clientType}
                                    onChange={handleInputChange("clientType")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="B2B">B2B</option>
                                    <option value="B2C">B2C</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                                <select
                                    value={formState.status}
                                    onChange={handleInputChange("status")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Dormant">Dormant</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                                <input
                                    type="text"
                                    value={formState.name}
                                    onChange={handleInputChange("name")}
                                    required
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                                <input
                                    type="text"
                                    value={formState.phone}
                                    onChange={handleInputChange("phone")}
                                    required
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                <input
                                    type="email"
                                    value={formState.email}
                                    onChange={handleInputChange("email")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lead Source</label>
                                <input
                                    type="text"
                                    value={formState.leadSource}
                                    onChange={handleInputChange("leadSource")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                                <textarea
                                    value={formState.address}
                                    onChange={handleInputChange("address")}
                                    rows={3}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Delivery and Communication</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preferred Channel</label>
                                <select
                                    value={formState.preferredChannel}
                                    onChange={handleInputChange("preferredChannel")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="Email">Email</option>
                                    <option value="Phone">Phone</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="In-Person">In-Person</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Address</label>
                                <input
                                    type="text"
                                    value={formState.deliveryAddress}
                                    onChange={handleInputChange("deliveryAddress")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Instructions</label>
                                <textarea
                                    value={formState.deliveryInstructions}
                                    onChange={handleInputChange("deliveryInstructions")}
                                    rows={3}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </section>

                    {formState.clientType === "B2B" && (
                        <section className="rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">B2B Finance and Tax</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</label>
                                    <input
                                        type="text"
                                        value={formState.company}
                                        onChange={handleInputChange("company")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</label>
                                    <input
                                        type="text"
                                        value={formState.industry}
                                        onChange={handleInputChange("industry")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">VAT / Tax ID</label>
                                    <input
                                        type="text"
                                        value={formState.vatTaxId}
                                        onChange={handleInputChange("vatTaxId")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">KRA PIN</label>
                                    <input
                                        type="text"
                                        value={formState.kraPin}
                                        onChange={handleInputChange("kraPin")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Terms</label>
                                    <select
                                        value={formState.paymentTerms}
                                        onChange={handleInputChange("paymentTerms")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        <option value="Prepaid">Prepaid</option>
                                        <option value="Net 7">Net 7</option>
                                        <option value="Net 15">Net 15</option>
                                        <option value="Net 30">Net 30</option>
                                        <option value="Net 60">Net 60</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Credit Limit</label>
                                    <input
                                        type="number"
                                        value={formState.creditLimit}
                                        onChange={handleInputChange("creditLimit")}
                                        min="0"
                                        step="0.01"
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Default Markup (%)</label>
                                    <input
                                        type="number"
                                        value={formState.defaultMarkup}
                                        onChange={handleInputChange("defaultMarkup")}
                                        min="0"
                                        step="0.01"
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Risk Rating</label>
                                    <select
                                        value={formState.riskRating}
                                        onChange={handleInputChange("riskRating")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 mt-7">
                                    <input
                                        id="is_reseller"
                                        type="checkbox"
                                        checked={formState.isReseller}
                                        onChange={handleCheckboxChange("isReseller")}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="is_reseller" className="text-sm text-gray-700">
                                        Reseller account
                                    </label>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : mode === "create" ? "Create Client" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
}
