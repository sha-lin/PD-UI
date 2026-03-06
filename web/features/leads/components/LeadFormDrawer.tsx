"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { leadFormSchema } from "@/lib/validations/lead";
import type { Lead, LeadSource, LeadStatus } from "@/types/leads";

interface LeadFormDrawerProps {
    isOpen: boolean;
    isSubmitting: boolean;
    mode: "create" | "edit";
    lead: Lead | null;
    onClose: () => void;
    onSubmit: (payload: Partial<Lead>, leadId?: number) => void;
}

interface LeadFormState {
    name: string;
    email: string;
    phone: string;
    source: LeadSource | "";
    product_interest: string;
    preferred_contact: "Email" | "Phone" | "WhatsApp";
    preferred_client_type: "B2B" | "B2C";
    follow_up_date: string;
    status: LeadStatus;
    notes: string;
}

const initialFormState: LeadFormState = {
    name: "",
    email: "",
    phone: "",
    source: "",
    product_interest: "",
    preferred_contact: "Email",
    preferred_client_type: "B2B",
    follow_up_date: "",
    status: "New",
    notes: "",
};

export default function LeadFormDrawer({
    isOpen,
    isSubmitting,
    mode,
    lead,
    onClose,
    onSubmit,
}: LeadFormDrawerProps): ReactElement | null {
    const [formState, setFormState] = useState<LeadFormState>(initialFormState);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect((): void => {
        if (!isOpen) {
            return;
        }

        if (mode === "edit" && lead !== null) {
            setFormState({
                name: lead.name,
                email: lead.email || "",
                phone: lead.phone,
                source: lead.source,
                product_interest: lead.product_interest || "",
                preferred_contact: lead.preferred_contact,
                preferred_client_type: lead.preferred_client_type,
                follow_up_date: lead.follow_up_date || "",
                status: lead.status as LeadStatus,
                notes: lead.notes || "",
            });
            return;
        }

        setFormState(initialFormState);
        setFieldErrors({});
    }, [isOpen, mode, lead]);

    useEffect(() => {
        const result = leadFormSchema.safeParse(formState);

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
        return mode === "create" ? "Add New Lead" : "Edit Lead";
    }, [mode]);

    if (!isOpen) {
        return null;
    }

    const handleInputChange = (field: keyof LeadFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
        setFormState((currentState: LeadFormState): LeadFormState => ({
            ...currentState,
            [field]: event.target.value,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const result = leadFormSchema.safeParse(formState);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const firstError = Object.values(errors)[0]?.[0];
            toast.error(firstError || "Please check the form for errors");
            return;
        }

        const payload: Partial<Lead> = {
            name: formState.name.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
            source: formState.source || undefined,
            product_interest: formState.product_interest.trim(),
            preferred_contact: formState.preferred_contact,
            preferred_client_type: formState.preferred_client_type,
            follow_up_date: formState.follow_up_date || null,
            status: formState.status,
            notes: formState.notes.trim(),
        };

        if (mode === "edit" && lead !== null) {
            onSubmit(payload, lead.id);
            return;
        }

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
            <aside className="h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Capture prospect information and track sales pipeline
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
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name *</label>
                                <p className="text-xs text-gray-500 mt-0.5">Full name of the prospect</p>
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
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                <p className="text-xs text-gray-500 mt-0.5">Primary email address</p>
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
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone *</label>
                                <p className="text-xs text-gray-500 mt-0.5">Contact number with country code</p>
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
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preferred Contact</label>
                                <p className="text-xs text-gray-500 mt-0.5">Best way to reach them</p>
                                <select
                                    value={formState.preferred_contact}
                                    onChange={handleInputChange("preferred_contact")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="Email">Email</option>
                                    <option value="Phone">Phone</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preferred Client Type</label>
                                <p className="text-xs text-gray-500 mt-0.5">Expected conversion type</p>
                                <select
                                    value={formState.preferred_client_type}
                                    onChange={handleInputChange("preferred_client_type")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="B2B">B2B Business</option>
                                    <option value="B2C">B2C Retail</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Lead Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</label>
                                <p className="text-xs text-gray-500 mt-0.5">How they found us</p>
                                <select
                                    value={formState.source}
                                    onChange={handleInputChange("source")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="">Select source</option>
                                    <option value="Website">Website</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Cold Call">Cold Call</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Event">Event</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                                <p className="text-xs text-gray-500 mt-0.5">Current lead status</p>
                                <select
                                    value={formState.status}
                                    onChange={handleInputChange("status")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product Interest</label>
                                <p className="text-xs text-gray-500 mt-0.5">What products they're interested in</p>
                                <input
                                    type="text"
                                    value={formState.product_interest}
                                    onChange={handleInputChange("product_interest")}
                                    placeholder="e.g., Business Cards, Banners"
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Follow-up Date</label>
                                <p className="text-xs text-gray-500 mt-0.5">When to follow up with this lead</p>
                                <input
                                    type="date"
                                    value={formState.follow_up_date}
                                    onChange={handleInputChange("follow_up_date")}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                                <p className="text-xs text-gray-500 mt-0.5">Additional information or context</p>
                                <textarea
                                    value={formState.notes}
                                    onChange={handleInputChange("notes")}
                                    rows={4}
                                    placeholder="Enter any relevant notes about this lead..."
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </section>

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
                            {isSubmitting ? "Saving..." : mode === "create" ? "Create Lead" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
}
