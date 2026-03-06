"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactElement, FormEvent, ChangeEvent } from "react";
import VendorLayout from "@/components/vendor/vendor-layout";
import { fetchCurrentVendor, updateVendorSelf } from "@/services/vendors";
import type { Vendor, UpdateVendorPayload } from "@/types/vendors";
import { Building2, User, Mail, Phone, MapPin, FileText, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface FieldProps {
    label: string;
    children: ReactElement;
}

function Field({ label, children }: FieldProps): ReactElement {
    return (
        <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
            {children}
        </div>
    );
}

function inputClass(disabled = false): string {
    return `w-full rounded-md border px-3 py-2 text-sm ${disabled ? "bg-gray-50 text-gray-500 border-gray-200" : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
        }`;
}

export default function VendorSettingsPage(): ReactElement {
    const queryClient = useQueryClient();

    const { data: vendor, isLoading } = useQuery({
        queryKey: ["current-vendor"],
        queryFn: fetchCurrentVendor,
        staleTime: 5 * 60 * 1000,
    });

    const [form, setForm] = useState<Partial<UpdateVendorPayload> | null>(null);

    const resolvedForm = form ?? (vendor ? buildForm(vendor) : null);

    const mutation = useMutation({
        mutationFn: (payload: UpdateVendorPayload) => updateVendorSelf(payload),
        onSuccess: (updated: Vendor) => {
            queryClient.setQueryData(["current-vendor"], updated);
            setForm(null);
            toast.success("Changes saved successfully.");
        },
        onError: () => {
            toast.error("Unable to save changes. Please try again.");
        },
    });

    function buildForm(v: Vendor): Partial<UpdateVendorPayload> {
        return {
            contact_person: v.contact_person ?? "",
            phone: v.phone,
            business_address: v.business_address ?? "",
            tax_pin: v.tax_pin ?? "",
            payment_terms: v.payment_terms ?? "",
            payment_method: v.payment_method ?? "",
            services: v.services ?? "",
            specialization: v.specialization ?? "",
            lead_time: v.lead_time ?? "",
            rush_capable: v.rush_capable,
            is_available: v.is_available,
            max_concurrent_jobs: v.max_concurrent_jobs,
        };
    }

    function set<K extends keyof UpdateVendorPayload>(key: K, value: UpdateVendorPayload[K]): void {
        setForm((prev) => ({
            ...(prev ?? (vendor ? buildForm(vendor) : {})),
            [key]: value,
        }));
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        if (!resolvedForm || !vendor) return;
        setErrorMsg(null);
        mutation.mutate(resolvedForm as UpdateVendorPayload);
    }

    if (isLoading || !vendor || !resolvedForm) {
        return (
            <VendorLayout>
                <header className="bg-white shadow">
                    <div className="px-4 sm:px-8 py-4">
                        <h1 className="text-2xl font-bold text-brand-black">Settings</h1>
                    </div>
                </header>
                <main className="p-4 sm:p-8 space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4">
                            <div className="h-5 bg-gray-200 rounded w-48" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="h-10 bg-gray-100 rounded" />
                                <div className="h-10 bg-gray-100 rounded" />
                                <div className="h-10 bg-gray-100 rounded" />
                                <div className="h-10 bg-gray-100 rounded" />
                            </div>
                        </div>
                    ))}
                </main>
            </VendorLayout>
        );
    }

    return (
        <VendorLayout>
            <header className="bg-white shadow">
                <div className="px-4 sm:px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Settings</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage your company profile and availability</p>
                </div>
            </header>

            <main className="p-4 sm:p-8 max-w-3xl space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Info — read-only */}
                    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-brand-blue font-semibold">
                            <Building2 className="w-5 h-5" />
                            Company Information
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Company Name">
                                <input className={inputClass(true)} value={vendor.name} disabled readOnly />
                            </Field>
                            <Field label="Email">
                                <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-500 truncate">{vendor.email}</span>
                                </div>
                            </Field>
                        </div>
                        <p className="text-xs text-gray-400">Company name and email can only be changed by Print Duka admin.</p>
                    </section>

                    {/* Contact Details */}
                    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-brand-blue font-semibold">
                            <User className="w-5 h-5" />
                            Contact Details
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Contact Person">
                                <div className="flex items-center gap-2 rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue">
                                    <User className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                                    <input
                                        className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none"
                                        value={(resolvedForm.contact_person as string) ?? ""}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => set("contact_person", e.target.value)}
                                    />
                                </div>
                            </Field>
                            <Field label="Phone">
                                <div className="flex items-center gap-2 rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue">
                                    <Phone className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                                    <input
                                        className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none"
                                        value={(resolvedForm.phone as string) ?? ""}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => set("phone", e.target.value)}
                                    />
                                </div>
                            </Field>
                            <Field label="Business Address">
                                <div className="flex items-start gap-2 rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue">
                                    <MapPin className="w-4 h-4 text-gray-400 ml-3 mt-2.5 flex-shrink-0" />
                                    <textarea
                                        rows={2}
                                        className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none resize-none"
                                        value={(resolvedForm.business_address as string) ?? ""}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => set("business_address", e.target.value)}
                                    />
                                </div>
                            </Field>
                            <Field label="Tax PIN">
                                <div className="flex items-center gap-2 rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue">
                                    <FileText className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                                    <input
                                        className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none"
                                        value={(resolvedForm.tax_pin as string) ?? ""}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => set("tax_pin", e.target.value)}
                                    />
                                </div>
                            </Field>
                        </div>
                    </section>

                    {/* Services & Specialization */}
                    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-brand-blue font-semibold">
                            <FileText className="w-5 h-5" />
                            Services
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <Field label="Services Offered (comma-separated)">
                                <textarea
                                    rows={2}
                                    className={inputClass()}
                                    placeholder="e.g. Offset Printing, Digital Printing, Large Format"
                                    value={(resolvedForm.services as string) ?? ""}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => set("services", e.target.value)}
                                />
                            </Field>
                            <Field label="Specialization">
                                <textarea
                                    rows={2}
                                    className={inputClass()}
                                    value={(resolvedForm.specialization as string) ?? ""}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => set("specialization", e.target.value)}
                                />
                            </Field>
                        </div>
                    </section>

                    {/* Availability & Capacity */}
                    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-brand-blue font-semibold">
                            <Clock className="w-5 h-5" />
                            Availability & Capacity
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Standard Lead Time">
                                <div className="flex items-center gap-2 rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue">
                                    <Clock className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                                    <input
                                        className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none"
                                        placeholder="e.g. 5 days"
                                        value={(resolvedForm.lead_time as string) ?? ""}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => set("lead_time", e.target.value)}
                                    />
                                </div>
                            </Field>
                            <Field label="Max Concurrent Jobs">
                                <input
                                    type="number"
                                    min={1}
                                    className={inputClass()}
                                    value={(resolvedForm.max_concurrent_jobs as number) ?? 1}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("max_concurrent_jobs", Number(e.target.value))}
                                />
                            </Field>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div
                                    onClick={() => set("is_available", !resolvedForm.is_available)}
                                    className={`relative w-10 h-6 rounded-full transition-colors ${resolvedForm.is_available ? "bg-brand-blue" : "bg-gray-300"}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${resolvedForm.is_available ? "translate-x-4" : "translate-x-0"}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Available for Jobs</p>
                                    <p className="text-xs text-gray-500">Toggle to pause incoming job assignments</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div
                                    onClick={() => set("rush_capable", !resolvedForm.rush_capable)}
                                    className={`relative w-10 h-6 rounded-full transition-colors ${resolvedForm.rush_capable ? "bg-brand-yellow" : "bg-gray-300"}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${resolvedForm.rush_capable ? "translate-x-4" : "translate-x-0"}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                        Rush Capable <Zap className="w-3.5 h-3.5 text-brand-yellow" />
                                    </p>
                                    <p className="text-xs text-gray-500">Can accept urgent / rush orders</p>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Payment */}
                    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-brand-blue font-semibold">
                            <FileText className="w-5 h-5" />
                            Payment Preferences
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Payment Terms">
                                <select
                                    className={inputClass()}
                                    value={(resolvedForm.payment_terms as string) ?? ""}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => set("payment_terms", e.target.value)}
                                >
                                    <option value="">Select terms</option>
                                    <option value="immediate">Immediate</option>
                                    <option value="net_7">Net 7</option>
                                    <option value="net_14">Net 14</option>
                                    <option value="net_30">Net 30</option>
                                    <option value="net_60">Net 60</option>
                                </select>
                            </Field>
                            <Field label="Payment Method">
                                <select
                                    className={inputClass()}
                                    value={(resolvedForm.payment_method as string) ?? ""}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => set("payment_method", e.target.value)}
                                >
                                    <option value="">Select method</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="mpesa">M-Pesa</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </Field>
                        </div>
                    </section>

                    <div className="flex justify-end pb-8">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-6 py-2.5 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {mutation.isPending ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </main>
        </VendorLayout>
    );
}
