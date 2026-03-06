import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { Plus, X, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { contactSchema, clientFormSchema } from "@/lib/validations/client";
import type {
    Client,
    ClientFormPayload,
    ClientPaymentTerms,
    ClientPreferredChannel,
    ClientRiskRating,
    ClientStatus,
    ClientType,
} from "@/types/clients";

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
}

interface BrandAsset {
    id: string;
    file: File;
    asset_type: string;
}

interface ComplianceDoc {
    id: string;
    file: File;
    document_type: string;
    expiry_date: string;
}

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
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
    const [complianceDocs, setComplianceDocs] = useState<ComplianceDoc[]>([]);
    const [showContacts, setShowContacts] = useState(false);
    const [showBrand, setShowBrand] = useState(false);
    const [showCompliance, setShowCompliance] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isFormValid, setIsFormValid] = useState(false);

    const [newContact, setNewContact] = useState({ name: "", email: "", phone: "", role: "None" });

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
        setContacts([]);
        setBrandAssets([]);
        setComplianceDocs([]);
        setNewContact({ name: "", email: "", phone: "", role: "None" });
        setFieldErrors({});
    }, [isOpen, mode, client]);

    useEffect(() => {
        const validationData = {
            client_type: formState.clientType,
            name: formState.name,
            phone: formState.phone,
            email: formState.email,
            status: formState.status,
            preferred_channel: formState.preferredChannel,
            lead_source: formState.leadSource,
            address: formState.address,
            delivery_address: formState.deliveryAddress,
            delivery_instructions: formState.deliveryInstructions,
            payment_terms: formState.paymentTerms,
            ...(formState.clientType === "B2B" && {
                company: formState.company,
                industry: formState.industry,
                vat_tax_id: formState.vatTaxId,
                kra_pin: formState.kraPin,
                credit_limit: Number(formState.creditLimit || "0"),
                default_markup: Number(formState.defaultMarkup || "0"),
                risk_rating: formState.riskRating,
                is_reseller: formState.isReseller,
            }),
        };

        const result = clientFormSchema.safeParse(validationData);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const errorMap: Record<string, string> = {};
            Object.entries(errors).forEach(([key, messages]) => {
                if (messages && messages.length > 0) {
                    errorMap[key] = messages[0];
                }
            });
            setFieldErrors(errorMap);
            setIsFormValid(false);
        } else {
            setFieldErrors({});
            setIsFormValid(true);
        }
    }, [formState]);

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

    const handleAddContact = () => {
        const result = contactSchema.safeParse(newContact);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const firstError = Object.values(errors)[0]?.[0];
            toast.error(firstError || "Invalid contact information");
            return;
        }

        const contact: Contact = {
            id: Date.now().toString(),
            ...newContact,
        };
        setContacts([...contacts, contact]);
        setNewContact({ name: "", email: "", phone: "", role: "None" });
        toast.success("Contact added successfully");
    };

    const handleRemoveContact = (id: string) => {
        setContacts(contacts.filter((c) => c.id !== id));
    };

    const handleBrandFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const assetType = (document.getElementById("brand_asset_type") as HTMLSelectElement)?.value || "Other";
        const newAssets: BrandAsset[] = Array.from(files).map((file) => ({
            id: `${file.name}_${file.size}_${Date.now()}`,
            file,
            asset_type: assetType,
        }));
        setBrandAssets([...brandAssets, ...newAssets]);
        e.target.value = "";
        toast.success(`${files.length} brand asset${files.length > 1 ? 's' : ''} added`);
    };

    const handleRemoveBrandAsset = (id: string) => {
        setBrandAssets(brandAssets.filter((a) => a.id !== id));
    };

    const handleComplianceFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const docType = (document.getElementById("compliance_doc_type") as HTMLSelectElement)?.value || "Other";
        const expiryDate = (document.getElementById("compliance_expiry_date") as HTMLInputElement)?.value || "";

        const newDocs: ComplianceDoc[] = Array.from(files).map((file) => ({
            id: `${file.name}_${file.size}_${Date.now()}`,
            file,
            document_type: docType,
            expiry_date: expiryDate,
        }));
        setComplianceDocs([...complianceDocs, ...newDocs]);
        e.target.value = "";
        toast.success(`${files.length} compliance document${files.length > 1 ? 's' : ''} added`);
    };

    const handleRemoveComplianceDoc = (id: string) => {
        setComplianceDocs(complianceDocs.filter((d) => d.id !== id));
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

        const validationData = {
            client_type: formState.clientType,
            name: formState.name,
            phone: formState.phone,
            email: formState.email,
            status: formState.status,
            preferred_channel: formState.preferredChannel,
            lead_source: formState.leadSource,
            address: formState.address,
            delivery_address: formState.deliveryAddress,
            delivery_instructions: formState.deliveryInstructions,
            payment_terms: formState.paymentTerms,
            ...(formState.clientType === "B2B" && {
                company: formState.company,
                industry: formState.industry,
                vat_tax_id: formState.vatTaxId,
                kra_pin: formState.kraPin,
                credit_limit: Number(formState.creditLimit || "0"),
                default_markup: Number(formState.defaultMarkup || "0"),
                risk_rating: formState.riskRating,
                is_reseller: formState.isReseller,
            }),
        };

        const result = clientFormSchema.safeParse(validationData);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const firstError = Object.values(errors)[0]?.[0];
            toast.error(firstError || "Please check the form for errors");
            return;
        }

        const payload = buildPayload();

        console.log("Contacts:", contacts);
        console.log("Brand Assets:", brandAssets);
        console.log("Compliance Docs:", complianceDocs);

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
                        <p className="text-sm text-gray-600 mt-1">
                            {formState.clientType === "B2B"
                                ? "Complete client profile, contacts, brand assets, and compliance"
                                : "Capture core client information"}
                        </p>
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
                                <p className="text-xs text-gray-500 mt-0.5">Business-to-Business or Business-to-Consumer</p>
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
                                <p className="text-xs text-gray-500 mt-0.5">Current account status</p>
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
                                <p className="text-xs text-gray-500 mt-0.5">Primary contact person's full name</p>
                                <input
                                    type="text"
                                    value={formState.name}
                                    onChange={handleInputChange("name")}
                                    required
                                    className={`mt-2 w-full rounded-md border px-3 py-2 text-sm ${fieldErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                        }`}
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                                <p className="text-xs text-gray-500 mt-0.5">Primary contact number with country code</p>
                                <input
                                    type="text"
                                    value={formState.phone}
                                    onChange={handleInputChange("phone")}
                                    required
                                    className={`mt-2 w-full rounded-md border px-3 py-2 text-sm ${fieldErrors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                        }`}
                                />
                                {fieldErrors.phone && (
                                    <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                <p className="text-xs text-gray-500 mt-0.5">Primary email address for communication</p>
                                <input
                                    type="email"
                                    value={formState.email}
                                    onChange={handleInputChange("email")}
                                    className={`mt-2 w-full rounded-md border px-3 py-2 text-sm ${fieldErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                        }`}
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lead Source</label>
                                <p className="text-xs text-gray-500 mt-0.5">How this client found us (e.g., Website, Referral)</p>
                                <input
                                    type="text"
                                    value={formState.leadSource}
                                    onChange={handleInputChange("leadSource")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                                <p className="text-xs text-gray-500 mt-0.5">Physical business or residential address</p>
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
                                <p className="text-xs text-gray-500 mt-0.5">Best way to reach this client</p>
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
                                <p className="text-xs text-gray-500 mt-0.5">Where to deliver completed orders</p>
                                <input
                                    type="text"
                                    value={formState.deliveryAddress}
                                    onChange={handleInputChange("deliveryAddress")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Instructions</label>
                                <p className="text-xs text-gray-500 mt-0.5">Special delivery requirements or notes</p>
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
                                    <p className="text-xs text-gray-500 mt-0.5">Registered business name</p>
                                    <input
                                        type="text"
                                        value={formState.company}
                                        onChange={handleInputChange("company")}
                                        className={`mt-2 w-full rounded-md border px-3 py-2 text-sm ${fieldErrors.company ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {fieldErrors.company && (
                                        <p className="text-xs text-red-600 mt-1">{fieldErrors.company}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</label>
                                    <p className="text-xs text-gray-500 mt-0.5">Business sector or industry type</p>
                                    <input
                                        type="text"
                                        value={formState.industry}
                                        onChange={handleInputChange("industry")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">VAT / Tax ID</label>
                                    <p className="text-xs text-gray-500 mt-0.5">Value Added Tax identification number</p>
                                    <input
                                        type="text"
                                        value={formState.vatTaxId}
                                        onChange={handleInputChange("vatTaxId")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">KRA PIN</label>
                                    <p className="text-xs text-gray-500 mt-0.5">Kenya Revenue Authority PIN number</p>
                                    <input
                                        type="text"
                                        value={formState.kraPin}
                                        onChange={handleInputChange("kraPin")}
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Terms</label>
                                    <p className="text-xs text-gray-500 mt-0.5">When payment is due after invoice</p>
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
                                    <p className="text-xs text-gray-500 mt-0.5">Maximum credit amount in KES</p>
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
                                    <p className="text-xs text-gray-500 mt-0.5">Profit margin percentage on quotes</p>
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
                                    <p className="text-xs text-gray-500 mt-0.5">Credit risk assessment level</p>
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

                    {formState.clientType === "B2B" && (
                        <>
                            <section className="rounded-lg border border-gray-200 p-4">
                                <button
                                    type="button"
                                    onClick={() => setShowContacts(!showContacts)}
                                    className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 uppercase tracking-wide"
                                >
                                    <span>Contacts (Optional)</span>
                                    {showContacts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {showContacts && (
                                    <div className="mt-3 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                                                <p className="text-xs text-gray-500 mt-0.5">Contact person's full name</p>
                                                <input
                                                    type="text"
                                                    value={newContact.name}
                                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                                <p className="text-xs text-gray-500 mt-0.5">Contact's email address</p>
                                                <input
                                                    type="email"
                                                    value={newContact.email}
                                                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                                                <p className="text-xs text-gray-500 mt-0.5">Contact's phone number</p>
                                                <input
                                                    type="text"
                                                    value={newContact.phone}
                                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
                                                <p className="text-xs text-gray-500 mt-0.5">What they're responsible for</p>
                                                <select
                                                    value={newContact.role}
                                                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                >
                                                    <option value="None">None</option>
                                                    <option value="Approve Quotes">Approve Quotes</option>
                                                    <option value="Approve Artwork">Approve Artwork</option>
                                                    <option value="Billing Contact">Billing Contact</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddContact}
                                            className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-blue-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Contact
                                        </button>

                                        {contacts.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {contacts.map((contact) => (
                                                    <div key={contact.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                        <div className="text-sm">
                                                            <div className="font-medium">{contact.name}</div>
                                                            <div className="text-gray-600">{contact.email} {contact.phone && `• ${contact.phone}`}</div>
                                                            <div className="text-xs text-gray-500">{contact.role}</div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveContact(contact.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-lg border border-gray-200 p-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBrand(!showBrand)}
                                    className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 uppercase tracking-wide"
                                >
                                    <span>Brand Assets (Optional)</span>
                                    {showBrand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {showBrand && (
                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Asset Type</label>
                                            <p className="text-xs text-gray-500 mt-0.5">Category of brand asset being uploaded</p>
                                            <select
                                                id="brand_asset_type"
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            >
                                                <option value="Logo">Logo</option>
                                                <option value="Brand Guide">Brand Guidelines</option>
                                                <option value="Color Palette">Color Palette</option>
                                                <option value="Font">Font Files</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <label className="cursor-pointer">
                                                <span className="text-sm text-brand-blue font-medium hover:underline">Click to upload</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleBrandFileUpload}
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.svg,.ai"
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, SVG, AI files</p>
                                        </div>

                                        {brandAssets.length > 0 && (
                                            <div className="space-y-2">
                                                {brandAssets.map((asset) => (
                                                    <div key={asset.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                                        <div className="text-sm">
                                                            <div>{asset.file.name}</div>
                                                            <div className="text-xs text-gray-500">{asset.asset_type} • {(asset.file.size / 1024).toFixed(1)} KB</div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBrandAsset(asset.id)}
                                                            className="text-red-600 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-lg border border-gray-200 p-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCompliance(!showCompliance)}
                                    className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 uppercase tracking-wide"
                                >
                                    <span>Compliance Documents (Optional)</span>
                                    {showCompliance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {showCompliance && (
                                    <div className="mt-3 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Document Type</label>
                                                <p className="text-xs text-gray-500 mt-0.5">Legal or regulatory document category</p>
                                                <select
                                                    id="compliance_doc_type"
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                >
                                                    <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                                                    <option value="KRA Pin Certificate">KRA Pin Certificate</option>
                                                    <option value="PO Terms">PO Terms</option>
                                                    <option value="NDA">NDA</option>
                                                    <option value="Other">Other Legal Document</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expiry Date (Optional)</label>
                                                <p className="text-xs text-gray-500 mt-0.5">When this document expires</p>
                                                <input
                                                    id="compliance_expiry_date"
                                                    type="date"
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <label className="cursor-pointer">
                                                <span className="text-sm text-brand-blue font-medium hover:underline">Click to upload</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleComplianceFileUpload}
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG files</p>
                                        </div>

                                        {complianceDocs.length > 0 && (
                                            <div className="space-y-2">
                                                {complianceDocs.map((doc) => (
                                                    <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                                        <div className="text-sm">
                                                            <div>{doc.file.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {doc.document_type} • {Math.round(doc.file.size / 1024)} KB
                                                                {doc.expiry_date && ` • Expires: ${doc.expiry_date}`}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveComplianceDoc(doc.id)}
                                                            className="text-red-600 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        </>
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
                            disabled={isSubmitting || !isFormValid}
                            className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : mode === "create" ? "Create Client" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
}
