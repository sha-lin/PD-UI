import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { VendorFormValues } from "@/types/vendors";

interface VendorFormProps {
    values: VendorFormValues;
    onValuesChange: (values: VendorFormValues) => void;
    onSubmit: () => void;
    onCancel: () => void;
    submitLabel: string;
    isSubmitting: boolean;
}

export default function VendorForm({
    values,
    onValuesChange,
    onSubmit,
    onCancel,
    submitLabel,
    isSubmitting,
}: VendorFormProps): ReactElement {
    const renderRequiredLabel = (text: string): ReactElement => (
        <span className="inline-flex items-center gap-1">
            <span>{text}</span>
            <span className="text-brand-red">*</span>
        </span>
    );

    const updateField = <K extends keyof VendorFormValues>(field: K, value: VendorFormValues[K]): void => {
        onValuesChange({
            ...values,
            [field]: value,
        });
    };

    const handleTextChange = (field: keyof VendorFormValues) => (event: ChangeEvent<HTMLInputElement>): void => {
        updateField(field, event.target.value as VendorFormValues[keyof VendorFormValues]);
    };

    const handleTextareaChange = (field: keyof VendorFormValues) => (event: ChangeEvent<HTMLTextAreaElement>): void => {
        updateField(field, event.target.value as VendorFormValues[keyof VendorFormValues]);
    };

    const handleCheckboxChange = (field: keyof VendorFormValues) => (event: ChangeEvent<HTMLInputElement>): void => {
        updateField(field, event.target.checked as VendorFormValues[keyof VendorFormValues]);
    };

    const handleNumberChange = (field: keyof VendorFormValues) => (event: ChangeEvent<HTMLInputElement>): void => {
        updateField(field, Number(event.target.value) as VendorFormValues[keyof VendorFormValues]);
    };

    return (
        <form
            className="space-y-6"
            onSubmit={(event: FormEvent<HTMLFormElement>): void => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-xs text-gray-500 mt-2">Who the vendor is and how to reach them.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {renderRequiredLabel("Vendor Name")}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Business name as it should appear in lists.</p>
                        <input
                            type="text"
                            value={values.name}
                            onChange={handleTextChange("name")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Person</label>
                        <p className="text-xs text-gray-500 mt-1">Main person we call or email.</p>
                        <input
                            type="text"
                            value={values.contact_person}
                            onChange={handleTextChange("contact_person")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {renderRequiredLabel("Email")}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Used for quotes, updates, and invoices.</p>
                        <input
                            type="email"
                            value={values.email}
                            onChange={handleTextChange("email")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {renderRequiredLabel("Phone Number")}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Direct phone number for quick contact.</p>
                        <input
                            type="tel"
                            value={values.phone}
                            onChange={handleTextChange("phone")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business Address</label>
                        <p className="text-xs text-gray-500 mt-1">Location used for deliveries or visits.</p>
                        <textarea
                            value={values.business_address}
                            onChange={handleTextareaChange("business_address")}
                            rows={3}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
                <p className="text-xs text-gray-500 mt-2">How the vendor is paid and recorded.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tax PIN</label>
                        <p className="text-xs text-gray-500 mt-1">Optional tax identifier for invoices.</p>
                        <input
                            type="text"
                            value={values.tax_pin}
                            onChange={handleTextChange("tax_pin")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Terms</label>
                        <p className="text-xs text-gray-500 mt-1">Example: Net 7, Net 14, Prepaid.</p>
                        <input
                            type="text"
                            value={values.payment_terms}
                            onChange={handleTextChange("payment_terms")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Method</label>
                        <p className="text-xs text-gray-500 mt-1">Example: Bank transfer, Mobile money.</p>
                        <input
                            type="text"
                            value={values.payment_method}
                            onChange={handleTextChange("payment_method")}
                            placeholder="Bank transfer, Mobile money"
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Services</h2>
                <p className="text-xs text-gray-500 mt-2">What this vendor can produce.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Services</label>
                        <p className="text-xs text-gray-500 mt-1">List services separated by commas.</p>
                        <textarea
                            value={values.services}
                            onChange={handleTextareaChange("services")}
                            rows={2}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specialization</label>
                        <p className="text-xs text-gray-500 mt-1">What they do best or most often.</p>
                        <textarea
                            value={values.specialization}
                            onChange={handleTextareaChange("specialization")}
                            rows={2}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Capacity</h2>
                <p className="text-xs text-gray-500 mt-2">How much and how fast the vendor can deliver.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Minimum Order (KES)</label>
                        <p className="text-xs text-gray-500 mt-1">Smallest order they accept.</p>
                        <input
                            type="text"
                            value={values.minimum_order}
                            onChange={handleTextChange("minimum_order")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lead Time</label>
                        <p className="text-xs text-gray-500 mt-1">Typical completion time, e.g. 5 days.</p>
                        <input
                            type="text"
                            value={values.lead_time}
                            onChange={handleTextChange("lead_time")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Max Concurrent Jobs</label>
                        <p className="text-xs text-gray-500 mt-1">How many jobs they can handle at once.</p>
                        <input
                            type="number"
                            min={1}
                            value={values.max_concurrent_jobs}
                            onChange={handleNumberChange("max_concurrent_jobs")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                        <input
                            type="checkbox"
                            checked={values.rush_capable}
                            onChange={handleCheckboxChange("rush_capable")}
                            className="h-4 w-4"
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Rush capable</div>
                            <p className="text-xs text-gray-500">Can this vendor handle rush orders?</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Status</h2>
                <p className="text-xs text-gray-500 mt-2">Control visibility and availability.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={values.active}
                            onChange={handleCheckboxChange("active")}
                            className="h-4 w-4"
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Active</div>
                            <p className="text-xs text-gray-500">Active vendors show up in lists.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={values.is_available}
                            onChange={handleCheckboxChange("is_available")}
                            className="h-4 w-4"
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Available</div>
                            <p className="text-xs text-gray-500">Can accept new work right now.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Internal Notes</h2>
                <p className="text-xs text-gray-500 mt-2">Private notes for your team.</p>
                <textarea
                    value={values.internal_notes}
                    onChange={handleTextareaChange("internal_notes")}
                    rows={4}
                    className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                >
                    {isSubmitting ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
